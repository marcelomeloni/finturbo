import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import AddAssetModal from '../components/assets/AddAssetModal';
import { FaEdit, FaTrash, FaSpinner, FaPlus } from 'react-icons/fa';

// Componente para uma única linha da transação
const TransactionRow = ({ tx, onEdit, onDelete }) => {
  const isBuy = tx.transaction_type === 'compra';
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}>
          {tx.ticker.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-gray-800">{tx.ticker}</p>
          <p className="text-sm text-gray-500">
            {tx.quantity} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.price)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isBuy ? 'text-green-600' : 'text-red-600'}`}>
          {isBuy ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.quantity * tx.price)}
        </p>
        <div className="flex items-center justify-end gap-3 mt-1">
          <button onClick={() => onEdit(tx)} className="text-gray-400 hover:text-blue-600"><FaEdit /></button>
          <button onClick={() => onDelete(tx)} className="text-gray-400 hover:text-red-600"><FaTrash /></button>
        </div>
      </div>
    </div>
  );
};

// Componente para o modal de confirmação de exclusão
const DeleteConfirmationModal = ({ transaction, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-8 m-4 max-w-sm w-full">
      <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
      <p className="text-gray-600 mb-6">
        Tem certeza que deseja excluir a transação do ativo <strong>{transaction.ticker}</strong>? Esta ação não pode ser desfeita.
      </p>
      <div className="flex justify-end gap-4">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Cancelar</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">Excluir</button>
      </div>
    </div>
  </div>
);

const TransactionsPage = () => {
  const { user, refreshPortfolio } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null); // Guarda a transação para editar
  const [deletingTransaction, setDeletingTransaction] = useState(null); // Guarda a transação para deletar

  // Função para buscar e agrupar as transações
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error("Erro ao buscar transações:", error);
    } else {
      // Agrupa as transações por data
      const grouped = data.reduce((acc, tx) => {
        const date = new Date(tx.transaction_date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
      }, {});
      setTransactions(grouped);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSaveSuccess = () => {
    setEditingTransaction(null);
    fetchTransactions();
    refreshPortfolio(); // Atualiza o resumo na Navbar
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    const { error } = await supabase.from('transacoes').delete().eq('id', deletingTransaction.id);
    if (error) {
      alert("Erro ao excluir transação: " + error.message);
    } else {
      setDeletingTransaction(null);
      fetchTransactions();
      refreshPortfolio();
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Lançamentos</h1>
          <button onClick={() => setEditingTransaction({})} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-700">
            <FaPlus size={12} />
            Nova Transação
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10"><FaSpinner className="animate-spin mx-auto text-2xl text-gray-400" /></div>
        ) : Object.keys(transactions).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(transactions).map(([date, txs]) => (
              <div key={date}>
                <h2 className="font-semibold text-gray-500 mb-2">{date}</h2>
                <div className="space-y-3">
                  {txs.map(tx => <TransactionRow key={tx.id} tx={tx} onEdit={setEditingTransaction} onDelete={setDeletingTransaction} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">Nenhuma transação encontrada.</p>
        )}
      </div>

      {/* Modais de Edição e Exclusão */}
      {editingTransaction && (
        <AddAssetModal
          onClose={() => setEditingTransaction(null)}
          onSaveSuccess={handleSaveSuccess}
          transactionToEdit={Object.keys(editingTransaction).length > 0 ? editingTransaction : null}
        />
      )}
      {deletingTransaction && (
        <DeleteConfirmationModal
          transaction={deletingTransaction}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTransaction(null)}
        />
      )}
    </>
  );
};

export default TransactionsPage;
