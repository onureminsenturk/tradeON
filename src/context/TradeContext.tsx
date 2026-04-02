'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Trade, JournalEntry, Transaction } from '@/types/trade';
import { getItem, setItem } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { calculateTradePnL } from '@/lib/calculations';

interface TradeContextType {
  trades: Trade[];
  journalEntries: JournalEntry[];
  transactions: Transaction[];
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'pnl' | 'pnlPercent'> & { riskAmount?: number | null }) => Trade;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  getNetTransactions: () => number;
}

const TradeContext = createContext<TradeContextType | null>(null);

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      setTrades(getItem<Trade[]>(`trades_${user.id}`) || []);
      setJournalEntries(getItem<JournalEntry[]>(`journal_${user.id}`) || []);
      setTransactions(getItem<Transaction[]>(`transactions_${user.id}`) || []);
    } else {
      setTrades([]);
      setJournalEntries([]);
      setTransactions([]);
    }
  }, [user]);

  const saveTrades = useCallback((newTrades: Trade[]) => {
    if (!user) return;
    setTrades(newTrades);
    setItem(`trades_${user.id}`, newTrades);
  }, [user]);

  const addTrade = useCallback((tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'pnl' | 'pnlPercent'>) => {
    const now = new Date().toISOString();
    const trade: Trade = {
      ...tradeData,
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

  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const tx: Transaction = {
      ...txData,
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

  const getNetTransactions = useCallback(() => {
    return transactions.reduce((sum, tx) => {
      return sum + (tx.type === 'deposit' ? tx.amount : -tx.amount);
    }, 0);
  }, [transactions]);

  return (
    <TradeContext.Provider value={{ trades, journalEntries, transactions, addTrade, updateTrade, deleteTrade, addJournalEntry, updateJournalEntry, addTransaction, deleteTransaction, getNetTransactions }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrades must be used within TradeProvider');
  return ctx;
}
