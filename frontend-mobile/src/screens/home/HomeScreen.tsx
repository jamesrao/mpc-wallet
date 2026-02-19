import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useAuth} from '../../contexts/AuthContext';
import {useWallet} from '../../contexts/WalletContext';
import Icon from 'react-native-vector-icons/Ionicons';

interface DashboardStats {
  totalAssets: string;
  activeReceivables: number;
  pendingTransactions: number;
  recentActivity: number;
}

const HomeScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const {currentWallet, assets, transactions, refreshBalance, getAssets} = useWallet();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: '0',
    activeReceivables: 0,
    pendingTransactions: 0,
    recentActivity: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [currentWallet, assets, transactions]);

  const loadDashboardData = () => {
    const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.value), 0);
    const activeReceivables = assets.filter(a => 
      a.type === 'receivable' && a.status === 'active'
    ).length;
    const pendingTx = transactions.filter(t => t.status === 'pending').length;
    const recentActivity = transactions.filter(t => 
      Date.now() - t.timestamp < 24 * 60 * 60 * 1000
    ).length;

    setStats({
      totalAssets: totalValue.toLocaleString(),
      activeReceivables,
      pendingTransactions: pendingTx,
      recentActivity,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), getAssets()]);
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_receivable':
        Alert.alert('创建应收账款', '功能开发中...');
        break;
      case 'transfer':
        Alert.alert('转账', '功能开发中...');
        break;
      case 'scan_qr':
        Alert.alert('扫码', '功能开发中...');
        break;
      case 'mpc_transaction':
        Alert.alert('MPC交易', '功能开发中...');
        break;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    userInfo: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
    },
    walletCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    walletTitle: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.8,
      marginBottom: 8,
    },
    balance: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    walletAddress: {
      fontSize: 14,
      color: '#FFFFFF',
      opacity: 0.8,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 24,
    },
    statCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      margin: 4,
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
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
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 4,
    },
    actionIcon: {
      marginBottom: 8,
    },
    actionText: {
      fontSize: 12,
      color: theme.colors.text,
      textAlign: 'center',
    },
    recentActivity: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityIcon: {
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 2,
    },
    activitySubtitle: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.7,
    },
    activityAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
  });

  const QuickAction = ({icon, label, onPress}: any) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Icon name={icon} size={24} color={theme.colors.primary} style={styles.actionIcon} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* 头部欢迎信息 */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            欢迎回来，{user?.name || '用户'}！
          </Text>
          <Text style={styles.userInfo}>
            {user?.company} · {user?.role === 'supplier' ? '供应商' : 
                             user?.role === 'buyer' ? '采购商' : '金融机构'}
          </Text>
        </View>

        {/* 钱包余额卡片 */}
        <View style={styles.walletCard}>
          <Text style={styles.walletTitle}>总资产</Text>
          <Text style={styles.balance}>¥{stats.totalAssets}</Text>
          <Text style={styles.walletAddress}>
            {currentWallet?.address ? 
              `${currentWallet.address.slice(0, 8)}...${currentWallet.address.slice(-6)}` : 
              '未连接钱包'}
          </Text>
        </View>

        {/* 统计信息网格 */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeReceivables}</Text>
            <Text style={styles.statLabel}>活跃应收账款</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pendingTransactions}</Text>
            <Text style={styles.statLabel}>待处理交易</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{assets.length}</Text>
            <Text style={styles.statLabel}>总资产数</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.recentActivity}</Text>
            <Text style={styles.statLabel}>今日活动</Text>
          </View>
        </View>

        {/* 快捷操作 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快捷操作</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="document-text-outline"
              label="创建应收"
              onPress={() => handleQuickAction('create_receivable')}
            />
            <QuickAction
              icon="swap-horizontal-outline"
              label="转账"
              onPress={() => handleQuickAction('transfer')}
            />
            <QuickAction
              icon="qr-code-outline"
              label="扫码"
              onPress={() => handleQuickAction('scan_qr')}
            />
            <QuickAction
              icon="shield-checkmark-outline"
              label="MPC交易"
              onPress={() => handleQuickAction('mpc_transaction')}
            />
          </View>
        </View>

        {/* 最近活动 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近活动</Text>
          <View style={styles.recentActivity}>
            {transactions.slice(0, 3).map((tx) => (
              <View key={tx.id} style={styles.activityItem}>
                <Icon
                  name={tx.from === currentWallet?.address ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={tx.from === currentWallet?.address ? theme.colors.error : theme.colors.success}
                  style={styles.activityIcon}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {tx.from === currentWallet?.address ? '转出' : '转入'}
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  styles.activityAmount,
                  {color: tx.from === currentWallet?.address ? theme.colors.error : theme.colors.success}
                ]}>
                  {tx.from === currentWallet?.address ? '-' : '+'}{tx.value}
                </Text>
              </View>
            ))}
            {transactions.length === 0 && (
              <Text style={{textAlign: 'center', color: theme.colors.text, opacity: 0.7}}>
                暂无活动记录
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;