import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Files, GitBranch, Search, MessageSquare, Terminal, Settings } from 'lucide-react';
import { useIDEStore } from '../store/useIDEStore';
import FileExplorer from '../components/FileExplorer';
import FileEditor from '../components/FileEditor';
import EditorTabs from '../components/EditorTabs';
import GitPanel from '../components/GitPanel';
import AIPanel from '../components/AIPanel';
import TerminalPanel from '../components/TerminalPanel';

const RepositoryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        isExplorerOpen, isGitPanelOpen, isAIPanelOpen, isSearchOpen, isTerminalOpen,
        toggleExplorer, toggleGitPanel, toggleAIPanel, toggleSearch, toggleTerminal,
        activeFile
    } = useIDEStore();

    return (
        <div className="ide-workspace">
            {/* Activity Bar */}
            <div className="ide-activity-bar">
                <button 
                    className={`p-3 mb-2 rounded-lg transition-colors ${isExplorerOpen ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    onClick={toggleExplorer}
                    title="Explorer"
                >
                    <Files size={24} />
                </button>
                <button 
                    className={`p-3 mb-2 rounded-lg transition-colors ${isSearchOpen ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    onClick={toggleSearch}
                    title="Search"
                >
                    <Search size={24} />
                </button>
                <button 
                    className={`p-3 mb-2 rounded-lg transition-colors ${isGitPanelOpen ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    onClick={toggleGitPanel}
                    title="Source Control"
                >
                    <GitBranch size={24} />
                </button>
                <button 
                    className={`p-3 mb-2 rounded-lg transition-colors ${isAIPanelOpen ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    onClick={toggleAIPanel}
                    title="AI Assistant"
                >
                    <MessageSquare size={24} />
                </button>
                
                <div className="mt-auto flex flex-col items-center pb-4">
                    <button 
                        className={`p-3 mb-2 rounded-lg transition-colors ${isTerminalOpen ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        onClick={toggleTerminal}
                        title="Terminal"
                    >
                        <Terminal size={24} />
                    </button>
                    <button 
                        className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg"
                        onClick={() => navigate('/')}
                        title="Back to Dashboard"
                    >
                        <Settings size={24} />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            {(isExplorerOpen || isGitPanelOpen || isSearchOpen || isAIPanelOpen) && (
                <div className="ide-sidebar flex flex-col overflow-hidden">
                    {isExplorerOpen && <FileExplorer repositoryId={id} />}
                    {isGitPanelOpen && <GitPanel repositoryId={id} />}
                    {isSearchOpen && <div className="p-4 text-sm text-[var(--text-secondary)]">Global Search (Coming Soon)</div>}
                    {isAIPanelOpen && <AIPanel />}
                </div>
            )}

            {/* Main Area */}
            <div className="ide-main bg-[var(--bg-primary)]">
                <div className="ide-editor-area">
                    <EditorTabs />
                    <div className="flex-1 overflow-hidden relative">
                        {activeFile ? (
                            <FileEditor repositoryId={id} filePath={activeFile} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                                <div className="text-center">
                                    <div className="mb-4 opacity-20"><Files size={64} className="mx-auto" /></div>
                                    <p>Select a file to start editing</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Terminal Panel */}
                {isTerminalOpen && <TerminalPanel />}
            </div>
        </div>
    );
};

export default RepositoryDetails;
