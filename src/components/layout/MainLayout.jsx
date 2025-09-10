import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Tabs from './Tabs';
import AddAssetModal from '../assets/AddAssetModal';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
    // Pega o estado e as funções do contexto para controlar o modal
    const { isModalOpen, closeModal, refreshPortfolio } = useAuth();

    // Função que será passada para o modal para atualizar tudo após salvar
    const handleSaveSuccess = () => {
        // A função refreshPortfolio do contexto já atualiza o resumo na Navbar.
        // As páginas individuais (Dashboard, Lançamentos) têm sua própria lógica para recarregar a lista de ativos.
        refreshPortfolio(); 
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <Tabs />
            <main className="container mx-auto p-6">
                <Outlet />
            </main>

            {/* O modal de Adicionar Ativo agora "vive" aqui, controlado pelo contexto */}
            {isModalOpen && (
                <AddAssetModal 
                    onClose={closeModal} 
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
};

export default MainLayout;
