// src/pages/ChartsPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaChartPie, FaChartBar, FaThList } from 'react-icons/fa';
import AssetTypeDonutChart from '../components/charts/AssetTypeDonutChart';
import TopPositionsBarChart from '../components/charts/TopPositionsBarChart';
import AllocationTable from '../components/charts/AllocationTable';
import EmptyState from '../components/common/EmptyState'; // Reutilize seu componente

const API_URL = 'http://127.0.0.1:5000';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md">
        <p className="font-bold">Ocorreu um Erro</p>
        <p>{message}</p>
    </div>
);


const ChartsPage = () => {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllocationData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      try {
        // Você precisará criar este endpoint no seu backend
        const response = await fetch(`${API_URL}/api/portfolio/allocation?user_id=${user.id}`);
        if (!response.ok) {
          throw new Error('Não foi possível buscar os dados da carteira. Tente novamente mais tarde.');
        }
        const data = await response.json();
        setPortfolioData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocationData();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 md:p-8"><ErrorMessage message={error} /></div>;
  if (!portfolioData || portfolioData.assets.length === 0) {
    return <div className="p-4 md:p-8"><EmptyState /></div>;
  }
  
  // Processar dados para o gráfico de barras (Top 5 posições)
  const topAssets = [...portfolioData.assets]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        
        {/* Cabeçalho */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Análise da Carteira</h1>
        
        {/* Grid Principal do Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Card 1: Gráfico de Rosca (Donut) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <FaChartPie className="text-blue-500" />
              Distribuição por Ativo
            </h2>
            <AssetTypeDonutChart data={portfolioData.summary.assetTypes} />
          </div>

          {/* Card 2: Gráfico de Barras */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <FaChartBar className="text-green-500" />
              Top 5 Maiores Posições
            </h2>
            <TopPositionsBarChart data={topAssets} />
          </div>

        </div>

        {/* Card 3: Tabela Detalhada */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <FaThList className="text-indigo-500" />
            Composição Detalhada
          </h2>
          <AllocationTable data={portfolioData.assets} totalPortfolioValue={portfolioData.summary.totalValue} />
        </div>

      </div>
    </div>
  );
};

export default ChartsPage;