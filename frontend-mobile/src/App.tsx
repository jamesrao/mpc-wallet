import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// 导入页面组件
import LoginScreen from './screens/auth/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import WalletScreen from './screens/wallet/WalletScreen';
import TransactionsScreen from './screens/transactions/TransactionsScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import AssetDetailScreen from './screens/assets/AssetDetailScreen';
import MPCTransactionScreen from './screens/mpc/MPCTransactionScreen';

// 导入上下文和工具
import {AuthProvider, useAuth} from './contexts/AuthContext';
import {WalletProvider} from './contexts/WalletContext';
import {ThemeProvider} from './contexts/ThemeContext';
import SplashScreen from './components/SplashScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 主标签页导航
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{title: '首页'}} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{title: '钱包'}} />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
        options={{title: '交易'}} 
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{title: '我的'}} />
    </Tab.Navigator>
  );
}

// 认证后的主应用
function AuthenticatedApp() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator} 
        options={{headerShown: false}} 
      />
      <Stack.Screen 
        name="AssetDetail" 
        component={AssetDetailScreen} 
        options={{title: '资产详情'}} 
      />
      <Stack.Screen 
        name="MPCTransaction" 
        component={MPCTransactionScreen} 
        options={{title: 'MPC交易'}} 
      />
    </Stack.Navigator>
  );
}

// 路由选择器
function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />}
    </NavigationContainer>
  );
}

// 主应用组件
function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // 应用初始化逻辑
    const initializeApp = async () => {
      // 这里可以添加初始化逻辑，如检查更新、加载配置等
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟初始化延迟
      setIsAppReady(true);
    };

    initializeApp();
  }, []);

  if (!isAppReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <WalletProvider>
            <AppNavigator />
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;