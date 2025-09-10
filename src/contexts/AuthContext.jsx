import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const API_URL = 'http://127.0.0.1:5000'; // URL da sua API Backend

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados centralizados para a carteira
  const [summary, setSummary] = useState({ saldoBruto: 0, variacaoDia: 0, rentabilidadeTotal: 0 });
  const [loadingSummary, setLoadingSummary] = useState(true);

  // --- NOVOS ESTADOS E FUNÇÕES PARA O MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  // ---------------------------------------------

  const fetchPortfolioSummary = useCallback(async (userId) => {
    if (!userId) {
      setSummary({ saldoBruto: 0, variacaoDia: 0, rentabilidadeTotal: 0 });
      setLoadingSummary(false);
      return;
    }
    
    setLoadingSummary(true);
    try {
      const response = await fetch(`${API_URL}/api/summary?user_id=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setSummary(data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Erro ao buscar resumo da carteira no contexto:", error);
      setSummary({ saldoBruto: 0, variacaoDia: 0, rentabilidadeTotal: 0 });
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        await fetchPortfolioSummary(currentUser.id);
      }
      setLoading(false);
    };
    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        if (currentUser) {
          await fetchPortfolioSummary(currentUser.id);
        } else {
          setSummary({ saldoBruto: 0, variacaoDia: 0, rentabilidadeTotal: 0 });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchPortfolioSummary]);
  
  const value = {
    // Autenticação
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
    // Dados da carteira
    summary,
    loadingSummary,
    refreshPortfolio: () => fetchPortfolioSummary(user?.id),
    // Controle do Modal
    isModalOpen,
    openModal,
    closeModal,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
