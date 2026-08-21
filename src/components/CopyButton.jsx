import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';

const CopyButton = ({ text, className = "" }) => {
    const { isCopied, copyToClipboard } = useClipboard();

    return (
        <button
            onClick={() => copyToClipboard(text)}
            className={`p-2 rounded flex items-center justify-center transition-colors ${
                isCopied 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            } ${className}`}
            title="Copy to clipboard"
        >
            {isCopied ? <Check size={18} /> : <Copy size={18} />}
        </button>
    );
};

export default CopyButton;
