import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen: React.FC = () => {
  const {theme, setThemeMode, toggleTheme} = useTheme();
  const {user, logout} = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        {text: '取消', style: 'cancel'},
        {text: '退出', style: 'destructive', onPress: logout},
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert('清除缓存', '缓存已清除');
  };

  const handleContactSupport = () => {
    Alert.alert('联系客服', '客服电话: 400-123-4567');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 16,
    },
    profileHeader: {
      alignItems: 'center',
      marginBottom: 32,
      paddingTop: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 32,
      fontWeight: 'bold',
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    userRole: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 8,
    },
    userCompany: {
      fontSize: 14,
      color: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    menuIcon: {
      marginRight: 12,
      width: 24,
      alignItems: 'center',
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 2,
    },
    menuSubtitle: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.7,
    },
    menuAction: {
      marginLeft: 8,
    },
    dangerSection: {
      backgroundColor: theme.colors.error + '10',
      borderRadius: 12,
      padding: 16,
      marginTop: 32,
    },
    dangerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.error,
      marginBottom: 8,
    },
    dangerText: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 16,
    },
    dangerButton: {
      backgroundColor: theme.colors.error,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    dangerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    version: {
      textAlign: 'center',
      color: theme.colors.text,
      opacity: 0.5,
      marginTop: 32,
      marginBottom: 16,
    },
  });

  const MenuItem = ({icon, title, subtitle, onPress, showSwitch, switchValue, onSwitchChange}: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={showSwitch}>
      <View style={styles.menuIcon}>
        <Icon name={icon} size={20} color={theme.colors.primary} />
      </View>
      
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.menuAction}>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{false: theme.colors.border, true: theme.colors.primary}}
            thumbColor="#FFFFFF"
          />
        ) : (
          <Icon name="chevron-forward" size={20} color={theme.colors.text} opacity={0.5} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* 个人信息头部 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || '用户'}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'supplier' ? '供应商' : 
             user?.role === 'buyer' ? '采购商' : '金融机构'}
          </Text>
          <Text style={styles.userCompany}>{user?.company || '未设置公司'}</Text>
        </View>

        {/* 账户设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户设置</Text>
          <MenuItem
            icon="person-outline"
            title="个人信息"
            subtitle="修改姓名、邮箱等"
            onPress={() => Alert.alert('个人信息', '功能开发中...')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="安全设置"
            subtitle="修改密码、安全问题"
            onPress={() => Alert.alert('安全设置', '功能开发中...')}
          />
          <MenuItem
            icon="wallet-outline"
            title="钱包管理"
            subtitle="查看和管理钱包"
            onPress={() => Alert.alert('钱包管理', '功能开发中...')}
          />
        </View>

        {/* 应用设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>应用设置</Text>
          <MenuItem
            icon="moon-outline"
            title="深色模式"
            subtitle="切换主题风格"
            showSwitch
            switchValue={theme.mode === 'dark'}
            onSwitchChange={toggleTheme}
          />
          <MenuItem
            icon="notifications-outline"
            title="消息通知"
            subtitle="接收交易提醒"
            showSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <MenuItem
            icon="finger-print-outline"
            title="生物识别"
            subtitle="使用指纹/面容登录"
            showSwitch
            switchValue={biometricAuth}
            onSwitchChange={setBiometricAuth}
          />
          <MenuItem
            icon="language-outline"
            title="语言设置"
            subtitle="简体中文"
            onPress={() => Alert.alert('语言设置', '功能开发中...')}
          />
        </View>

        {/* 其他功能 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他功能</Text>
          <MenuItem
            icon="help-circle-outline"
            title="帮助中心"
            subtitle="查看使用指南"
            onPress={() => Alert.alert('帮助中心', '功能开发中...')}
          />
          <MenuItem
            icon="chatbubble-outline"
            title="联系客服"
            subtitle="获取技术支持"
            onPress={handleContactSupport}
          />
          <MenuItem
            icon="trash-outline"
            title="清除缓存"
            subtitle="释放存储空间"
            onPress={handleClearCache}
          />
          <MenuItem
            icon="information-circle-outline"
            title="关于应用"
            subtitle="版本信息和隐私政策"
            onPress={() => Alert.alert('关于应用', '供应链金融 v1.0.0')}
          />
        </View>

        {/* 危险操作区域 */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>危险操作</Text>
          <Text style={styles.dangerText}>
            退出登录将清除本地缓存数据，但不会影响区块链上的资产。
          </Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Text style={styles.dangerButtonText}>退出登录</Text>
          </TouchableOpacity>
        </View>

        {/* 版本信息 */}
        <Text style={styles.version}>供应链金融 v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;