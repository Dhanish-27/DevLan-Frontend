import React, { useState, useEffect, useRef } from 'react';
import { useIDEStore } from '../store/useIDEStore';
import { Search, Terminal, GitBranch, Files, Settings, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { toggleExplorer, toggleTerminal, toggleSearch, toggleGitPanel, toggleAIPanel } = useIDEStore();

    const commands = [
        { id: 'explorer', name: 'View: Explorer', icon: Files, action: toggleExplorer },
        { id: 'search', name: 'View: Search', icon: Search, action: toggleSearch },
        { id: 'terminal', name: 'View: Terminal', icon: Terminal, action: toggleTerminal },
        { id: 'git', name: 'View: Source Control', icon: GitBranch, action: toggleGitPanel },
        { id: 'ai', name: 'View: AI Assistant', icon: MessageSquare, action: toggleAIPanel },
        { id: 'settings', name: 'Preferences: Open Settings', icon: Settings, action: () => navigate('/') },
    ];

    const filteredCommands = commands.filter(cmd => cmd.name.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                setIsOpen(true);
                setQuery('');
                setSelectedIndex(0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const executeCommand = (index) => {
        const cmd = filteredCommands[index];
        if (cmd) {
            cmd.action();
            setIsOpen(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <div 
                className="w-full max-w-xl bg-[var(--bg-secondary)] rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3 border-b border-[var(--border-color)]">
                    <Search size={18} className="text-[var(--text-secondary)] mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setSelectedIndex(i => Math.max(i - 1, 0));
                            } else if (e.key === 'Enter') {
                                e.preventDefault();
                                executeCommand(selectedIndex);
                            } else if (e.key === 'Escape') {
                                setIsOpen(false);
                            }
                        }}
                        placeholder="Type a command..."
                        className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none"
                    />
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                    {filteredCommands.length > 0 ? (
                        <div className="py-2">
                            {filteredCommands.map((cmd, idx) => (
                                <div
                                    key={cmd.id}
                                    className={`px-4 py-2 flex items-center gap-3 text-sm cursor-pointer transition-colors
                                        ${idx === selectedIndex ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
                                    `}
                                    onClick={() => executeCommand(idx)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    <cmd.icon size={16} className={idx === selectedIndex ? 'text-white' : 'text-[var(--text-secondary)]'} />
                                    <span>{cmd.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
                            No commands matching "{query}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
