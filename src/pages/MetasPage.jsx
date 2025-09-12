import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import MetaCard from '../components/metas/MetaCard';
import EmptyStateMetas from '../components/metas/EmptyStateMetas';
import MetasModal from '../components/metas/MetasModal';
import { FaPlus } from 'react-icons/fa';

const API_URL = 'http://127.0.0.1:5000'; // URL da sua API Flask

const MetasPage = () => {
    const { user } = useAuth();
    const [metas, setMetas] = useState([]);
    const [progresso, setProgresso] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalAberta, setModalAberta] = useState(false);
    
    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Busca as metas salvas e os dados de progresso em paralelo
            const [metasRes, progressRes] = await Promise.all([
                supabase.from('metas').select('*').eq('user_id', user.id),
                fetch(`${API_URL}/api/portfolio/progress?user_id=${user.id}`)
            ]);

            const { data: metasData, error: metasError } = metasRes;
            if (metasError) throw metasError;
            
            const progressData = await progressRes.json();
            if (!progressRes.ok) throw new Error(progressData.error);
            
            setMetas(metasData || []);
            setProgresso(progressData);
        } catch (error) {
            console.error("Erro ao buscar dados das metas:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="p-8 text-center">Carregando metas...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="container mx-auto max-w-7xl">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Painel de Metas</h1>
                        <p className="text-gray-500 mt-1">Seus objetivos financeiros em um só lugar.</p>
                    </div>
                    <button 
                        onClick={() => setModalAberta(true)}
                        className="mt-4 sm:mt-0 bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-all shadow-md inline-flex items-center gap-2">
                        <FaPlus size={14} />
                        Adicionar Meta
                    </button>
                </header>

                {metas.length === 0 ? (
                    <EmptyStateMetas onCriarMeta={() => setModalAberta(true)} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {metas.map(meta => (
                            <MetaCard key={meta.id} meta={meta} progresso={progresso} />
                        ))}
                    </div>
                )}
                
                {modalAberta && (
                    <MetasModal 
                        onClose={() => setModalAberta(false)} 
                        onSaveSuccess={fetchData} 
                    />
                )}
            </div>
        </div>
    );
};

export default MetasPage;

