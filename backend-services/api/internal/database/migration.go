package database

import (
	"backend-api/internal/models"
	"fmt"
	"log"

	"gorm.io/gorm"
)

// ManualMigration 手动迁移数据库，处理GORM自动迁移无法处理的约束问题
func ManualMigration() error {
	log.Println("Running manual database migrations...")

	db := GetDB()

	// 首先删除可能存在的旧约束（如果存在）
	err := dropOldConstraints(db)
	if err != nil {
		log.Printf("Warning: Failed to drop old constraints: %v", err)
	}

	// 使用更保守的迁移策略，避免GORM删除不存在的约束
	err = safeAutoMigrate(db)
	if err != nil {
		return fmt.Errorf("failed to safely migrate database: %v", err)
	}

	// 确保必要的索引和约束存在
	err = ensureConstraints(db)
	if err != nil {
		return fmt.Errorf("failed to ensure constraints: %v", err)
	}

	log.Println("Manual database migrations completed successfully")
	return nil
}

// safeAutoMigrate 安全的自动迁移，避免GORM删除不存在的约束
func safeAutoMigrate(db *gorm.DB) error {
	// 检查表是否已经存在
	var usersTableExists bool
	err := db.Raw(`SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = CURRENT_SCHEMA() AND table_name = 'users')`).Scan(&usersTableExists).Error
	if err != nil {
		return fmt.Errorf("failed to check if users table exists: %v", err)
	}

	var walletsTableExists bool
	err = db.Raw(`SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = CURRENT_SCHEMA() AND table_name = 'wallets')`).Scan(&walletsTableExists).Error
	if err != nil {
		return fmt.Errorf("failed to check if wallets table exists: %v", err)
	}

	// 如果表已经存在，跳过AutoMigrate（避免约束删除问题）
	if usersTableExists && walletsTableExists {
		log.Println("Tables already exist, skipping AutoMigrate to avoid constraint issues")
		return nil
	}

	// 如果表不存在，使用AutoMigrate创建表
	log.Println("Creating tables using AutoMigrate...")
	modelsToMigrate := []interface{}{
		&models.User{},
		&models.Wallet{},
	}

	err = db.AutoMigrate(modelsToMigrate...)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate database: %v", err)
	}

	return nil
}

// dropOldConstraints 删除可能存在的旧约束
func dropOldConstraints(db *gorm.DB) error {
	// 列出可能存在的旧约束名称
	oldConstraints := []string{
		"uni_users_email",
		"uni_users_username",
		"uni_wallets_address",
	}

	for _, constraint := range oldConstraints {
		// 检查约束是否存在
		var exists bool
		err := db.Raw(`
			SELECT EXISTS(
				SELECT 1 FROM information_schema.table_constraints 
				WHERE constraint_name = ? AND table_schema = CURRENT_SCHEMA()
			)`, constraint).Scan(&exists).Error

		if err != nil {
			return fmt.Errorf("failed to check constraint existence for %s: %v", constraint, err)
		}

		if exists {
			log.Printf("Dropping old constraint: %s", constraint)
			
			// 尝试删除约束
			err = db.Exec(fmt.Sprintf("ALTER TABLE users DROP CONSTRAINT IF EXISTS %s", constraint)).Error
			if err != nil {
				log.Printf("WARNING: Failed to drop constraint %s: %v", constraint, err)
			}
		}
	}

	return nil
}

// ensureConstraints 确保必要的约束和索引存在
func ensureConstraints(db *gorm.DB) error {
	// 检查并确保users表的email唯一索引存在
	err := ensureUniqueIndex(db, "users", "email", "users_email_key")
	if err != nil {
		return err
	}

	// 检查并确保users表的username唯一索引存在
	err = ensureUniqueIndex(db, "users", "username", "users_username_key")
	if err != nil {
		return err
	}

	// 检查并确保wallets表的复合唯一索引存在
	err = ensureCompositeUniqueIndex(db, "wallets", []string{"wallet_address", "chain_type"}, "wallets_wallet_address_chain_type_key")
	if err != nil {
		return err
	}

	return nil
}

// ensureUniqueIndex 确保单个字段的唯一索引存在
func ensureUniqueIndex(db *gorm.DB, tableName, columnName, indexName string) error {
	var exists bool
	err := db.Raw(`
		SELECT EXISTS(
			SELECT 1 FROM pg_indexes 
			WHERE tablename = ? AND indexname = ? AND schemaname = CURRENT_SCHEMA()
		)`, tableName, indexName).Scan(&exists).Error

	if err != nil {
		return fmt.Errorf("failed to check index existence for %s: %v", indexName, err)
	}

	if !exists {
		log.Printf("Creating missing unique index: %s", indexName)
		err = db.Exec(fmt.Sprintf(
			"CREATE UNIQUE INDEX %s ON %s (%s)",
			indexName, tableName, columnName,
		)).Error
		if err != nil {
			return fmt.Errorf("failed to create index %s: %v", indexName, err)
		}
	}

	return nil
}

// ensureCompositeUniqueIndex 确保复合唯一索引存在
func ensureCompositeUniqueIndex(db *gorm.DB, tableName string, columns []string, indexName string) error {
	var exists bool
	err := db.Raw(`
		SELECT EXISTS(
			SELECT 1 FROM pg_indexes 
			WHERE tablename = ? AND indexname = ? AND schemaname = CURRENT_SCHEMA()
		)`, tableName, indexName).Scan(&exists).Error

	if err != nil {
		return fmt.Errorf("failed to check composite index existence for %s: %v", indexName, err)
	}

	if !exists {
		log.Printf("Creating missing composite unique index: %s", indexName)
		
		columnsStr := ""
		for i, col := range columns {
			if i > 0 {
				columnsStr += ", "
			}
			columnsStr += col
		}
		
		err = db.Exec(fmt.Sprintf(
			"CREATE UNIQUE INDEX %s ON %s (%s)",
			indexName, tableName, columnsStr,
		)).Error
		if err != nil {
			return fmt.Errorf("failed to create composite index %s: %v", indexName, err)
		}
	}

	return nil
}