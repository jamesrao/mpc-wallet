package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strings"
)

// HashPassword 哈希密码（简单实现，使用SHA256和盐）
func HashPassword(password string) (string, error) {
	// 生成随机盐
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	// 计算哈希: sha256(password + salt)
	h := sha256.New()
	h.Write([]byte(password))
	h.Write(salt)
	hash := h.Sum(nil)

	// 编码为字符串格式: hash$salt
	encodedSalt := base64.URLEncoding.EncodeToString(salt)
	encodedHash := base64.URLEncoding.EncodeToString(hash)
	
	return fmt.Sprintf("%s$%s", encodedHash, encodedSalt), nil
}

// VerifyPassword 验证密码
func VerifyPassword(password, encodedHash string) (bool, error) {
	// 解析编码的哈希字符串
	parts := strings.Split(encodedHash, "$")
	if len(parts) != 2 {
		return false, fmt.Errorf("invalid hash format")
	}

	// 解码哈希和盐
	expectedHash, err := base64.URLEncoding.DecodeString(parts[0])
	if err != nil {
		return false, err
	}

	salt, err := base64.URLEncoding.DecodeString(parts[1])
	if err != nil {
		return false, err
	}

	// 重新计算哈希
	h := sha256.New()
	h.Write([]byte(password))
	h.Write(salt)
	actualHash := h.Sum(nil)

	// 比较哈希值
	if len(actualHash) != len(expectedHash) {
		return false, nil
	}

	for i := 0; i < len(actualHash); i++ {
		if actualHash[i] != expectedHash[i] {
			return false, nil
		}
	}

	return true, nil
}