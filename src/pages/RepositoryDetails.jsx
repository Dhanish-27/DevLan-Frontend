import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS } from '../endpoints';
import { 
    FolderGit2, ArrowLeft, GitBranch, Clock, AlertCircle, FileText, Activity 
} from 'lucide-react';

const RepositoryDetails = () => {
    const { id } = useParams();
    const [repo, setRepo] = useState(null);
    const [status, setStatus] = useState(null);
    const [branches, setBranches] = useState([]);
    const [commits, setCommits] = useState([]);
    const [currentBranch, setCurrentBranch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRepositoryData();
    }, [id]);

    const fetchRepositoryData = async () => {
        setLoading(true);
        try {
            // Fetch basic info
            const repoRes = await api.get(ENDPOINTS.repositories.detail(id));
            setRepo(repoRes.data);

            // Fetch additional git data concurrently
            const [statusRes, branchesRes, commitsRes, branchRes] = await Promise.all([
                api.get(ENDPOINTS.repositories.status(id)).catch(() => ({ data: null })),
                api.get(ENDPOINTS.repositories.branches(id)).catch(() => ({ data: [] })),
                api.get(ENDPOINTS.repositories.commits(id)).catch(() => ({ data: [] })),
                api.get(ENDPOINTS.repositories.currentBranch(id)).catch(() => ({ data: { branch: '' } }))
            ]);

            setStatus(statusRes.data);
            setBranches(branchesRes.data);
            setCommits(commitsRes.data);
            setCurrentBranch(branchRes.data.branch);
        } catch (error) {
            console.error("Failed to fetch repository details:", error);
            setError("Failed to load repository data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="container mt-8 text-center"><p style={{ color: 'var(--text-secondary)' }}>Loading repository details...</p></div>;
    }

    if (error || !repo) {
        return (
            <div className="container mt-8 text-center">
                <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                <h3>{error || "Repository not found"}</h3>
                <Link to="/" className="btn btn-secondary mt-4">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="container mt-8 pb-12">
            <Link to="/" className="btn btn-secondary mb-6" style={{ border: 'none', padding: '0.5rem 0' }}>
                <ArrowLeft size={18} />
                Back to Dashboard
            </Link>

            {/* Header Section */}
            <div className="glass-panel mb-8">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                            <FolderGit2 size={32} color="var(--accent)" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{repo.name}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem', maxWidth: '600px' }}>
                                {repo.description || 'No description provided.'}
                            </p>
                            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <span className="flex items-center gap-1"><FileText size={16} /> {repo.local_path}</span>
                                <span className="flex items-center gap-1" style={{ color: 'var(--success)' }}><GitBranch size={16} /> {currentBranch || repo.default_branch}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Left Column: Status & Branches */}
                <div className="col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Status Panel */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <Activity size={20} color="var(--accent)" />
                            <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Working Tree Status</h3>
                        </div>
                        
                        {status ? (
                            <div style={{ fontSize: '0.875rem' }}>
                                {status.is_clean ? (
                                    <div className="flex items-center gap-2 p-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px' }}>
                                        <AlertCircle size={16} />
                                        <span>Working tree clean</span>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Changed files:</p>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {status.changed_files && status.changed_files.map((file, idx) => (
                                                <li key={idx} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                                                    {file}
                                                </li>
                                            ))}
                                            {(!status.changed_files || status.changed_files.length === 0) && (
                                                <li style={{ color: 'var(--text-secondary)' }}>Changes present but no files listed.</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status information unavailable.</p>
                        )}
                    </div>

                    {/* Branches Panel */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <GitBranch size={20} color="var(--accent)" />
                            <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Branches</h3>
                        </div>
                        
                        {branches && branches.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {branches.map((branch, idx) => (
                                    <li key={idx} style={{ 
                                        padding: '0.75rem', 
                                        backgroundColor: branch === currentBranch ? 'var(--accent-glow)' : 'var(--bg-secondary)', 
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>{branch}</span>
                                        {branch === currentBranch && <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, padding: '0.2rem 0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px' }}>Current</span>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No branches found.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Commits */}
                <div className="col-span-2">
                    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
                        <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <Clock size={20} color="var(--accent)" />
                            <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Recent Commits</h3>
                        </div>

                        {commits && commits.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {commits.map((commit, idx) => (
                                    <div key={idx} style={{ 
                                        padding: '1rem', 
                                        backgroundColor: 'var(--bg-secondary)', 
                                        borderRadius: '8px',
                                        borderLeft: '3px solid var(--accent)'
                                    }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <strong style={{ color: 'var(--text-primary)' }}>{commit.message}</strong>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                {commit.hash ? commit.hash.substring(0, 7) : 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            <span>{commit.author}</span>
                                            {commit.date && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(commit.date).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock size={32} color="var(--border-color)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>No commits found in this repository.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepositoryDetails;
