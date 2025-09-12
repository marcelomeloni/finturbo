import React from 'react';

// Ícones como componentes SVG para evitar erros de importação
const FaBullseye = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" {...props}>
        <path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM256 320a64 64 0 1 1 0-128 64 64 0 1 1 0 128zm0 128a192 192 0 1 0 0-384 192 192 0 1 0 0 384zM128 256a128 128 0 1 1 256 0 128 128 0 1 1 -256 0z"></path>
    </svg>
);

const FaPlus = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" {...props}>
        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"></path>
    </svg>
);

const EmptyStateMetas = ({ onCriarMeta }) => {
    return (
        <div className="text-center bg-white p-12 rounded-xl shadow-md border">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-5">
                <FaBullseye className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Nenhuma meta definida ainda</h3>
            <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
                Definir metas é o primeiro passo para transformar o invisível em visível. Crie sua primeira meta e comece a construir seu futuro.
            </p>
            <button
                onClick={onCriarMeta}
                className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 inline-flex items-center gap-2"
            >
                <FaPlus />
                Criar Primeira Meta
            </button>
        </div>
    );
};

export default EmptyStateMetas;

