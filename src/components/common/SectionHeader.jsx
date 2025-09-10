import React from 'react';

// Componente genérico para títulos de seção
// Aceita um 'title' e 'children' para colocar qualquer elemento à direita (como um botão)
const SectionHeader = ({ title, children }) => {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export default SectionHeader;