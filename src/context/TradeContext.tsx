'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Trade, JournalEntry, Transaction, TradingAccount } from '@/types/trade';
import { getItem, setItem } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { calculateTradePnL } from '@/lib/calculations';

interface TradeContextType {
  trades: Trade[];
  journalEntries: JournalEntry[];
  transactions: Transaction[];
  accounts: TradingAccount[];
  activeAccountId: string | null; // null = tum hesaplar
  setActiveAccountId: (id: string | null) => void;
  filteredTrades: Trade[];
  filteredTransactions: Transaction[];
  addAccount: (account: Omit<TradingAccount, 'id' | 'userId' | 'createdAt'>) => TradingAccount;
  updateAccount: (id: string, updates: Partial<TradingAccount>) => void;
  deleteAccount: (id: string) => void;
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'pnl' | 'pnlPercent'>) => Trade;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  getNetTransactions: (accountId?: string | null) => number;
}

const TradeContext = createContext<TradeContextType | null>(null);

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setTrades(getItem<Trade[]>(`trades_${user.id}`) || []);
      setJournalEntries(getItem<JournalEntry[]>(`journal_${user.id}`) || []);
      setTransactions(getItem<Transaction[]>(`transactions_${user.id}`) || []);
      setAccounts(getItem<TradingAccount[]>(`accounts_${user.id}`) || []);
    } else {
      setTrades([]);
      setJournalEntries([]);
      setTransactions([]);
      setAccounts([]);
    }
  }, [user]);

  // Filtered data based on active account
  const filteredTrades = useMemo(() => {
    if (activeAccountId === null) return trades;
    return trades.filter(t => t.accountId === activeAccountId);
  }, [trades, activeAccountId]);

  const filteredTransactions = useMemo(() => {
    if (activeAccountId === null) return transactions;
    return transactions.filter(t => t.accountId === activeAccountId);
  }, [transactions, activeAccountId]);

  // Account CRUD
  const saveAccounts = useCallback((newAccounts: TradingAccount[]) => {
    if (!user) return;
    setAccounts(newAccounts);
    setItem(`accounts_${user.id}`, newAccounts);
  }, [user]);

  const addAccount = useCallback((accountData: Omit<TradingAccount, 'id' | 'userId' | 'createdAt'>) => {
    const account: TradingAccount = {
      ...accountData,
      id: crypto.randomUUID(),
      userId: user!.id,
      createdAt: new Date().toISOString(),
    };
    const newAccounts = [...accounts, account];
    saveAccounts(newAccounts);
    return account;
  }, [user, accounts, saveAccounts]);

  const updateAccount = useCallback((id: string, updates: Partial<TradingAccount>) => {
    const newAccounts = accounts.map(a => a.id === id ? { ...a, ...updates } : a);
    saveAccounts(newAccounts);
  }, [accounts, saveAccounts]);

  const deleteAccount = useCallback((id: string) => {
    saveAccounts(accounts.filter(a => a.id !== id));
    // Orphan trades/transactions get accountId = null
    if (user) {
      const newTrades = trades.map(t => t.accountId === id ? { ...t, accountId: null } : t);
      setTrades(newTrades);
      setItem(`trades_${user.id}`, newTrades);
      const newTxs = transactions.map(t => t.accountId === id ? { ...t, accountId: null } : t);
      setTransactions(newTxs);
      setItem(`transactions_${user.id}`, newTxs);
    }
    if (activeAccountId === id) setActiveAccountId(null);
  }, [accounts, trades, transactions, user, activeAccountId, saveAccounts]);

  // Trade CRUD
  const saveTrades = useCallback((newTrades: Trade[]) => {
    if (!user) return;
    setTrades(newTrades);
    setItem(`trades_${user.id}`, newTrades);
  }, [user]);

  const addTrade = useCallback((tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'pnl' | 'pnlPercent'>) => {
    const now = new Date().toISOString();
    const trade: Trade = {
      ...tradeData,
      accountId: tradeData.accountId || null,
      id: crypto.randomUUID(),
      userId: user!.id,
      pnl: null,
      pnlPercent: null,
      createdAt: now,
      updatedAt: now,
    };

    if (trade.exitPrice) {
      const { pnl, pnlPercent } = calculateTradePnL(trade);
      trade.pnl = pnl;
      trade.pnlPercent = pnlPercent;
      trade.status = 'kapali';
      if (!trade.exitDate) {
        trade.exitDate = now;
      }
    }

    const newTrades = [trade, ...trades];
    saveTrades(newTrades);
    return trade;
  }, [user, trades, saveTrades]);

  const updateTrade = useCallback((id: string, updates: Partial<Trade>) => {
    const newTrades = trades.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
      if (updated.exitPrice) {
        const { pnl, pnlPercent } = calculateTradePnL(updated);
        updated.pnl = pnl;
        updated.pnlPercent = pnlPercent;
        updated.status = 'kapali';
        if (!updated.exitDate) {
          updated.exitDate = new Date().toISOString();
        }
      }
      return updated;
    });
    saveTrades(newTrades);
  }, [trades, saveTrades]);

  const deleteTrade = useCallback((id: string) => {
    saveTrades(trades.filter(t => t.id !== id));
  }, [trades, saveTrades]);

  // Journal
  const addJournalEntry = useCallback((entryData: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };
    const newEntries = [entry, ...journalEntries];
    setJournalEntries(newEntries);
    setItem(`journal_${user.id}`, newEntries);
  }, [user, journalEntries]);

  const updateJournalEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    if (!user) return;
    const newEntries = journalEntries.map(e =>
      e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    );
    setJournalEntries(newEntries);
    setItem(`journal_${user.id}`, newEntries);
  }, [user, journalEntries]);

  // Transactions
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const tx: Transaction = {
      ...txData,
      accountId: txData.accountId || null,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const newTxs = [tx, ...transactions];
    setTransactions(newTxs);
    setItem(`transactions_${user.id}`, newTxs);
  }, [user, transactions]);

  const deleteTransaction = useCallback((id: string) => {
    if (!user) return;
    const newTxs = transactions.filter(t => t.id !== id);
    setTransactions(newTxs);
    setItem(`transactions_${user.id}`, newTxs);
  }, [user, transactions]);

  const getNetTransactions = useCallback((accountId?: string | null) => {
    const txs = accountId !== undefined && accountId !== null
      ? transactions.filter(t => t.accountId === accountId)
      : activeAccountId !== null
        ? transactions.filter(t => t.accountId === activeAccountId)
        : transactions;
    return txs.reduce((sum, tx) => sum + (tx.type === 'deposit' ? tx.amount : -tx.amount), 0);
  }, [transactions, activeAccountId]);

  return (
    <TradeContext.Provider value={{
      trades, journalEntries, transactions, accounts,
      activeAccountId, setActiveAccountId,
      filteredTrades, filteredTransactions,
      addAccount, updateAccount, deleteAccount,
      addTrade, updateTrade, deleteTrade,
      addJournalEntry, updateJournalEntry,
      addTransaction, deleteTransaction, getNetTransactions,
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrades must be used within TradeProvider');
  return ctx;
}
