import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS } from '../endpoints';
import { useAuth } from '../contexts/AuthContext';
import { Plus, FolderGit2, Star, Clock, Search, Grid, List, Activity, Settings, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import CloneRepositoryModal from '../components/CloneRepositoryModal';
import { useIDEStore } from '../store/useIDEStore';

const Dashboard = () => {
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [cloneModalOpen, setCloneModalOpen] = useState(false);
    const [selectedRepoToClone, setSelectedRepoToClone] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchRepositories();
    }, [user, navigate]);

    const fetchRepositories = async () => {
        try {
            const response = await api.get(ENDPOINTS.repositories.list);
            setRepositories(response.data);
        } catch (error) {
            console.error("Failed to fetch repositories:", error);
            toast.error("Failed to load repositories");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id, name) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        
        try {
            await api.delete(ENDPOINTS.repositories.detail(id));
            toast.success("Repository deleted");
            useIDEStore.getState().closeAllFiles();
            fetchRepositories();
        } catch (err) {
            toast.error("Failed to delete repository");
        }
    };

    const filteredRepos = repositories.filter(repo => 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="container mt-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded"></div>
                    <div className="grid grid-cols-3 gap-6">
                        {[1,2,3].map(i => <div key={i} className="h-40 bg-[var(--bg-secondary)] rounded-xl"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-8 pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Your Repositories</h1>
                    <p className="text-[var(--text-secondary)]">Manage and track your Devlan projects</p>
                </div>
                <Link to="/repositories/new" className="btn btn-primary">
                    <Plus size={18} />
                    New Repository
                </Link>
            </div>

            {repositories.length > 0 && (
                <div className="flex items-center justify-between mb-6 bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-center gap-2 px-3 w-1/3">
                        <Search size={18} className="text-[var(--text-secondary)]" />
                        <input 
                            type="text" 
                            placeholder="Find a repository..." 
                            className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)]"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 pr-2 border-l border-[var(--border-color)] pl-4">
                        <button 
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[var(--bg-hover)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[var(--bg-hover)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            )}

            {repositories.length === 0 ? (
                <div className="glass-panel text-center py-16 flex flex-col items-center">
                    <div className="w-20 h-20 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-color)] shadow-xl">
                        <FolderGit2 size={40} className="text-[var(--text-secondary)]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No repositories yet</h3>
                    <p className="text-[var(--text-secondary)] mb-6 max-w-md">Create your first repository to start managing your code offline with AI assistance.</p>
                    <Link to="/repositories/new" className="btn btn-primary">
                        <Plus size={18} />
                        Create Repository
                    </Link>
                </div>
            ) : filteredRepos.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-secondary)]">
                    No repositories matching "{searchQuery}"
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                    {filteredRepos.map(repo => (
                        <Link to={`/repositories/${repo.id}`} key={repo.id} className="group block">
                            <div className={`glass-panel hover:-translate-y-1 transition-all duration-200 hover:shadow-2xl hover:border-[var(--accent-glow)] relative h-full flex ${viewMode === 'list' ? 'flex-row items-center py-4 px-6' : 'flex-col'}`}>
                                
                                <div className={`flex justify-between items-start ${viewMode === 'list' ? 'w-1/3 pr-4 mb-0' : 'mb-4'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] group-hover:border-[var(--accent)] transition-colors">
                                            <FolderGit2 size={24} className="text-[var(--accent)]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold m-0 flex items-center gap-2">
                                                {repo.name}
                                                {repo.is_favorite && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                                            </h3>
                                            {viewMode === 'list' && (
                                                <p className="text-xs text-[var(--text-secondary)] truncate">{repo.local_path}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${viewMode === 'list' ? 'ml-auto' : ''}`}>
                                        <button 
                                            className="p-2 hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" 
                                            title="Clone Repository"
                                            onClick={e => {
                                                e.preventDefault(); 
                                                e.stopPropagation();
                                                setSelectedRepoToClone(repo);
                                                setCloneModalOpen(true);
                                            }}
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" onClick={e => {e.preventDefault(); e.stopPropagation();}}>
                                            <Settings size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-red-500/10 rounded text-[var(--text-secondary)] hover:text-red-500 transition-colors" onClick={e => handleDelete(e, repo.id, repo.name)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className={`${viewMode === 'list' ? 'flex-1 flex items-center justify-between pl-6 border-l border-[var(--border-color)]' : 'flex-1 flex flex-col'}`}>
                                    <p className={`text-sm text-[var(--text-secondary)] ${viewMode === 'list' ? 'truncate max-w-md' : 'mb-6 line-clamp-2'}`}>
                                        {repo.description || <span className="italic opacity-50">No description provided</span>}
                                    </p>
                                    
                                    <div className={`flex items-center gap-4 text-xs text-[var(--text-secondary)] mt-auto ${viewMode === 'list' ? 'mt-0 ml-4' : ''}`}>
                                        <div className="flex items-center gap-1">
                                            <Activity size={14} className="text-[var(--accent)]" />
                                            <span>{repo.default_branch || 'main'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            {/* Clone Modal */}
            <CloneRepositoryModal 
                isOpen={cloneModalOpen}
                onClose={() => {
                    setCloneModalOpen(false);
                    setTimeout(() => setSelectedRepoToClone(null), 300);
                }}
                repository={selectedRepoToClone}
            />
        </div>
    );
};

export default Dashboard;
