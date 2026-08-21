import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, FileText } from 'lucide-react';
import api from '../api';
import { ENDPOINTS } from '../endpoints';
import Editor from '@monaco-editor/react';
import { useIDEStore } from '../store/useIDEStore';
import toast from 'react-hot-toast';

const FileEditor = ({ repositoryId, filePath }) => {
    const { openFiles, setFileContent, setFileSaved, activeFile } = useIDEStore();
    const fileState = openFiles.find(f => f.path === filePath);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const editorRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        const fetchContent = async () => {
            if (!filePath) return;
            try {
                setLoading(true);
                const res = await api.get(ENDPOINTS.files.content, {
                    params: { repository_id: repositoryId, path: filePath }
                });
                
                // Set the fetched content to the store and mark as saved
                setFileContent(filePath, res.data.content, false);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Failed to load file content.");
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if it hasn't been loaded yet (or if we need a refresh mechanism later)
        // Since we don't have a reliable `isLoaded` flag, we can just fetch if it's newly opened.
        // Wait, if they type and switch tabs, we don't want to refetch and overwrite.
        // Let's add a simple check: if the store has it but it's newly created, we might still want to fetch.
        // Actually, `openFile` sets it to `''`. If we track `loadedPaths` in a ref or state...
        // Let's just use a ref to track which paths we have fetched.
        fetchContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repositoryId, filePath]); 
    // Wait, the above will run every time filePath changes, which is correct when switching tabs.
    // BUT we don't want to fetch if we already have it in `openFiles` with modifications.
    
    // Let's fix the logic:
    const fetchedPaths = useRef(new Set());
    
    useEffect(() => {
        if (!filePath) return;
        if (fetchedPaths.current.has(filePath)) {
            setLoading(false);
            return;
        }

        const fetchContent = async () => {
            try {
                setLoading(true);
                const res = await api.get(ENDPOINTS.files.content, {
                    params: { repository_id: repositoryId, path: filePath }
                });
                setFileContent(filePath, res.data.content, false);
                fetchedPaths.current.add(filePath);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Failed to load file content.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [repositoryId, filePath, setFileContent]);

    const handleSave = useCallback(async () => {
        if (!fileState?.isDirty) return;
        try {
            setSaving(true);
            await api.put(ENDPOINTS.files.save, {
                repository_id: repositoryId,
                path: filePath,
                content: fileState.content
            });
            setFileSaved(filePath);
            toast.success("Saved");
        } catch (err) {
            console.error(err);
            toast.error(`Error saving: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaving(false);
        }
    }, [fileState, repositoryId, filePath, setFileSaved]);

    // Handle Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    const handleEditorChange = (value) => {
        setFileContent(filePath, value, true);
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        // Optionally add custom keybindings to monaco instance directly here if needed
    };

    if (!filePath || !fileState) {
        return null; // Handled by RepositoryDetails empty state
    }

    const language = getLanguageFromPath(filePath);

    return (
        <div className="h-full flex flex-col relative bg-[var(--bg-primary)]">
            {/* Breadcrumb / Toolbar */}
            <div className="flex items-center justify-between p-2 px-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <FileText size={14} />
                    <span className="font-mono text-xs">{filePath.replace(/\//g, ' > ')}</span>
                </div>
                <div className="flex items-center">
                    <button 
                        className={`text-xs px-3 py-1 rounded transition-colors flex items-center gap-2 ${fileState.isDirty ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
                        onClick={handleSave} 
                        disabled={saving || !fileState.isDirty}
                    >
                        <Save size={12} />
                        {saving ? 'Saving...' : (fileState.isDirty ? 'Save (Ctrl+S)' : 'Saved')}
                    </button>
                </div>
            </div>

            <div className="flex-1 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)] text-sm animate-pulse">
                        Loading {filePath}...
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500">
                        {error}
                    </div>
                ) : (
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={fileState.content}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                            wordWrap: 'on',
                            padding: { top: 16 },
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            formatOnPaste: true,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

// Helper for Monaco syntax highlighting
function getLanguageFromPath(path) {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx': return 'javascript';
        case 'ts':
        case 'tsx': return 'typescript';
        case 'py': return 'python';
        case 'html': return 'html';
        case 'css': return 'css';
        case 'json': return 'json';
        case 'md': return 'markdown';
        case 'sh': return 'shell';
        case 'sql': return 'sql';
        case 'xml': return 'xml';
        case 'yaml':
        case 'yml': return 'yaml';
        case 'c': return 'c';
        case 'cpp': return 'cpp';
        case 'cs': return 'csharp';
        case 'go': return 'go';
        case 'java': return 'java';
        case 'php': return 'php';
        case 'rb': return 'ruby';
        case 'rs': return 'rust';
        default: return 'plaintext';
    }
}

export default FileEditor;
