import React from 'react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { name: 'Resumo', path: '/' },
  { name: 'Gráficos', path: '/graficos' },
  { name: 'Metas', path: '/metas' },
  { name: 'Análise', path: '/analise' },
  { name: 'Lançamentos', path: '/lancamentos' },
  { name: 'Proventos', path: '/proventos' },
  { name: 'Simulador', path: '/simulador' },
];

const Tabs = () => {
  const baseStyle = "px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-300";
  const getTabClassName = ({ isActive }) => `${baseStyle} ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <nav className="container mx-auto flex space-x-6 px-4">
        {tabs.map((tab) => (
          <NavLink key={tab.name} to={tab.path} end={tab.path === '/'} className={getTabClassName}>
            {tab.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;