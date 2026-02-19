import React, {createContext, useContext, useState, useEffect} from 'react';
import {ethers} from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// MPC服务配置
const MPC_SERVICE_URL = 'https://api.supplychain-finance.com/mpc';

interface Wallet {
  address: string;
  balance: string;
  chain: string;
  isMultiSig: boolean;
  threshold?: number;
  totalShares?: number;
}

interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  blockNumber?: number;
  gasUsed?: string;
}

interface Asset {
  id: string;
  tokenId: string;
  name: string;
  symbol: string;
  balance: string;
  value: string;
  type: 'receivable' | 'token' | 'nft';
  status: 'active' | 'pending' | 'settled';
  issuer: string;
  dueDate?: number;
}

interface WalletContextType {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  transactions: Transaction[];
  assets: Asset[];
  isLoading: boolean;
  createWallet: (threshold: number, totalShares: number) => Promise<Wallet | null>;
  importWallet: (privateKey: string) => Promise<Wallet | null>;
  switchWallet: (address: string) => void;
  sendTransaction: (to: string, value: string, data?: string) => Promise<string | null>;
  signMPCTransaction: (transactionData: any) => Promise<string | null>;
  refreshBalance: () => Promise<void>;
  getAssets: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载钱包数据
  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setIsLoading(true);
      
      const storedWallets = await AsyncStorage.getItem('user_wallets');
      const storedCurrent = await AsyncStorage.getItem('current_wallet');
      
      if (storedWallets) {
        const walletList = JSON.parse(storedWallets);
        setWallets(walletList);
        
        if (storedCurrent) {
          const current = walletList.find((w: Wallet) => w.address === storedCurrent);
          setCurrentWallet(current || walletList[0] || null);
        } else if (walletList.length > 0) {
          setCurrentWallet(walletList[0]);
        }
      }
      
      // 加载交易记录和资产
      if (currentWallet) {
        await Promise.all([
          loadTransactions(),
          loadAssets(),
          refreshBalance(),
        ]);
      }
    } catch (error) {
      console.error('加载钱包失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createWallet = async (threshold: number, totalShares: number): Promise<Wallet | null> => {
    try {
      setIsLoading(true);
      
      // 调用MPC服务创建门限钱包
      const response = await axios.post(`${MPC_SERVICE_URL}/wallets/create`, {
        threshold,
        totalShares,
      });

      if (response.data.success) {
        const newWallet: Wallet = {
          address: response.data.address,
          balance: '0',
          chain: 'Ethereum',
          isMultiSig: true,
          threshold,
          totalShares,
        };

        // 更新钱包列表
        const updatedWallets = [...wallets, newWallet];
        setWallets(updatedWallets);
        setCurrentWallet(newWallet);
        
        // 保存到本地存储
        await AsyncStorage.setItem('user_wallets', JSON.stringify(updatedWallets));
        await AsyncStorage.setItem('current_wallet', newWallet.address);
        
        return newWallet;
      }
      return null;
    } catch (error) {
      console.error('创建钱包失败:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const importWallet = async (privateKey: string): Promise<Wallet | null> => {
    try {
      setIsLoading(true);
      
      // 创建传统钱包
      const wallet = new ethers.Wallet(privateKey);
      const newWallet: Wallet = {
        address: wallet.address,
        balance: '0',
        chain: 'Ethereum',
        isMultiSig: false,
      };

      // 更新钱包列表
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      setCurrentWallet(newWallet);
      
      // 保存到本地存储
      await AsyncStorage.setItem('user_wallets', JSON.stringify(updatedWallets));
      await AsyncStorage.setItem('current_wallet', newWallet.address);
      
      return newWallet;
    } catch (error) {
      console.error('导入钱包失败:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const switchWallet = async (address: string) => {
    const wallet = wallets.find(w => w.address === address);
    if (wallet) {
      setCurrentWallet(wallet);
      await AsyncStorage.setItem('current_wallet', address);
      
      // 重新加载数据
      await Promise.all([
        loadTransactions(),
        loadAssets(),
        refreshBalance(),
      ]);
    }
  };

  const sendTransaction = async (to: string, value: string, data?: string): Promise<string | null> => {
    try {
      if (!currentWallet) return null;

      if (currentWallet.isMultiSig) {
        // MPC门限交易
        const response = await axios.post(`${MPC_SERVICE_URL}/transactions/sign`, {
          from: currentWallet.address,
          to,
          value,
          data,
        });

        if (response.data.success) {
          return response.data.transactionHash;
        }
      } else {
        // 传统交易
        // 这里需要实现传统钱包的交易逻辑
        // 暂时返回模拟数据
        return `0x${Math.random().toString(16).substr(2)}`;
      }
      
      return null;
    } catch (error) {
      console.error('发送交易失败:', error);
      return null;
    }
  };

  const signMPCTransaction = async (transactionData: any): Promise<string | null> => {
    try {
      const response = await axios.post(`${MPC_SERVICE_URL}/transactions/sign`, transactionData);
      
      if (response.data.success) {
        return response.data.signature;
      }
      return null;
    } catch (error) {
      console.error('MPC签名失败:', error);
      return null;
    }
  };

  const refreshBalance = async () => {
    if (!currentWallet) return;

    try {
      // 这里需要实现实际的余额查询逻辑
      // 暂时使用模拟数据
      const mockBalance = (Math.random() * 1000).toFixed(4);
      
      setCurrentWallet(prev => prev ? {...prev, balance: mockBalance} : null);
    } catch (error) {
      console.error('刷新余额失败:', error);
    }
  };

  const loadTransactions = async () => {
    if (!currentWallet) return;

    try {
      // 模拟交易数据
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          hash: '0x1234567890abcdef',
          from: currentWallet.address,
          to: '0x9876543210fedcba',
          value: '1.5',
          status: 'confirmed',
          timestamp: Date.now() - 86400000,
          blockNumber: 123456,
          gasUsed: '21000',
        },
        {
          id: '2',
          hash: '0xabcdef1234567890',
          from: '0x9876543210fedcba',
          to: currentWallet.address,
          value: '0.8',
          status: 'pending',
          timestamp: Date.now() - 3600000,
        },
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('加载交易记录失败:', error);
    }
  };

  const getAssets = async () => {
    if (!currentWallet) return;

    try {
      // 模拟资产数据
      const mockAssets: Asset[] = [
        {
          id: '1',
          tokenId: 'REC-001',
          name: '应收账款001',
          symbol: 'REC',
          balance: '100000',
          value: '100000',
          type: 'receivable',
          status: 'active',
          issuer: '供应商A',
          dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        },
        {
          id: '2',
          tokenId: 'NFT-001',
          name: '供应链票据',
          symbol: 'NFT',
          balance: '1',
          value: '50000',
          type: 'nft',
          status: 'active',
          issuer: '金融机构B',
        },
      ];

      setAssets(mockAssets);
    } catch (error) {
      console.error('加载资产失败:', error);
    }
  };

  const value: WalletContextType = {
    wallets,
    currentWallet,
    transactions,
    assets,
    isLoading,
    createWallet,
    importWallet,
    switchWallet,
    sendTransaction,
    signMPCTransaction,
    refreshBalance,
    getAssets,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet必须在WalletProvider内部使用');
  }
  return context;
};