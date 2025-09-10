import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const ProfilePage = () => {
  const { user } = useAuth(); // Pega o usuário logado do nosso contexto
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Estados para os campos do formulário
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // useEffect para buscar os dados do perfil no Supabase quando a página carregar
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, website, avatar_url')
        .eq('id', user.id)
        .single(); // .single() pega apenas um resultado

      if (error) {
        console.warn(error.message);
      } else if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setWebsite(data.website || '');
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user.id]);

  // Função para salvar as alterações no Supabase
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const updates = {
      id: user.id,
      full_name: fullName,
      username,
      website,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      setMessage('Erro ao atualizar o perfil: ' + error.message);
    } else {
      setMessage('Perfil atualizado com sucesso!');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h1>
      
      {loading ? <p>Carregando perfil...</p> : (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="text" value={user.email} disabled className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
            <input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg disabled:bg-blue-300">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
          {message && <p className="text-center mt-4">{message}</p>}
        </form>
      )}
    </div>
  );
};

export default ProfilePage;