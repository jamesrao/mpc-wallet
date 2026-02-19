package storage

import (
	"sync"
	"time"
)

// SessionData 会话数据
type SessionData struct {
	Data      interface{}
	CreatedAt time.Time
}

// SessionStore 会话存储
type SessionStore struct {
	sessions map[string]*SessionData
	mu       sync.RWMutex
}

// NewSessionStore 创建新的会话存储实例
func NewSessionStore() *SessionStore {
	return &SessionStore{
		sessions: make(map[string]*SessionData),
	}
}

// StoreSession 存储会话
func (s *SessionStore) StoreSession(sessionID string, data interface{}) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	s.sessions[sessionID] = &SessionData{
		Data:      data,
		CreatedAt: time.Now(),
	}
}

// GetSession 获取会话
func (s *SessionStore) GetSession(sessionID string) (*SessionData, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	session, exists := s.sessions[sessionID]
	if !exists {
		return nil, false
	}
	
	// 检查会话是否过期（30分钟过期）
	if time.Since(session.CreatedAt) > 30*time.Minute {
		delete(s.sessions, sessionID)
		return nil, false
	}
	
	return session, true
}

// DeleteSession 删除会话
func (s *SessionStore) DeleteSession(sessionID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	delete(s.sessions, sessionID)
}

// CleanupExpiredSessions 清理过期会话
func (s *SessionStore) CleanupExpiredSessions() {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	now := time.Now()
	for sessionID, session := range s.sessions {
		if now.Sub(session.CreatedAt) > 30*time.Minute {
			delete(s.sessions, sessionID)
		}
	}
}