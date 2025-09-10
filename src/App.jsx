import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts e Páginas
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Graficos from './pages/Graficos';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import TransactionsPage from './pages/TransactionsPage';
// Componente de Rota Protegida
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === ROTAS PÚBLICAS === */}
        {/* Acessíveis a todos, mesmo sem login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* === ROTAS PRIVADAS === */}
        {/* Envolve o layout principal com o componente de proteção */}
        <Route
          path="/*" // Captura a rota raiz ("/") e qualquer outra
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Rotas filhas que serão renderizadas dentro do MainLayout */}
          <Route path="" element={<Dashboard />} /> {/* Rota raiz ("/") */}
          <Route path="graficos" element={<Graficos />} /> {/* Rota "/graficos" */}
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="lancamentos" element={<TransactionsPage />} /> {/* <-- ADICIONE ESTA ROTA */}
          {/* Adicione outras páginas protegidas aqui */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;