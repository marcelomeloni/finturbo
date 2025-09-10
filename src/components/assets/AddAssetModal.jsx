import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const assetTypes = [
  { id: 'acao', name: 'Ação' }, { id: 'fii', name: 'FII' }, 
  { id: 'stock', name: 'Stock' }, { id: 'reit', name: 'REIT' }, 
  { id: 'cripto', name: 'Cripto' }
];
const transactionTypes = [
  { id: 'compra', name: 'Compra' }, { id: 'venda', name: 'Venda' }
];

// O modal agora aceita uma prop `transactionToEdit`
const AddAssetModal = ({ onClose, onSaveSuccess, transactionToEdit }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Se estiver editando, preenche o formulário com os dados existentes.
  // Senão, começa com os valores padrão.
  const [formData, setFormData] = useState({
    assetType: transactionToEdit?.asset_type || 'acao',
    transactionType: transactionToEdit?.transaction_type || 'compra',
    ticker: transactionToEdit?.ticker || '',
    quantity: transactionToEdit?.quantity || '',
    price: transactionToEdit?.price || '',
    transaction_date: transactionToEdit?.transaction_date || new Date().toISOString().split('T')[0],
  });

  const isEditing = !!transactionToEdit; // Define se estamos no modo de edição

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (parseFloat(formData.quantity) <= 0 || parseFloat(formData.price) < 0) {
      setError('Quantidade e preço devem ser valores positivos.');
      setIsLoading(false);
      return;
    }

    try {
      const transactionData = {
        user_id: user.id,
        ticker: formData.ticker.toUpperCase(),
        asset_type: formData.assetType,
        transaction_type: formData.transactionType,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        transaction_date: formData.transaction_date,
      };

      let query;
      if (isEditing) {
        // Se estiver editando, faz um UPDATE
        query = supabase.from('transacoes').update(transactionData).eq('id', transactionToEdit.id);
      } else {
        // Senão, faz um INSERT
        query = supabase.from('transacoes').insert([transactionData]);
      }

      const { error: dbError } = await query;
      if (dbError) throw dbError;

      onSaveSuccess();
      onClose();

    } catch (err) {
      setError(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Transação' : 'Nova Transação'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* O formulário agora é um passo só para simplificar a edição */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Tipo de Ativo</label>
            <div className="grid grid-cols-3 gap-2">
              {assetTypes.map(type => (
                <button key={type.id} type="button" onClick={() => handleChange({ target: { name: 'assetType', value: type.id } })}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg ${formData.assetType === type.id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="ticker" className="block text-sm font-medium text-gray-600">Ticker</label>
            <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-600">Quantidade</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required step="any" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-600">Preço (Unitário)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required step="any" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-600">Data da Operação</label>
              <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Operação</label>
              <select name="transactionType" value={formData.transactionType} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                {transactionTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-300">
              {isLoading && <FaSpinner className="animate-spin" />}
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
