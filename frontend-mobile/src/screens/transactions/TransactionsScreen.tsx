import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useWallet} from '../../contexts/WalletContext';
import Icon from 'react-native-vector-icons/Ionicons';

const TransactionsScreen: React.FC = () => {
  const {theme} = useTheme();
  const {transactions, sendTransaction, currentWallet} = useWallet();
  
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  // 按日期分组交易
  const groupedTransactions = transactions
    .filter(tx => {
      if (filter === 'sent') return tx.from === currentWallet?.address;
      if (filter === 'received') return tx.to === currentWallet?.address;
      return true;
    })
    .reduce((groups: any, tx) => {
      const date = new Date(tx.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
      return groups;
    }, {});

  const sections = Object.keys(groupedTransactions).map(date => ({
    title: date,
    data: groupedTransactions[date],
  }));

  const handleSend = async () => {
    if (!recipient || !amount) {
      Alert.alert('错误', '请输入收款地址和金额');
      return;
    }

    if (!currentWallet) {
      Alert.alert('错误', '请先选择钱包');
      return;
    }

    const txHash = await sendTransaction(recipient, amount, memo);
    if (txHash) {
      setShowSendModal(false);
      setRecipient('');
      setAmount('');
      setMemo('');
      Alert.alert('成功', '交易已提交');
    } else {
      Alert.alert('错误', '交易发送失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'failed': return theme.colors.error;
      default: return theme.colors.text;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    filterContainer: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
    },
    filterButtonTextInactive: {
      color: theme.colors.text,
    },
    sectionHeader: {
      backgroundColor: theme.colors.card,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      opacity: 0.7,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    transactionIcon: {
      marginRight: 12,
    },
    transactionContent: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    transactionSubtitle: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.7,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    transactionStatus: {
      fontSize: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
      marginTop: 16,
    },
    sendButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: theme.colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    input: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 12,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    modalButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: theme.colors.card,
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    modalButtonTextSecondary: {
      color: theme.colors.text,
      fontWeight: '600',
    },
  });

  const FilterButton = ({label, value}: {label: string; value: 'all' | 'sent' | 'received'}) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}>
      <Text style={[
        styles.filterButtonText,
        filter === value ? styles.filterButtonTextActive : styles.filterButtonTextInactive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TransactionItem = ({item}: {item: any}) => {
    const isSent = item.from === currentWallet?.address;
    const amountColor = isSent ? theme.colors.error : theme.colors.success;
    
    return (
      <TouchableOpacity style={styles.transactionItem}>
        <Icon
          name={isSent ? 'arrow-up' : 'arrow-down'}
          size={24}
          color={amountColor}
          style={styles.transactionIcon}
        />
        
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>
            {isSent ? '转出' : '转入'}
          </Text>
          <Text style={styles.transactionSubtitle}>
            {isSent ? `至: ${item.to.slice(0, 8)}...` : `从: ${item.from.slice(0, 8)}...`}
          </Text>
          <Text style={[styles.transactionStatus, {backgroundColor: getStatusColor(item.status)}]}>
            {item.status === 'confirmed' ? '已确认' : 
             item.status === 'pending' ? '待确认' : '失败'}
          </Text>
        </View>
        
        <Text style={[styles.transactionAmount, {color: amountColor}]}>
          {isSent ? '-' : '+'}{item.value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>交易记录</Text>
      </View>

      {/* 过滤器 */}
      <View style={styles.filterContainer}>
        <FilterButton label="全部" value="all" />
        <FilterButton label="转出" value="sent" />
        <FilterButton label="转入" value="received" />
      </View>

      {/* 交易列表 */}
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => <TransactionItem item={item} />}
          renderSectionHeader={({section: {title}}) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="receipt-outline" size={64} color={theme.colors.text} opacity={0.3} />
          <Text style={styles.emptyText}>暂无交易记录</Text>
        </View>
      )}

      {/* 发送按钮 */}
      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => setShowSendModal(true)}>
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 发送交易模态框 */}
      <Modal visible={showSendModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>发送交易</Text>
            
            <TextInput
              style={styles.input}
              placeholder="收款地址"
              value={recipient}
              onChangeText={setRecipient}
            />
            
            <TextInput
              style={styles.input}
              placeholder="金额"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="备注 (可选)"
              value={memo}
              onChangeText={setMemo}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowSendModal(false)}>
                <Text style={styles.modalButtonTextSecondary}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSend}>
                <Text style={styles.modalButtonText}>发送</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionsScreen;