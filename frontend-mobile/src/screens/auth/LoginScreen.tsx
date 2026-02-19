import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const LoginScreen: React.FC = () => {
  const {theme} = useTheme();
  const {login, biometricLogin, isLoading} = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      Alert.alert('登录失败', '请检查邮箱和密码是否正确');
    }
  };

  const handleBiometricLogin = async () => {
    const success = await biometricLogin();
    if (!success) {
      Alert.alert('生物识别失败', '请使用账号密码登录');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 20,
      borderRadius: 60,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 8,
      fontWeight: '500',
    },
    input: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    passwordInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
    },
    passwordField: {
      flex: 1,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    eyeButton: {
      padding: 16,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    biometricButton: {
      backgroundColor: theme.colors.secondary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    biometricButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    switchText: {
      textAlign: 'center',
      marginTop: 20,
      color: theme.colors.text,
    },
    switchLink: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    forgotPassword: {
      textAlign: 'center',
      marginTop: 16,
      color: theme.colors.primary,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SCF</Text>
          </View>
          <Text style={styles.title}>供应链金融</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? '创建您的企业账户' : '安全登录您的账户'}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>邮箱地址</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入邮箱地址"
            placeholderTextColor={theme.colors.text + '80'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>密码</Text>
          <View style={styles.passwordInput}>
            <TextInput
              style={styles.passwordField}
              placeholder="请输入密码"
              placeholderTextColor={theme.colors.text + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}>
          <Text style={styles.loginButtonText}>
            {isLoading ? '登录中...' : (isRegistering ? '注册' : '登录')}
          </Text>
        </TouchableOpacity>

        {!isRegistering && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
            disabled={isLoading}>
            <Icon name="finger-print" size={20} color="#FFFFFF" />
            <Text style={styles.biometricButtonText}>生物识别登录</Text>
          </TouchableOpacity>
        )}

        {!isRegistering && (
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>忘记密码？</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.switchText}>
            {isRegistering ? '已有账户？' : '没有账户？'}
            <Text style={styles.switchLink}>
              {isRegistering ? '立即登录' : '立即注册'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;