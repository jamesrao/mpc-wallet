package services

import (
	"testing"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserStore 模拟用户存储
type MockUserStore struct {
	mock.Mock
}

func (m *MockUserStore) CreateUser(user *User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserStore) GetUserByID(id string) (*User, error) {
	args := m.Called(id)
	return args.Get(0).(*User), args.Error(1)
}

func (m *MockUserStore) GetUserByEmail(email string) (*User, error) {
	args := m.Called(email)
	return args.Get(0).(*User), args.Error(1)
}

// MockSessionStore 模拟会话存储
type MockSessionStore struct {
	mock.Mock
}

func (m *MockSessionStore) StoreSessionData(sessionID string, data []byte) error {
	args := m.Called(sessionID, data)
	return args.Error(0)
}

func (m *MockSessionStore) GetSessionData(sessionID string) ([]byte, error) {
	args := m.Called(sessionID)
	return args.Get(0).([]byte), args.Error(1)
}

func (m *MockSessionStore) DeleteSessionData(sessionID string) error {
	args := m.Called(sessionID)
	return args.Error(0)
}

func TestPasskeyService_BeginRegistration(t *testing.T) {
	// 设置测试数据
	userID := "test-user-123"
	user := &User{
		ID:       userID,
		Email:    "test@example.com",
		Username: "testuser",
	}

	// 创建模拟对象
	mockUserStore := new(MockUserStore)
	mockSessionStore := new(MockSessionStore)
	
	// 设置期望
	mockUserStore.On("GetUserByID", userID).Return(user, nil)
	mockSessionStore.On("StoreSessionData", mock.Anything, mock.Anything).Return(nil)

	// 创建服务
	service := &PasskeyService{
		userStore:    mockUserStore,
		sessionStore: mockSessionStore,
		webAuthn:     &webauthn.WebAuthn{},
	}

	// 执行测试
	options, sessionData, err := service.BeginRegistration(userID)

	// 验证结果
	assert.NoError(t, err)
	assert.NotNil(t, options)
	assert.NotNil(t, sessionData)
	assert.NotEmpty(t, sessionData.SessionID)

	// 验证模拟调用
	mockUserStore.AssertCalled(t, "GetUserByID", userID)
	mockSessionStore.AssertCalled(t, "StoreSessionData", mock.Anything, mock.Anything)
}

func TestPasskeyService_FinishRegistration(t *testing.T) {
	// 设置测试数据
	userID := "test-user-123"
	sessionID := "test-session-456"
	
	// 创建模拟对象
	mockUserStore := new(MockUserStore)
	mockSessionStore := new(MockSessionStore)
	
	// 设置期望
	mockSessionStore.On("GetSessionData", sessionID).Return([]byte("test-session-data"), nil)
	mockSessionStore.On("DeleteSessionData", sessionID).Return(nil)

	// 创建服务
	service := &PasskeyService{
		userStore:    mockUserStore,
		sessionStore: mockSessionStore,
		webAuthn:     &webauthn.WebAuthn{},
	}

	// 执行测试
	err := service.FinishRegistration(userID, sessionID, &webauthn.ParsedCredentialCreationData{})

	// 验证结果
	assert.NoError(t, err)

	// 验证模拟调用
	mockSessionStore.AssertCalled(t, "GetSessionData", sessionID)
	mockSessionStore.AssertCalled(t, "DeleteSessionData", sessionID)
}

func TestPasskeyService_BeginAuthentication(t *testing.T) {
	// 设置测试数据
	userID := "test-user-123"
	user := &User{
		ID:       userID,
		Email:    "test@example.com",
		Username: "testuser",
	}

	// 创建模拟对象
	mockUserStore := new(MockUserStore)
	mockSessionStore := new(MockSessionStore)
	
	// 设置期望
	mockUserStore.On("GetUserByID", userID).Return(user, nil)
	mockSessionStore.On("StoreSessionData", mock.Anything, mock.Anything).Return(nil)

	// 创建服务
	service := &PasskeyService{
		userStore:    mockUserStore,
		sessionStore: mockSessionStore,
		webAuthn:     &webauthn.WebAuthn{},
	}

	// 执行测试
	options, sessionData, err := service.BeginAuthentication(userID)

	// 验证结果
	assert.NoError(t, err)
	assert.NotNil(t, options)
	assert.NotNil(t, sessionData)
	assert.NotEmpty(t, sessionData.SessionID)

	// 验证模拟调用
	mockUserStore.AssertCalled(t, "GetUserByID", userID)
	mockSessionStore.AssertCalled(t, "StoreSessionData", mock.Anything, mock.Anything)
}

func TestPasskeyService_FinishAuthentication(t *testing.T) {
	// 设置测试数据
	userID := "test-user-123"
	sessionID := "test-session-456"
	
	// 创建模拟对象
	mockUserStore := new(MockUserStore)
	mockSessionStore := new(MockSessionStore)
	
	// 设置期望
	mockSessionStore.On("GetSessionData", sessionID).Return([]byte("test-session-data"), nil)
	mockSessionStore.On("DeleteSessionData", sessionID).Return(nil)

	// 创建服务
	service := &PasskeyService{
		userStore:    mockUserStore,
		sessionStore: mockSessionStore,
		webAuthn:     &webauthn.WebAuthn{},
	}

	// 执行测试
	user, err := service.FinishAuthentication(userID, sessionID, &webauthn.ParsedAssertionData{})

	// 验证结果
	assert.NoError(t, err)
	assert.NotNil(t, user)

	// 验证模拟调用
	mockSessionStore.AssertCalled(t, "GetSessionData", sessionID)
	mockSessionStore.AssertCalled(t, "DeleteSessionData", sessionID)
}