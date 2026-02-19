import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useWallet} from '../../contexts/WalletContext';
import Icon from 'react-native-vector-icons/Ionicons';

const WalletScreen: React.FC = () => {
  const {theme} = useTheme();
  const {
    wallets,
    currentWallet,
    createWallet,
    importWallet,
    switchWallet,
    refreshBalance,
  } = useWallet();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [threshold, setThreshold] = useState('3');
  const [totalShares, setTotalShares] = useState('5');
  const [privateKey, setPrivateKey] = useState('');

  const handleCreateWallet = async () => {
    if (!threshold || !totalShares) {
      Alert.alert('错误', '请输入门限和总分片数');
      return;
    }

    const success = await createWallet(parseInt(threshold), parseInt(totalShares));
    if (success) {
      setShowCreateModal(false);
      Alert.alert('成功', 'MPC钱包创建成功');
    } else {
      Alert.alert('错误', '钱包创建失败');
    }
  };

  const handleImportWallet = async () => {
    if (!privateKey) {
      Alert.alert('错误', '请输入私钥');
      return;
    }

    const success = await importWallet(privateKey);
    if (success) {
      setShowImportModal(false);
      setPrivateKey('');
      Alert.alert('成功', '钱包导入成功');
    } else {
      Alert.alert('错误', '钱包导入失败');
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
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    currentWalletCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    walletHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    walletTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    walletType: {
      fontSize: 12,
      color: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    balance: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    walletAddress: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 12,
    },
    walletActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    walletList: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
    },
    walletItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    walletItemSelected: {
      backgroundColor: theme.colors.primary + '20',
    },
    walletIcon: {
      marginRight: 12,
    },
    walletInfo: {
      flex: 1,
    },
    walletName: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 2,
    },
    walletAddressSmall: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.7,
    },
    walletBalance: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    createButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    createButton: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 4,
    },
    createButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 8,
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* 当前钱包卡片 */}
        <View style={styles.section}>
          <View style={styles.currentWalletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletTitle}>当前钱包</Text>
              <Text style={styles.walletType}>
                {currentWallet?.isMultiSig ? 'MPC钱包' : '普通钱包'}
              </Text>
            </View>
            
            <Text style={styles.balance}>
              {currentWallet ? `¥${currentWallet.balance}` : '--'}
            </Text>
            
            <Text style={styles.walletAddress}>
              {currentWallet?.address || '请选择或创建钱包'}
            </Text>
            
            <View style={styles.walletActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={refreshBalance}>
                <Icon name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>刷新余额</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="arrow-up" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>转账</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 钱包列表 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我的钱包</Text>
          <View style={styles.walletList}>
            {wallets.map((wallet, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.walletItem,
                  wallet.address === currentWallet?.address && styles.walletItemSelected,
                ]}
                onPress={() => switchWallet(wallet.address)}>
                <Icon
                  name={wallet.isMultiSig ? "shield-checkmark" : "wallet"}
                  size={24}
                  color={theme.colors.primary}
                  style={styles.walletIcon}
                />
                <View style={styles.walletInfo}>
                  <Text style={styles.walletName}>
                    {wallet.isMultiSig ? 'MPC钱包' : '普通钱包'}
                  </Text>
                  <Text style={styles.walletAddressSmall}>
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                  </Text>
                </View>
                <Text style={styles.walletBalance}>¥{wallet.balance}</Text>
              </TouchableOpacity>
            ))}
            
            {wallets.length === 0 && (
              <View style={styles.walletItem}>
                <Text style={{color: theme.colors.text, opacity: 0.7}}>
                  暂无钱包，请创建或导入
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 创建/导入钱包 */}
        <View style={styles.section}>
          <View style={styles.createButtons}>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}>
              <Icon name="add-circle" size={32} color={theme.colors.primary} />
              <Text style={styles.createButtonText}>创建MPC钱包</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowImportModal(true)}>
              <Icon name="download" size={32} color={theme.colors.primary} />
              <Text style={styles.createButtonText}>导入钱包</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 创建MPC钱包模态框 */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>创建MPC钱包</Text>
            
            <TextInput
              style={styles.input}
              placeholder="门限数量 (如: 3)"
              value={threshold}
              onChangeText={setThreshold}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="总分片数 (如: 5)"
              value={totalShares}
              onChangeText={setTotalShares}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalButtonTextSecondary}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateWallet}>
                <Text style={styles.modalButtonText}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 导入钱包模态框 */}
      <Modal visible={showImportModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>导入钱包</Text>
            
            <TextInput
              style={styles.input}
              placeholder="输入私钥"
              value={privateKey}
              onChangeText={setPrivateKey}
              secureTextEntry
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowImportModal(false)}>
                <Text style={styles.modalButtonTextSecondary}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleImportWallet}>
                <Text style={styles.modalButtonText}>导入</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WalletScreen;