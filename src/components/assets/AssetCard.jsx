import React, { useState, useEffect } from 'react';
import { FaArrowTrendUp, FaArrowTrendDown, FaSpinner, FaChevronDown } from "react-icons/fa6";

// URL da sua API backend
const API_URL = 'http://127.0.0.1:5000';

const AssetCard = ({ asset }) => {
  const [marketData, setMarketData] = useState({ price: null, change: null, percentChange: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar a expansão do card

  useEffect(() => {
    const fetchQuote = async () => {
      if (!asset.identifier || !asset.assetType) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/quote/${asset.assetType}/${asset.identifier}`);
        const data = await response.json();
        if (response.ok) setMarketData(data);
        else throw new Error(data.error);
      } catch (error) {
        console.error(`Erro ao buscar cotação para ${asset.identifier}:`, error);
        setMarketData({ price: null, change: 'Erro', percentChange: 0 });
      }
      setIsLoading(false);
    };
    fetchQuote();
  }, [asset.identifier, asset.assetType]);

  // --- Novos Cálculos ---
  const averagePrice = asset.totalCost / asset.quantity;
  const currentValue = marketData.price ? marketData.price * asset.quantity : 0;
  const totalReturn = currentValue - asset.totalCost;
  const totalReturnPercent = (totalReturn / asset.totalCost) * 100;

  const formatCurrency = (value) => (typeof value === 'number') ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ --';
  
  return (
    <div className="bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-xl">
      {/* Parte Visível (Collapsed) */}
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 h-12 w-12 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg border-2 border-gray-200">
            {asset.identifier.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-800">{asset.identifier}</p>
            <p className="text-sm text-gray-500">{asset.quantity.toLocaleString('pt-BR')} unidades</p>
          </div>
        </div>
        <div className="text-right">
          {isLoading ? (
            <FaSpinner className="animate-spin text-gray-400" />
          ) : (
            <>
              <p className="font-bold text-lg text-gray-900">{formatCurrency(currentValue)}</p>
              <div className={`flex items-center justify-end gap-1.5 font-semibold text-sm ${marketData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marketData.change >= 0 ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
                <span>{formatCurrency(marketData.change)} ({(marketData.percentChange || 0).toFixed(2)}%)</span>
              </div>
            </>
          )}
        </div>
        <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Parte Expansível */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="border-t border-gray-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 font-medium">Preço Médio</p>
            <p className="font-semibold text-gray-800">{formatCurrency(averagePrice)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Custo Total</p>
            <p className="font-semibold text-gray-800">{formatCurrency(asset.totalCost)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Retorno Total</p>
            <p className={`font-semibold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalReturn)}
            </p>
          </div>
           <div>
            <p className="text-xs text-gray-500 font-medium">Rentabilidade</p>
            <p className={`font-semibold ${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isFinite(totalReturnPercent) ? `${totalReturnPercent.toFixed(2)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;