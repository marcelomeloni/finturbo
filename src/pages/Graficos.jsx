import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    AreaChart, Area, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    FaChartPie, FaChartBar, FaThList, FaArrowUp, FaArrowDown, FaEquals,
    FaChartLine, FaTrophy, FaSadTear, FaIndustry, FaTimes
} from 'react-icons/fa';

// --- CONSTANTES E FUNÇÕES AUXILIARES ---
const API_URL = 'http://127.0.0.1:5000';

const COLORS = {
    'Acao': '#3b82f6', 'Fii': '#16a34a', 'Stock': '#f97316', 'Reit': '#8b5cf6', 'Cripto': '#facc15',
};
const SECTOR_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatPercent = (value, decimals = 2) => `${(value || 0).toFixed(decimals)}%`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC', month: 'short', day: 'numeric' });

// --- HOOK CUSTOMIZADO PARA BUSCA DE DADOS ---
const usePortfolioData = (userId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        const fetchAllocationData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/api/portfolio/allocation?user_id=${userId}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Não foi possível buscar os dados da carteira.');
                }
                const fetchedData = await response.json();
                setData(fetchedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllocationData();
    }, [userId]);

    return { data, loading, error };
};


// --- COMPONENTES DE UI ---

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

const ChartCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4">
            <Icon className="text-blue-500" />
            {title}
        </h2>
        {children}
    </div>
);

const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 flex flex-col sm:flex-row items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
            isActive
            ? 'bg-blue-600 text-white shadow-md scale-105'
            : 'bg-white text-gray-600 hover:bg-gray-200 hover:text-gray-800'
        }`}
    >
        <Icon size={18} />
        <span className="hidden sm:inline">{label}</span>
    </button>
);

// --- COMPONENTES DE GRÁFICOS (REVISADOS E NOVOS) ---

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

const TopPositionsBarChart = ({ data, onAssetClick }) => {
  const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
          const typeName = payload[0].payload.type.charAt(0).toUpperCase() + payload[0].payload.type.slice(1);
          return (
              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
                  <p className="font-bold text-gray-800">{label} <span style={{ color: COLORS[typeName] }}>({typeName})</span></p>
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
              <XAxis type="number" tickFormatter={(value) => `R$${((value || 0) / 1000).toFixed(0)}k`} />
              <YAxis dataKey="ticker" type="category" width={60} tick={{ fontSize: 12 }} interval={0} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.8)' }} />
              <Bar dataKey="totalValue" radius={[0, 8, 8, 0]} barSize={20} onClick={(d) => onAssetClick(d.ticker, d.type)}>
                  {data.map((entry) => (
                      <Cell key={`cell-${entry.ticker}`} fill={COLORS[entry.type.charAt(0).toUpperCase() + entry.type.slice(1)] || '#9ca3af'} className="cursor-pointer" />
                  ))}
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
            {loading && <LoadingSpinner text="A calcular histórico..." />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && historyData.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} domain={['dataMin - 1000', 'dataMax + 1000']} />
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

const PerformanceBarChart = ({ data, dataKey, title, icon: Icon, onAssetClick }) => {
    const isGain = dataKey === 'gain';
    const chartData = data
        .map(asset => ({ ...asset, [dataKey]: asset.totalValue - asset.totalCost }))
        .filter(asset => (isGain ? asset[dataKey] > 0 : asset[dataKey] < 0))
        .sort((a, b) => (isGain ? b[dataKey] - a[dataKey] : a[dataKey] - b[dataKey]))
        .slice(0, 5) // Top 5
        .map(asset => ({ ...asset, [dataKey]: Math.abs(asset[dataKey]) })); // Use absolute value for chart length

    return (
        <ChartCard title={title} icon={Icon}>
            {chartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-500">
                    {isGain ? "Nenhum lucro não realizado." : "Nenhuma perda não realizada."}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} layout="vertical" margin={{ right: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tickFormatter={formatCurrency} />
                        <YAxis dataKey="ticker" type="category" width={60} />
                        <Tooltip formatter={(value) => formatCurrency(isGain ? value : -value)} cursor={{ fill: '#fafafa' }} />
                        <Bar dataKey={dataKey} barSize={25} radius={[0, 4, 4, 0]} onClick={(d) => onAssetClick(d.ticker, d.type)}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={isGain ? '#22c55e' : '#ef4444'} className="cursor-pointer" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </ChartCard>
    );
};

const SectorPieChart = ({ data }) => {
    // Agrupa setores menores em "Outros"
    const MIN_PERCENTAGE = 3;
    let othersValue = 0;
    const mainSectors = data.filter(d => {
        if (d.percentage < MIN_PERCENTAGE) {
            othersValue += d.value;
            return false;
        }
        return true;
    });
    if (othersValue > 0) {
        mainSectors.push({ name: 'Outros', value: othersValue });
    }

    return (
        <ChartCard title="Alocação por Setor" icon={FaIndustry}>
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie data={mainSectors} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                        {mainSectors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={formatCurrency} />
                    <Legend iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
};

const AllocationTable = ({ data, totalPortfolioValue, onAssetClick }) => (
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
                        <tr key={asset.ticker} onClick={() => onAssetClick(asset.ticker, asset.type)} className="hover:bg-blue-50 transition-colors cursor-pointer">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{asset.ticker}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-xs">{asset.longName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span style={{ backgroundColor: `${COLORS[typeName]}20`, color: COLORS[typeName] }} className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full">
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


// --- MODAL DE DETALHES DO ATIVO ---
const AssetDetailModal = ({ asset, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!asset) return;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [quoteRes, dividendsRes] = await Promise.all([
                    fetch(`${API_URL}/api/quote/${asset.type}/${asset.ticker}`),
                    fetch(`${API_URL}/api/dividends/${asset.type}/${asset.ticker}`),
                ]);
                const quote = await quoteRes.json();
                const dividends = await dividendsRes.json();
                setDetails({ quote, dividends });
            } catch (error) {
                console.error("Erro ao buscar detalhes do ativo:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [asset]);

    if (!asset) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all scale-95 animate-modal-in">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{asset.ticker}</h2>
                        <p className="text-sm text-gray-500">{asset.longName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes size={24} /></button>
                </div>
                {loading ? <LoadingSpinner text="A buscar detalhes..." /> : (
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-center">
                            <StatCard title="Preço Atual" value={formatCurrency(details.quote.price)} />
                            <StatCard title="Variação (Dia)" value={formatCurrency(details.quote.change)} change={details.quote.change} />
                            <StatCard title="Variação (%)" value={formatPercent(details.quote.percentChange)} change={details.quote.change} isPercent />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Últimos Dividendos</h3>
                        {details.dividends && details.dividends.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor por Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {details.dividends.slice(0, 5).map(div => (
                                            <tr key={div.date}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(div.date)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">{formatCurrency(div.value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-gray-500">Este ativo não possui histórico de dividendos.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---

const Graficos = () => {
    const { user, summary: navBarSummary } = useAuth();
    const { data: portfolioData, loading, error } = usePortfolioData(user?.id);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedAsset, setSelectedAsset] = useState(null);

    const handleAssetClick = (ticker, type) => {
        const assetData = portfolioData.assets.find(a => a.ticker === ticker && a.type === type);
        if (assetData) setSelectedAsset(assetData);
    };

    if (loading) return <div className="p-8"><LoadingSpinner /></div>;
    if (error) return <div className="p-8"><ErrorMessage message={error} /></div>;
    
    if (!portfolioData || !portfolioData.assets || portfolioData.assets.length === 0) {
        return <div className="p-8"><EmptyState /></div>;
    }
    const sanitizedChartData = portfolioData.assets.map(asset => {
      // Converte o valor para string para segurança
      const valueAsString = String(asset.totalValue || '0');
      
      // Limpa o formato de moeda brasileiro (remove "R$", pontos e troca vírgula por ponto)
      const cleanedValue = valueAsString
          .replace('R$', '')      // Remove o "R$"
          .trim()                 // Remove espaços em branco
              // Remove o separador de milhar (ponto)
          .replace(',', '.');     // Troca a vírgula do decimal por ponto
  
      const numericValue = parseFloat(cleanedValue);
  
      return {
          ...asset,
          totalValue: numericValue
      };
  });
    const { totalValue, assetTypes, sectorAllocation } = portfolioData.summary;

    const tabs = [
        { id: 'overview', label: 'Visão Geral', icon: FaChartPie },
        { id: 'performance', label: 'Rentabilidade', icon: FaTrophy },
        { id: 'sector', label: 'Setores', icon: FaIndustry },
        { id: 'evolution', label: 'Evolução', icon: FaChartLine },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2"><ChartCard title="Alocação por Tipo" icon={FaChartPie}><AssetTypeDonutChart data={assetTypes} /></ChartCard></div>
                            <div className="lg:col-span-3"><ChartCard title="Top 7 Posições" icon={FaChartBar}><TopPositionsBarChart data={sanitizedChartData.slice(0, 7)} onAssetClick={handleAssetClick} /></ChartCard></div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md">
                            <h2 className="text-xl font-semibold text-gray-700 p-6 flex items-center gap-3"><FaThList className="text-indigo-500" />Composição Detalhada</h2>
                            <AllocationTable data={portfolioData.assets} totalPortfolioValue={totalValue} onAssetClick={handleAssetClick} />
                        </div>
                    </div>
                );
            case 'performance':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PerformanceBarChart data={portfolioData.assets} dataKey="gain" title="Maiores Ganhos Não Realizados" icon={FaTrophy} onAssetClick={handleAssetClick} />
                        <PerformanceBarChart data={portfolioData.assets} dataKey="loss" title="Maiores Perdas Não Realizadas" icon={FaSadTear} onAssetClick={handleAssetClick} />
                    </div>
                );
            case 'sector':
                return <SectorPieChart data={sectorAllocation} />;
            case 'evolution':
                return <PortfolioEvolutionChart userId={user.id} />;
            default: return null;
        }
    };

    return (
        <>
            {selectedAsset && <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
                <div className="container mx-auto max-w-7xl">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Análise de Desempenho</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Património Total" value={formatCurrency(totalValue)} />
                        <StatCard title="Variação do Dia" value={formatCurrency(navBarSummary.variacaoDia)} change={navBarSummary.variacaoDia} />
                        <StatCard title="Lucro/Prejuízo Total" value={formatCurrency(navBarSummary.totalReturn)} change={navBarSummary.totalReturn} />
                        <StatCard title="Rentabilidade Total" value={formatPercent(navBarSummary.rentabilidadeTotal * 100, 2)} change={navBarSummary.rentabilidadeTotal} isPercent />
                    </div>

                    <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-lg mb-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <TabButton key={tab.id} {...tab} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
                        ))}
                    </div>

                    <div className="animate-fade-in">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Graficos;