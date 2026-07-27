"use client";
import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('geonixa_auth') === 'true';
  });

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('geonixa_auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('geonixa_auth');
  };

  // Data State
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('geonixa_employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [mentors, setMentors] = useState(() => {
    const saved = localStorage.getItem('geonixa_mentors');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('geonixa_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('geonixa_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('geonixa_mentors', JSON.stringify(mentors));
  }, [mentors]);

  useEffect(() => {
    localStorage.setItem('geonixa_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Actions
  const addEmployee = (employee) => {
    setEmployees([...employees, { ...employee, id: Date.now().toString() }]);
  };

  const addMentor = (mentor) => {
    setMentors([...mentors, { ...mentor, id: Date.now().toString() }]);
  };

  const updateMentor = (updatedMentor) => {
    setMentors(mentors.map(m => m.id === updatedMentor.id ? updatedMentor : m));
  };

  const deleteMentor = (id) => {
    setMentors(mentors.filter(m => m.id !== id));
  };

  const addTransaction = (transaction) => {
    setTransactions([...transactions, { ...transaction, id: Date.now().toString(), date: transaction.date || new Date().toISOString() }]);
  };

  const updateTransaction = (updatedTx) => {
    setTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      employees,
      addEmployee,
      mentors,
      addMentor,
      updateMentor,
      deleteMentor,
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
};
