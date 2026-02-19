import React, {createContext, useContext, useState, useEffect} from 'react';
import * as Keychain from 'react-native-keychain';
import * as Biometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API配置
const API_BASE_URL = 'https://api.supplychain-finance.com';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'supplier' | 'buyer' | 'financier';
  company: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  biometricLogin: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company: string;
  role: 'supplier' | 'buyer' | 'financier';
  phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 检查本地存储的token
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        // 验证token有效性
        const isValid = await validateToken(token);
        if (isValid) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Token无效，清除本地数据
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('认证状态检查失败:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const {user: userData, token} = response.data;
        
        // 保存认证信息
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        
        // 保存到Keychain用于生物识别
        await Keychain.setGenericPassword(email, token);
        
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);

      if (response.data.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 清除本地存储
      await clearAuthData();
      
      // 清除Keychain
      await Keychain.resetGenericPassword();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  const biometricLogin = async (): Promise<boolean> => {
    try {
      // 检查生物识别支持
      const {available, biometryType} = await Biometrics.isSensorAvailable();
      
      if (!available) {
        return false;
      }

      // 执行生物识别验证
      const {success} = await Biometrics.simplePrompt({
        promptMessage: '请进行生物识别验证',
        cancelButtonText: '取消',
      });

      if (success) {
        // 从Keychain获取凭据
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          return await login(credentials.username, credentials.password);
        }
      }
      return false;
    } catch (error) {
      console.error('生物识别登录失败:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return false;

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: {Authorization: `Bearer ${token}`},
      });

      if (response.data.success) {
        await AsyncStorage.setItem('auth_token', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token刷新失败:', error);
      await logout();
      return false;
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('清除认证数据失败:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    biometricLogin,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};