import React from 'react';

// --- Ícones como Componentes SVG para evitar erros de importação ---
const FaChartLine = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}>
        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 128 146.7l-45.3 45.3-22.6 22.6c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0l128-128zM48 352h416c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32s14.3-32 32-32z"></path>
    </svg>
);
const FaArchive = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}>
        <path d="M32 448c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V160H32v288zm160-212c0-6.6 5.4-12 12-12h96c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-96c-6.6 0-12-5.4-12-12v-40zM512 64H384L368 32H144L128 64H0v48h512V64z"></path>
    </svg>
);
const FaDonate = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" {...props}>
        <path d="M544 112c-20.83 0-38.67 11.25-48 27.54C486.2 135.5 474.3 134 462 134c-17.67 0-32 14.33-32 32s14.33 32 32 32c3.09 0 6.08-.439 8.94-1.26l22.38 11.19C490.3 218.4 482.2 224 473.3 224c-26.51 0-48 21.49-48 48s21.49 48 48 48c7.34 0 14.32-1.638 20.69-4.69l-11.25 22.5C478.4 340.9 475.3 342 472 342c-17.67 0-32 14.33-32 32s14.33 32 32 32c12.32 0 23.22-6.969 28.5-17.46l4.69 23.44C499.7 433.8 488.7 448 473.3 448c-35.35 0-64-28.65-64-64s28.65-64 64-64c.229 0 .449.016.68.025l11.08-22.15C478.5 288.6 473.3 280.8 473.3 272c0-13.25 10.75-24 24-24c1.92 0 3.79.229 5.59.67l11.25-22.5C509.6 216.9 500.8 208.5 490.7 208.5c-13.25 0-24 10.75-24 24c0 3.19 1.959 10.3 2.1 10.75l-22.25 11.12C440.6 250.2 432.8 248.6 432.8 248.6c-17.67 0-32 14.33-32 32s14.33 32 32 32c15.64 0 28.74-11.29 31.5-26.04l5.62 14.06c-10.61 7.42-17.13 19.53-17.13 33.98c0 22.09 17.91 40 40 40s40-17.91 40-40c0-11.64-5.01-22.11-13.06-29.4l11.25-22.5c4.13 1.9 8.63 2.91 13.31 2.91c17.67 0 32-14.33 32-32s-14.33-32-32-32c-1.92 0-3.79.229-5.59.67l-22.5-11.25C515.2 165.8 528 152.9 528 136c0-22.09-17.91-40-40-40h-24c-22.09 0-40 17.91-40 40c0 13.52 6.81 25.4 17.06 32.54l-14.25 7.12C419.6 156.9 416.7 154.9 416.7 154.9c-17.67 0-32 14.33-32 32s14.33 32 32 32c12.29 0 22.88-6.93 28.18-17.17l11.25 11.25c-4.4 6.01-6.94 13.23-6.94 20.92"></path>
    </svg>
);
const FaQuestionCircle = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}>
        <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 400c-17.67 0-32-14.33-32-32s14.33-32 32-32s32 14.33 32 32S273.7 400 256 400zM256 304c-17.67 0-32-14.33-32-32v-64c0-17.67 14.33-32 32-32s32 14.33 32 32v64C288 289.7 273.7 304 256 304z"></path>
    </svg>
);


const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' });

const ProgressBar = ({ value }) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${clampedValue}%` }}></div>
        </div>
    );
};

const getProgresso = (meta, progressoData) => {
    if (!progressoData) return { valorAtual: 0, percentual: 0 };

    switch (meta.tipo_meta) {
        case 'patrimonio':
            return {
                valorAtual: progressoData.patrimonio,
                percentual: (progressoData.patrimonio / meta.valor_alvo) * 100
            };
        case 'proventos':
             return {
                valorAtual: progressoData.proventos_mensal,
                percentual: (progressoData.proventos_mensal / meta.valor_alvo) * 100
            };
        case 'ativo':
            const qtdAtual = progressoData.ativos[meta.ticker_ativo.toUpperCase()] || 0;
            return {
                valorAtual: qtdAtual,
                percentual: (qtdAtual / meta.valor_alvo) * 100
            };
        default:
            return { valorAtual: 0, percentual: 0 };
    }
};

const META_CONFIG = {
    patrimonio: { icon: <FaChartLine />, title: "Meta de Patrimônio", format: formatCurrency },
    proventos: { icon: <FaDonate />, title: "Meta de Renda Passiva", format: formatCurrency },
    ativo: { icon: <FaArchive />, title: (meta) => `Meta de ${meta.ticker_ativo.toUpperCase()}`, format: (val) => val.toLocaleString('pt-BR') },
};

const MetaCard = ({ meta, progresso }) => {
    const config = META_CONFIG[meta.tipo_meta];
    const { valorAtual, percentual } = getProgresso(meta, progresso);
    
    const title = typeof config.title === 'function' ? config.title(meta) : config.title;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
            <div>
                <div className="flex items-center text-gray-500 mb-4">
                    <span className="text-xl mr-3 text-blue-500">{config.icon}</span>
                    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                </div>
                
                <div className="my-4">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-2xl font-bold text-gray-900">{config.format(valorAtual)}</span>
                        <span className="text-sm font-semibold text-gray-500">/ {config.format(meta.valor_alvo)}</span>
                    </div>
                    <ProgressBar value={percentual} />
                    <p className="text-right text-sm font-bold text-green-600 mt-1">{percentual.toFixed(1)}%</p>
                </div>

                <div className="text-sm text-gray-500">
                    <p><strong>Prazo:</strong> {formatDate(meta.data_alvo)}</p>
                </div>
            </div>

            <button className="mt-6 w-full bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2">
                <FaQuestionCircle />
                Como alcançar essa meta?
            </button>
        </div>
    );
};

export default MetaCard;

