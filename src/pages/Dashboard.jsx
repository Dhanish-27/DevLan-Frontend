import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS } from '../endpoints';
import { useAuth } from '../contexts/AuthContext';
import { Plus, FolderGit2, Star, Clock } from 'lucide-react';

const Dashboard = () => {
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
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
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-8 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>Loading repositories...</p>
            </div>
        );
    }

    return (
        <div className="container mt-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="mb-2">Your Repositories</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and track your Devlan projects</p>
                </div>
                <Link to="/repositories/new" className="btn btn-primary">
                    <Plus size={18} />
                    New Repository
                </Link>
            </div>

            {repositories.length === 0 ? (
                <div className="glass-panel text-center py-12">
                    <FolderGit2 size={48} color="var(--border-color)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                    <h3 className="mb-2">No repositories yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create your first repository to get started</p>
                    <Link to="/repositories/new" className="btn btn-primary">Create Repository</Link>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {repositories.map(repo => (
                        <Link to={`/repositories/${repo.id}`} key={repo.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <FolderGit2 size={20} color="var(--accent)" />
                                        <h3 style={{ fontSize: '1.125rem', margin: 0 }}>{repo.name}</h3>
                                    </div>
                                    {repo.is_favorite && <Star size={18} color="#fbbf24" fill="#fbbf24" />}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {repo.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center gap-2 mt-auto pt-4" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                    <Clock size={14} />
                                    <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
