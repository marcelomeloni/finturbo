import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaBars, FaTimes, FaEye, FaEyeSlash, FaUserCircle, FaSpinner } from 'react-icons/fa';
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

const Navbar = () => {
  const [isValuesVisible, setIsValuesVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Pega a função 'openModal' do contexto
  const { signOut, summary, loadingSummary, openModal } = useAuth();

  const HiddenValue = () => <span className="inline-block bg-gray-200 rounded-md w-24 h-5 animate-pulse"></span>;
  const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPercent = (value) => (value || 0).toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 2 });

  const renderSummaryValue = (value, formatter) => {
    if (loadingSummary) return <FaSpinner className="animate-spin text-gray-400 mx-auto" />;
    if (!isValuesVisible) return <HiddenValue />;
    return formatter(value);
  };

  return (
    <nav className="bg-white text-gray-800 shadow-sm relative z-20 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="bg-blue-500 h-9 w-9 rounded-lg flex items-center justify-center font-bold text-white text-lg">F</div>
            <span className="text-xl font-bold tracking-wider">FINTURBO</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <div className="text-center w-32">
              <p className="text-xs text-gray-500 font-semibold tracking-wider">SALDO BRUTO</p>
              <p className="text-lg font-bold">{renderSummaryValue(summary.saldoBruto, formatCurrency)}</p>
            </div>
            <div className="text-center w-32">
              <p className="text-xs text-gray-500 font-semibold tracking-wider">VARIAÇÃO (DIA)</p>
              <div className={`flex items-center justify-center gap-1.5 text-lg font-bold ${isValuesVisible && (summary.variacaoDia >= 0 ? 'text-green-600' : 'text-red-600')}`}>
                {isValuesVisible && !loadingSummary && (summary.variacaoDia >= 0 ? <FaArrowTrendUp /> : <FaArrowTrendDown />)}
                <span>{renderSummaryValue(summary.variacaoDia, formatCurrency)}</span>
              </div>
            </div>
            <div className="text-center w-32">
              <p className="text-xs text-gray-500 font-semibold tracking-wider">RENTABILIDADE</p>
              <p className={`text-lg font-bold ${summary.rentabilidadeTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{renderSummaryValue(summary.rentabilidadeTotal, formatPercent)}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => setIsValuesVisible(!isValuesVisible)} className="text-gray-500 hover:text-gray-900 transition-colors">{isValuesVisible ? <FaEyeSlash size={22} /> : <FaEye size={22} />}</button>
            
            {/* O onClick agora chama a função do contexto */}
            <button onClick={openModal} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-700 transition-transform hover:scale-105">
              <FaPlus size={12} /> Adicionar Ativo
            </button>
            
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FaUserCircle size={40} className="text-gray-400" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 ring-1 ring-black ring-opacity-5">
                <Menu.Item>{({ active }) => (<Link to="/perfil" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>Meu Perfil</Link>)}</Menu.Item>
                <Menu.Item>{({ active }) => (<button onClick={signOut} className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}>Sair</button>)}</Menu.Item>
              </Menu.Items>
            </Menu>
          </div>

          <div className="md:hidden flex items-center"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-900">{isMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}</button></div>
        </div>
      </div>
      {/* O Menu Mobile deve ser atualizado para também usar a função openModal */}
    </nav>
  );
};

export default Navbar;
