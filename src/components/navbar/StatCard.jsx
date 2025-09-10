import React from 'react';

// Aceita um ícone, um título e um valor como propriedades (props)
const StatCard = ({ icon, label, value }) => {
  // O 'icon' que passarmos será um componente, por isso o renderizamos como <Icon />
  const Icon = icon;

  return (
    <div className="flex items-center gap-4">
      {/* Container do Ícone */}
      <div className="bg-gray-100 p-3 rounded-full">
        <Icon className="h-6 w-6 text-gray-600" />
      </div>
      {/* Textos */}
      <div>
        <p className="text-xs text-gray-500 uppercase">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;