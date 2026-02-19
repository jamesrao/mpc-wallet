import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';

const SplashScreen: React.FC = () => {
  const {theme} = useTheme();
  
  const spinValue = new Animated.Value(0);
  
  // 旋转动画
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    logoText: {
      color: '#FFFFFF',
      fontSize: 36,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
      marginBottom: 40,
    },
    loadingContainer: {
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 16,
    },
    spinner: {
      width: 40,
      height: 40,
      borderWidth: 4,
      borderColor: theme.colors.primary + '20',
      borderTopColor: theme.colors.primary,
      borderRadius: 20,
    },
    featureList: {
      alignItems: 'center',
      marginTop: 40,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.success + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    featureText: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SCF</Text>
        </View>
        <Text style={styles.title}>供应链金融</Text>
        <Text style={styles.subtitle}>
          安全、高效的区块链供应链金融平台
        </Text>
      </View>

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>正在加载应用...</Text>
        <Animated.View style={[styles.spinner, {transform: [{rotate: spin}]}]} />
      </View>

      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text style={{color: theme.colors.success, fontSize: 12, fontWeight: 'bold'}}>✓</Text>
          </View>
          <Text style={styles.featureText}>MPC门限签名安全</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text style={{color: theme.colors.success, fontSize: 12, fontWeight: 'bold'}}>✓</Text>
          </View>
          <Text style={styles.featureText}>应收账款代币化</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text style={{color: theme.colors.success, fontSize: 12, fontWeight: 'bold'}}>✓</Text>
          </View>
          <Text style={styles.featureText}>多链资产统一管理</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Text style={{color: theme.colors.success, fontSize: 12, fontWeight: 'bold'}}>✓</Text>
          </View>
          <Text style={styles.featureText}>企业级安全认证</Text>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen;