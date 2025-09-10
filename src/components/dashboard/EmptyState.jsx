import React from 'react';
import { FaPlus } from 'react-icons/fa'; // Ícone para o botão

const EmptyState = () => {
  return (
    <div className="bg-white text-center p-12 rounded-xl shadow-md flex flex-col items-center">
      <h3 className="text-2xl font-semibold text-gray-700">
        Nenhum ativo adicionado
      </h3>
      <p className="text-gray-500 mt-2 mb-8">
        Comece adicionando seus investimentos ou integre com a B3.
      </p>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-700 transition-transform hover:scale-105"
        >
          Adicionar Ativo
        </button>
        <button 
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-500 transition-transform hover:scale-105"
        >
          Integrar com a B3
        </button>
      </div>
    </div>
  );
};

export default EmptyState;