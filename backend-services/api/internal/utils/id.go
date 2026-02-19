package utils

import (
	"crypto/rand"
	"fmt"
)

// GenerateID 生成随机ID（16字节，32位十六进制字符串）
func GenerateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// GenerateEthereumAddress 生成模拟以太坊地址（20字节，40位十六进制字符串，带0x前缀）
func GenerateEthereumAddress() string {
	b := make([]byte, 20)
	rand.Read(b)
	return fmt.Sprintf("0x%x", b)
}