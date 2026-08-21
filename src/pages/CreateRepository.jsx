import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS } from '../endpoints';
import { FolderGit2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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
            toast.success("Repository created successfully!");
            navigate(`/repositories/${response.data.id}`);
        } catch (error) {
            console.error("Failed to create repository:", error);
            const errorData = error.response?.data;
            let errorMsg = 'Failed to create repository';
            
            if (typeof errorData === 'object') {
                errorMsg = Object.entries(errorData)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`)
                    .join(' | ');
            }
            
            setError(errorMsg);
            toast.error("Failed to create repository");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-8" style={{ maxWidth: '600px' }}>
            <Link to="/" className="btn btn-secondary mb-6 hover:bg-transparent hover:text-[var(--accent)] transition-colors" style={{ border: 'none', padding: '0.5rem 0' }}>
                <ArrowLeft size={18} />
                Back to Dashboard
            </Link>

            <div className="glass-panel">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border-color)]">
                    <div className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                        <FolderGit2 size={28} className="text-[var(--accent)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-1">Create a New Repository</h2>
                        <p className="text-[var(--text-secondary)] text-sm">Initialize a new Git repository and track it in Devlan.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-5">
                        <label className="form-label text-[var(--text-secondary)] text-sm font-medium mb-2 block">Repository Name</label>
                        <input 
                            type="text" 
                            name="name"
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-2.5 px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. my-awesome-project"
                            required 
                        />
                    </div>
                    
                    <div className="form-group mb-5">
                        <label className="form-label text-[var(--text-secondary)] text-sm font-medium mb-2 block">Description (Optional)</label>
                        <textarea 
                            name="description"
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-2.5 px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Short description of your project"
                            rows="3"
                        />
                    </div>

                    <div className="form-group mb-8">
                        <label className="form-label text-[var(--text-secondary)] text-sm font-medium mb-2 block">Default Branch</label>
                        <input 
                            type="text" 
                            name="default_branch"
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-2.5 px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                            value={formData.default_branch}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    {error && <div className="text-red-400 bg-red-500/10 border border-red-500/20 text-sm mb-6 p-3 rounded-lg">{error}</div>}

                    <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
                        <Link to="/" className="btn btn-secondary px-6">Cancel</Link>
                        <button type="submit" className="btn btn-primary px-6" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Repository'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRepository;
