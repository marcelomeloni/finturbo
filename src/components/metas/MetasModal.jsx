import React, { useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../contexts/AuthContext';

// --- ÍCONES (como componentes SVG) ---
const FaTimes = (props) => ( <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" {...props}><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>);
const FaSave = (props) => ( <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" {...props}><path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A12 12 0 0 1 320 111.48z"></path></svg>);
const FaChartLine = (props) => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 128 146.7l-45.3 45.3-22.6 22.6c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0l128-128zM48 352h416c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32s14.3-32 32-32z"></path></svg>);
const FaArchive = (props) => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}><path d="M32 448c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V160H32v288zm160-212c0-6.6 5.4-12 12-12h96c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-96c-6.6 0-12-5.4-12-12v-40zM512 64H384L368 32H144L128 64H0v48h512V64z"></path></svg>);
const FaDonate = (props) => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" {...props}><path d="M544 112c-20.83 0-38.67 11.25-48 27.54C486.2 135.5 474.3 134 462 134c-17.67 0-32 14.33-32 32s14.33 32 32 32c3.09 0 6.08-.439 8.94-1.26l22.38 11.19C490.3 218.4 482.2 224 473.3 224c-26.51 0-48 21.49-48 48s21.49 48 48 48c7.34 0 14.32-1.638 20.69-4.69l-11.25 22.5C478.4 340.9 475.3 342 472 342c-17.67 0-32 14.33-32 32s14.33 32 32 32c12.32 0 23.22-6.969 28.5-17.46l4.69 23.44C499.7 433.8 488.7 448 473.3 448c-35.35 0-64-28.65-64-64s28.65-64 64-64c.229 0 .449.016.68.025l11.08-22.15C478.5 288.6 473.3 280.8 473.3 272c0-13.25 10.75-24 24-24c1.92 0 3.79.229 5.59.67l11.25-22.5C509.6 216.9 500.8 208.5 490.7 208.5c-13.25 0-24 10.75-24 24c0 3.19 1.959 10.3 2.1 10.75l-22.25 11.12C440.6 250.2 432.8 248.6 432.8 248.6c-17.67 0-32 14.33-32 32s14.33 32 32 32c15.64 0 28.74-11.29 31.5-26.04l5.62 14.06c-10.61 7.42-17.13 19.53-17.13 33.98c0 22.09 17.91 40 40 40s40-17.91 40-40c0-11.64-5.01-22.11-13.06-29.4l11.25-22.5c4.13 1.9 8.63 2.91 13.31 2.91c17.67 0 32-14.33 32-32s-14.33-32-32-32c-1.92 0-3.79.229-5.59.67l-22.5-11.25C515.2 165.8 528 152.9 528 136c0-22.09-17.91-40-40-40h-24c-22.09 0-40 17.91-40 40c0 13.52 6.81 25.4 17.06 32.54l-14.25 7.12C419.6 156.9 416.7 154.9 416.7 154.9c-17.67 0-32 14.33-32 32s14.33 32 32 32c12.29 0 22.88-6.93 28.18-17.17l11.25 11.25c-4.4 6.01-6.94 13.23-6.94 20.92"></path></svg>);

// --- Componente do Seletor de Tipo de Meta ---
const TipoMetaSelector = ({ tipoMeta, setTipoMeta }) => {
    const tipos = [
        { id: 'patrimonio', nome: 'Patrimônio', icone: <FaChartLine /> },
        { id: 'proventos', nome: 'Renda Passiva', icone: <FaDonate /> },
        { id: 'ativo', nome: 'Ativo Específico', icone: <FaArchive /> },
    ];
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Qual o tipo da sua meta?</label>
            <div className="grid grid-cols-3 gap-3">
                {tipos.map(tipo => (
                    <button
                        key={tipo.id}
                        type="button"
                        onClick={() => setTipoMeta(tipo.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                            tipoMeta === tipo.id ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="text-xl mx-auto mb-1">{tipo.icone}</div>
                        <span className="text-xs font-semibold">{tipo.nome}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Componente Principal do Modal ---
const MetasModal = ({ onClose, onSaveSuccess }) => {
    const { user } = useAuth();
    const [tipoMeta, setTipoMeta] = useState('patrimonio');
    const [valorAlvo, setValorAlvo] = useState('');
    const [dataAlvo, setDataAlvo] = useState('');
    const [tickerAtivo, setTickerAtivo] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Função para validar os campos do formulário
    const validate = async () => {
        const newErrors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data

        // Validação de campos vazios
        if (!valorAlvo) newErrors.valorAlvo = 'O valor alvo é obrigatório.';
        if (!dataAlvo) newErrors.dataAlvo = 'A data alvo é obrigatória.';
        if (tipoMeta === 'ativo' && !tickerAtivo) newErrors.tickerAtivo = 'O ticker do ativo é obrigatório.';

        // Validação da data (não pode ser no passado)
        if (dataAlvo && new Date(dataAlvo) < today) {
            newErrors.dataAlvo = 'A data não pode ser anterior a hoje.';
        }

        // Se já houver erros básicos, não faz a consulta no banco
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        // Validação de duplicidade no banco de dados
        try {
            if (tipoMeta === 'ativo') {
                const { data, error } = await supabase.from('metas')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('ticker_ativo', tickerAtivo.toUpperCase())
                    .single(); // .single() espera 0 ou 1 resultado
                if (data) newErrors.tickerAtivo = `Você já possui uma meta para ${tickerAtivo.toUpperCase()}.`;
                if (error && error.code !== 'PGRST116') throw error; // Ignora erro "nenhuma linha encontrada"
            } else {
                const { data, error } = await supabase.from('metas')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('tipo_meta', tipoMeta)
                    .single();
                if (data) newErrors.geral = `Você já possui uma meta de ${tipoMeta}.`;
                if (error && error.code !== 'PGRST116') throw error;
            }
        } catch (dbError) {
            console.error("Erro na validação do Supabase:", dbError);
            newErrors.geral = "Erro ao validar a meta. Tente novamente.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = await validate();
        if (!isValid) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('metas').insert({
                user_id: user.id,
                tipo_meta: tipoMeta,
                valor_alvo: parseFloat(valorAlvo),
                data_alvo: dataAlvo,
                ticker_ativo: tipoMeta === 'ativo' ? tickerAtivo.toUpperCase() : null,
            });

            if (error) throw error;
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar meta:", error);
            setErrors({ geral: "Não foi possível salvar a meta. Tente novamente." });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-modal-in" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Criar Nova Meta</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><FaTimes /></button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <TipoMetaSelector tipoMeta={tipoMeta} setTipoMeta={setTipoMeta} />

                    {tipoMeta === 'ativo' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Qual Ativo?</label>
                            <input type="text" value={tickerAtivo} onChange={(e) => setTickerAtivo(e.target.value)} placeholder="Ex: PETR4, BTC, AAPL" className={`w-full p-2.5 border ${errors.tickerAtivo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors`} />
                            {errors.tickerAtivo && <p className="text-red-600 text-xs mt-1">{errors.tickerAtivo}</p>}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                            {tipoMeta === 'ativo' ? 'Quantidade Alvo' : 'Valor Alvo'}
                        </label>
                        <div className="relative">
                            {tipoMeta !== 'ativo' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>}
                            <input type="number" value={valorAlvo} onChange={(e) => setValorAlvo(e.target.value)} placeholder="100000" className={`w-full p-2.5 border ${errors.valorAlvo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${tipoMeta !== 'ativo' ? 'pl-9' : ''}`} />
                        </div>
                        {errors.valorAlvo && <p className="text-red-600 text-xs mt-1">{errors.valorAlvo}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Até quando?</label>
                        <input type="date" value={dataAlvo} onChange={(e) => setDataAlvo(e.target.value)} className={`w-full p-2.5 border ${errors.dataAlvo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors`} />
                        {errors.dataAlvo && <p className="text-red-600 text-xs mt-1">{errors.dataAlvo}</p>}
                    </div>

                    {errors.geral && <p className="text-red-600 text-sm text-center font-semibold bg-red-50 p-3 rounded-lg">{errors.geral}</p>}

                    <footer className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2">
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : <FaSave />}
                            {loading ? 'Salvando...' : 'Salvar Meta'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default MetasModal;

