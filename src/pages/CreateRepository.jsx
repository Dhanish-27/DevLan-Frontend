import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS } from '../endpoints';
import { FolderGit2, ArrowLeft } from 'lucide-react';

const CreateRepository = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        default_branch: 'main'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post(ENDPOINTS.repositories.create, formData);
            navigate(`/repositories/${response.data.id}`);
        } catch (error) {
            console.error("Failed to create repository:", error);
            const errorData = error.response?.data;
            if (typeof errorData === 'object') {
                setError(Object.entries(errorData)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`)
                    .join(' | '));
            } else {
                setError('Failed to create repository');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-8" style={{ maxWidth: '600px' }}>
            <Link to="/" className="btn btn-secondary mb-6" style={{ border: 'none', padding: '0.5rem 0' }}>
                <ArrowLeft size={18} />
                Back to Dashboard
            </Link>

            <div className="glass-panel">
                <div className="flex items-center gap-3 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <FolderGit2 size={24} color="var(--accent)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create a New Repository</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Initialize a new Git repository and track it in Devlan.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Repository Name</label>
                        <input 
                            type="text" 
                            name="name"
                            className="form-input" 
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. my-awesome-project"
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <textarea 
                            name="description"
                            className="form-input" 
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Short description of your project"
                            rows="3"
                        />
                    </div>

                    <div className="form-group mb-8">
                        <label className="form-label">Default Branch</label>
                        <input 
                            type="text" 
                            name="default_branch"
                            className="form-input" 
                            value={formData.default_branch}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    {error && <div className="error-text mb-6 p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

                    <div className="flex justify-end gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                        <Link to="/" className="btn btn-secondary">Cancel</Link>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Repository'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRepository;
