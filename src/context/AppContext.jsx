"use client";
import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('geonixa_auth') === 'true';
    }
    return false;
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
  const [employees, setEmployees] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Employees
      const { data: employeesData } = await supabase.from('employees').select('*').order('join_date', { ascending: true });
      if (employeesData) {
        setEmployees(employeesData.map(e => ({
          ...e,
          salaryMonth: e.salary_month,
          baseSalary: e.base_salary,
          joinDate: e.join_date
        })));
      }

      // Fetch Mentors
      const { data: mentorsData } = await supabase.from('mentors').select('*');
      if (mentorsData) {
        setMentors(mentorsData.map(m => ({
          ...m,
          baseSalary: m.base_salary,
          paymentDate: m.payment_date
        })));
      }

      // Fetch Transactions
      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: true });
      if (txData) {
        setTransactions(txData.map(t => ({
          ...t,
          monthFilter: t.month_filter
        })));
      }
    };

    fetchData();
  }, []);

  // Employee Actions
  const addEmployee = async (employee) => {
    const dbEmployee = {
      name: employee.name,
      role: employee.role,
      salary_month: employee.salaryMonth,
      base_salary: employee.baseSalary,
      join_date: employee.joinDate
    };
    const { data, error } = await supabase.from('employees').insert([dbEmployee]).select();
    if (!error && data) {
      setEmployees([...employees, { ...data[0], salaryMonth: data[0].salary_month, baseSalary: data[0].base_salary, joinDate: data[0].join_date }]);
    }
  };

  // Mentor Actions
  const addMentor = async (mentor) => {
    const dbMentor = {
      name: mentor.name,
      course: mentor.course,
      strength: mentor.strength || 0,
      base_salary: mentor.baseSalary || 0,
      total: mentor.total,
      payment_date: mentor.paymentDate
    };
    const { data, error } = await supabase.from('mentors').insert([dbMentor]).select();
    if (!error && data) {
      setMentors([...mentors, { ...data[0], baseSalary: data[0].base_salary, paymentDate: data[0].payment_date }]);
    }
  };

  const updateMentor = async (updatedMentor) => {
    const dbMentor = {
      name: updatedMentor.name,
      course: updatedMentor.course,
      strength: updatedMentor.strength || 0,
      base_salary: updatedMentor.baseSalary || 0,
      total: updatedMentor.total,
      payment_date: updatedMentor.paymentDate
    };
    const { data, error } = await supabase.from('mentors').update(dbMentor).eq('id', updatedMentor.id).select();
    if (!error && data) {
      setMentors(mentors.map(m => m.id === updatedMentor.id ? { ...data[0], baseSalary: data[0].base_salary, paymentDate: data[0].payment_date } : m));
    }
  };

  const deleteMentor = async (id) => {
    const { error } = await supabase.from('mentors').delete().eq('id', id);
    if (!error) {
      setMentors(mentors.filter(m => m.id !== id));
    }
  };

  // Transaction Actions
  const addTransaction = async (transaction) => {
    const dbTx = {
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      count: transaction.count,
      month_filter: transaction.monthFilter,
      description: transaction.description,
      date: transaction.date
    };
    const { data, error } = await supabase.from('transactions').insert([dbTx]).select();
    if (!error && data) {
      setTransactions([...transactions, { ...data[0], monthFilter: data[0].month_filter }]);
    }
  };

  const updateTransaction = async (updatedTx) => {
    const dbTx = {
      type: updatedTx.type,
      category: updatedTx.category,
      amount: updatedTx.amount,
      count: updatedTx.count,
      month_filter: updatedTx.monthFilter,
      description: updatedTx.description,
      date: updatedTx.date
    };
    const { data, error } = await supabase.from('transactions').update(dbTx).eq('id', updatedTx.id).select();
    if (!error && data) {
      setTransactions(transactions.map(t => t.id === updatedTx.id ? { ...data[0], monthFilter: data[0].month_filter } : t));
    }
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
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
