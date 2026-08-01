import React, { useState, useEffect } from 'react';
import { Save, X, FileText } from 'lucide-react';
import api from '../api';
import { ENDPOINTS } from '../endpoints';

const FileEditor = ({ repositoryId, filePath, onClose }) => {
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            if (!filePath) return;
            try {
                setLoading(true);
                const res = await api.get(ENDPOINTS.files.content, {
                    params: { repository_id: repositoryId, path: filePath }
                });
                setContent(res.data.content);
                setOriginalContent(res.data.content);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Failed to load file content.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [repositoryId, filePath]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put(ENDPOINTS.files.save, {
                repository_id: repositoryId,
                path: filePath,
                content: content
            });
            setOriginalContent(content);
            alert("File saved successfully.");
        } catch (err) {
            console.error(err);
            alert(`Error saving file: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = content !== originalContent;

    if (!filePath) {
        return (
            <div className="glass-panel h-full flex items-center justify-center text-[var(--text-secondary)]">
                Select a file to edit
            </div>
        );
    }

    return (
        <div className="glass-panel h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] rounded-t-lg">
                <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                    <FileText size={16} color="var(--accent)" />
                    <span className="font-mono">{filePath}</span>
                    {hasChanges && <span className="text-yellow-500 text-xs ml-2">(Modified)</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        className="btn btn-primary flex items-center gap-2 text-sm py-1 px-3" 
                        onClick={handleSave} 
                        disabled={saving || !hasChanges}
                    >
                        <Save size={14} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                        className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)]">
                        Loading content...
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500">
                        {error}
                    </div>
                ) : (
                    <textarea
                        className="w-full h-full p-4 resize-none bg-transparent outline-none font-mono text-sm leading-relaxed"
                        style={{ color: 'var(--text-primary)' }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck="false"
                    />
                )}
            </div>
        </div>
    );
};

export default FileEditor;
