// src/components/charts/AssetTypeDonutChart.js

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
    'Ação': '#3b82f6',   // Blue
    'FII': '#16a34a',    // Green
    'Stock': '#f97316',  // Orange
    'REIT': '#c026d3',   // Fuchsia
    'Cripto': '#facc15', // Yellow
    'Renda Fixa': '#6b7280', // Gray
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{data.name}</p>
        <p className="text-sm text-green-600 font-semibold">{`Valor: ${data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
        <p className="text-sm text-gray-500">{`Porcentagem: ${data.percentage.toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

const AssetTypeDonutChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#cccccc'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetTypeDonutChart;