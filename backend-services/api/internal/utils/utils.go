package utils

import (
	"strings"
)

// IsValidEmail 验证邮箱格式
func IsValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// IsValidUsername 验证用户名格式
func IsValidUsername(username string) bool {
	if len(username) < 3 || len(username) > 50 {
		return false
	}
	// 只允许字母、数字、下划线
	for _, ch := range username {
		if !(ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || 
			ch >= '0' && ch <= '9' || ch == '_') {
			return false
		}
	}
	return true
}