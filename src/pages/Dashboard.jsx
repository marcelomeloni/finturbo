import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import AddAssetModal from '../components/assets/AddAssetModal';
import AssetCard from '../components/assets/AssetCard';
import EmptyState from '../components/dashboard/EmptyState';
import { FaArrowTrendUp, FaDollarSign, FaFileInvoiceDollar, FaChartPie } from 'react-icons/fa6';
const API_URL = 'http://127.0.0.1:5000';
// Componente para o card de resumo
const PortfolioSummaryCard = ({ summary }) => {
  const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const returnPercent = (summary.totalReturn / summary.totalCost) * 100;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><FaChartPie size={20} /></div>
        <div>
          <p className="text-sm text-gray-500">Patrimônio Total</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalEquity)}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-gray-100 text-gray-600 p-3 rounded-lg"><FaFileInvoiceDollar size={20} /></div>
        <div>
          <p className="text-sm text-gray-500">Custo de Aquisição</p>
          <p className="text-lg font-semibold text-gray-600">{formatCurrency(summary.totalCost)}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-green-100 text-green-600 p-3 rounded-lg"><FaDollarSign size={20} /></div>
        <div>
          <p className="text-sm text-gray-500">Retorno Total</p>
          <p className={`text-lg font-semibold ${summary.totalReturn >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(summary.totalReturn)}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${summary.totalReturn >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}><FaArrowTrendUp size={20} /></div>
        <div>
          <p className="text-sm text-gray-500">Rentabilidade</p>
          <p className={`text-lg font-semibold ${returnPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>{isFinite(returnPercent) ? `${returnPercent.toFixed(2)}%` : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({ totalEquity: 0, totalCost: 0, totalReturn: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: transactions, error } = await supabase.from('transacoes').select('*').eq('user_id', user.id);
    if (error) {
      console.error('Erro ao buscar transações:', error);
      setLoading(false);
      return;
    }

    const portfolio = transactions.reduce((acc, tx) => {
      const { ticker, quantity, price, transaction_type, asset_type } = tx;
      if (!acc[ticker]) {
        acc[ticker] = { identifier: ticker, assetType: asset_type, quantity: 0, totalCost: 0 };
      }
      if (transaction_type === 'compra') {
        acc[ticker].quantity += quantity;
        acc[ticker].totalCost += quantity * price;
      } else if (transaction_type === 'venda') {
        acc[ticker].quantity -= quantity;
      }
      return acc;
    }, {});
    
    const currentAssets = Object.values(portfolio).filter(asset => asset.quantity > 0);
    
    // Busca as cotações atuais para calcular o patrimônio
    const quotePromises = currentAssets.map(asset => 
      fetch(`${API_URL}/api/quote/${asset.assetType}/${asset.identifier}`).then(res => res.json())
    );

    const quotes = await Promise.all(quotePromises);

    let totalEquity = 0;
    let totalCost = 0;

    currentAssets.forEach((asset, index) => {
      const quote = quotes[index];
      if (quote && quote.price) {
        totalEquity += asset.quantity * quote.price;
      }
      totalCost += asset.totalCost;
    });

    setAssets(currentAssets);
    setSummary({ totalEquity, totalCost, totalReturn: totalEquity - totalCost });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleSaveSuccess = () => fetchPortfolio();

  return (
    <>
      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Calculando sua carteira...</p>
        ) : (
          <>
            <PortfolioSummaryCard summary={summary} />
            {assets.length > 0 ? (
              <div className="space-y-4">
                {assets.map((asset) => <AssetCard key={asset.identifier} asset={asset} />)}
              </div>
            ) : (
              <EmptyState onAddAsset={() => setIsModalOpen(true)} />
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <AddAssetModal onClose={() => setIsModalOpen(false)} onSaveSuccess={handleSaveSuccess} />
      )}
    </>
  );
};

export default Dashboard;