import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';

// Chave da sua API da Finnhub (coloque em um arquivo .env no futuro)
const API_KEY = 'SUA_CHAVE_API_DA_FINNHUB_AQUI';

const AssetSearchBar = ({ onAssetSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função de busca com "debouncing" para não chamar a API a cada tecla
  const searchAssets = useCallback(async (query) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${API_KEY}`);
      const data = await response.json();
      // Filtramos para mostrar apenas ações e ETFs do Brasil e EUA
      const filteredResults = data.result.filter(
        item => (item.symbol.includes('.SA') || !item.symbol.includes('.')) && (item.type === 'Common Stock' || item.type === 'ETF')
      );
      setResults(filteredResults.slice(0, 5)); // Mostra apenas os 5 primeiros resultados
    } catch (error) {
      console.error("Erro ao buscar ativos:", error);
      setResults([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchAssets(searchTerm);
    }, 300); // Espera 300ms após o usuário parar de digitar

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, searchAssets]);

  const handleSelect = (asset) => {
    onAssetSelect(asset); // Envia o ativo selecionado para o componente pai (Modal)
    setSearchTerm(asset.symbol);
    setResults([]);
  };

  return (
    <div className="relative">
      <label htmlFor="identifier" className="block text-sm font-medium text-gray-600">
        Ticker do Ativo
      </label>
      <div className="relative mt-1">
        <input
          type="text"
          name="identifier"
          id="identifier"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Pesquise por PETR4, AAPL..."
          autoComplete="off"
          required
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
      </div>
      
      {/* Resultados da busca */}
      {(isLoading || results.length > 0) && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <li className="px-4 py-2 text-gray-500">Buscando...</li>
          ) : (
            results.map(asset => (
              <li
                key={asset.symbol}
                onClick={() => handleSelect(asset)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              >
                <div className="font-bold">{asset.symbol}</div>
                <div className="text-sm text-gray-500">{asset.description}</div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default AssetSearchBar;