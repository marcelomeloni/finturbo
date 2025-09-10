// src/components/charts/TopPositionsBarChart.js

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const formatCurrency = (value) => `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-sm text-green-600 font-semibold">{`Valor Total: ${payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
            </div>
        );
    }
    return null;
};

const TopPositionsBarChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCurrency} />
                    <YAxis dataKey="ticker" type="category" width={60} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }} />
                    <Bar dataKey="totalValue" fill="#16a34a" radius={[0, 10, 10, 0]} barSize={25} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TopPositionsBarChart;