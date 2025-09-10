import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FaChartPie, FaChartBar, FaThList, FaArrowUp, FaArrowDown, FaEquals, FaChartLine, FaPercentage } from 'react-icons/fa';

// --- CONSTANTES E FUNÇÕES AUXILIARES ---

const API_URL = 'http://127.0.0.1:5000';

// Cores para os gráficos de pizza e barras.
// As chaves devem corresponder exatamente aos valores em 'asset_type' na sua BD, com a primeira letra maiúscula.
const COLORS = {
  'Acao': '#3b82f6',
  'Fii': '#16a34a',
  'Stock': '#f97316',
  'Reit': '#8b5cf6',
  'Cripto': '#facc15',
};

const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatPercent = (value, decimals = 2) => `${(value || 0).toFixed(decimals)}%`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC', month: 'short', day: 'numeric' });


// --- COMPONENTES DE UI AUXILIARES ---

const LoadingSpinner = ({ text = "A carregar os seus dados..." }) => (
  <div className="flex flex-col justify-center items-center h-96 text-gray-500">
    <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-600"></div>
    <p className="mt-4 text-lg">{text}</p>
  </div>
);

const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-r-lg shadow-md my-8">
        <h3 className="font-bold text-lg mb-2">Ocorreu um Erro</h3>
        <p>{message || "Não foi possível carregar os dados. Tente novamente mais tarde."}</p>
    </div>
);

const EmptyState = () => {
    const { openModal } = useAuth();
    return (
        <div className="text-center bg-white p-12 rounded-xl shadow-md mt-8">
            <h3 className="text-2xl font-semibold text-gray-800">A sua Análise Começa Aqui</h3>
            <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
                Adicione o seu primeiro ativo para visualizar gráficos incríveis e insights sobre os seus investimentos.
            </p>
            <button
                onClick={openModal}
                className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-700 transition-transform hover:scale-105"
            >
                Adicionar Ativo
            </button>
        </div>
    );
}

const StatCard = ({ title, value, change, isPercent = false }) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    const ChangeIcon = isPositive ? FaArrowUp : isNegative ? FaArrowDown : FaEquals;
    const changeColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
            {change !== undefined && (
                <div className={`flex items-center text-sm mt-2 font-semibold ${changeColor}`}>
                    <ChangeIcon className="mr-1" />
                    <span>{isPercent ? formatPercent(change * 100, 2) : formatCurrency(change)} no dia</span>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
            isActive ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        <Icon />
        {label}
    </button>
);

const AllocationTable = ({ data, totalPortfolioValue }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Carteira</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((asset) => {
            const typeName = asset.type.charAt(0).toUpperCase() + asset.type.slice(1);
            return (
              <tr key={asset.ticker} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.ticker}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span style={{backgroundColor: `${COLORS[typeName]}20`, color: COLORS[typeName]}} className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {typeName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 font-medium">{formatCurrency(asset.totalValue)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{formatPercent((asset.totalValue / totalPortfolioValue) * 100)}</td>
              </tr>
            )
        })}
      </tbody>
    </table>
  </div>
);


// --- COMPONENTES DE GRÁFICOS ---

const AssetTypeDonutChart = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
          <p className="font-bold text-gray-800">{dataPoint.name}</p>
          <p className="text-gray-600"><span className="font-semibold">Valor:</span> {formatCurrency(dataPoint.value)}</p>
          <p className="text-gray-600"><span className="font-semibold">Percentual:</span> {formatPercent(dataPoint.percentage)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} innerRadius={80} outerRadius={120} fill="#8884d8" paddingAngle={3} dataKey="value" nameKey="name">
          {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#9ca3af'} stroke="#fff" strokeWidth={2} />))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

const TopPositionsBarChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const typeName = payload[0].payload.type.charAt(0).toUpperCase() + payload[0].payload.type.slice(1);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
          <p className="font-bold text-gray-800">{label} <span style={{color: COLORS[typeName]}}>({typeName})</span></p>
          <p className="text-gray-600 font-semibold">Valor Total: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };
    
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} />
        <YAxis dataKey="ticker" type="category" width={60} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.8)' }} />
        <Bar dataKey="totalValue" radius={[0, 8, 8, 0]} barSize={20}>
          {data.map((entry) => {
              const typeName = entry.type.charAt(0).toUpperCase() + entry.type.slice(1);
              return (<Cell key={`cell-${entry.ticker}`} fill={COLORS[typeName] || '#9ca3af'} />)
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const PortfolioEvolutionChart = ({ userId }) => {
    const [period, setPeriod] = useState('1Y');
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const timePeriods = ['1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

    const fetchHistory = useCallback(async (selectedPeriod) => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            // NOTA: Este endpoint na API atual é um placeholder. 
            // Para dados reais, a API precisaria de uma lógica mais complexa.
            const response = await fetch(`${API_URL}/api/portfolio/history?user_id=${userId}&period=${selectedPeriod}`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Falha ao buscar histórico.");
            }
            const data = await response.json();
            setHistoryData(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchHistory(period);
    }, [period, fetchHistory]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
                    <p className="font-semibold text-gray-600">{formatDate(label)}</p>
                    <p className="font-bold text-blue-600">Patrimônio: {formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3">
                    <FaChartLine className="text-blue-500" />
                    Evolução do Património
                </h2>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
                    {timePeriods.map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 text-xs font-bold rounded-full ${period === p ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            {loading && <LoadingSpinner text="A calcular histórico..."/>}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && historyData.length > 0 && (
                 <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} domain={['dataMin - 1000', 'dataMax + 1000']}/>
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            )}
             {!loading && !error && historyData.length === 0 && (
                <div className='h-96 flex items-center justify-center text-gray-500'>Sem dados históricos para o período.</div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---

const Graficos = () => {
  const { user, summary: navBarSummary } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAllocationData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/portfolio/allocation?user_id=${user.id}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Não foi possível buscar os dados da carteira.');
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

  if (loading) return <div className="p-8"><LoadingSpinner /></div>;
  if (error) return <div className="p-8"><ErrorMessage message={error} /></div>;
  if (!portfolioData || !portfolioData.assets || portfolioData.assets.length === 0) {
    return <div className="p-8"><EmptyState /></div>;
  }
  
  const { totalValue, assetTypes: assetTypesSummary } = portfolioData.summary;

  const renderContent = () => {
    switch (activeTab) {
        case 'overview':
            return (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md"><AssetTypeDonutChart data={assetTypesSummary} /></div>
                        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md"><TopPositionsBarChart data={portfolioData.assets.slice(0, 7)} /></div>
                    </div>
                    <div className="mt-6 bg-white rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 p-6"><FaThList className="inline mr-2 text-indigo-500" />Composição Detalhada</h2>
                        <AllocationTable data={portfolioData.assets} totalPortfolioValue={totalValue} />
                    </div>
                </>
            );
        case 'evolution':
            return <div className="mt-6"><PortfolioEvolutionChart userId={user.id} /></div>;
        default:
            return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Análise de Desempenho</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard title="Património Total" value={formatCurrency(totalValue)} />
            <StatCard title="Variação do Dia" value={formatCurrency(navBarSummary.variacaoDia)} change={navBarSummary.variacaoDia} />
            <StatCard title="Rentabilidade Total" value={formatPercent(navBarSummary.rentabilidadeTotal * 100, 2)} />
        </div>
        
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 mb-4">
            <TabButton label="Visão Geral" icon={FaChartPie} isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <TabButton label="Evolução" icon={FaChartLine} isActive={activeTab === 'evolution'} onClick={() => setActiveTab('evolution')} />
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default Graficos;
