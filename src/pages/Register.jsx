import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await register(username, password, email);
        if (!result.success) {
            let errorMsg = 'Registration failed';
            if (typeof result.error === 'object') {
                 // Format DRF error dicts
                 errorMsg = Object.entries(result.error)
                     .map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`)
                     .join(' | ');
            } else if (typeof result.error === 'string') {
                errorMsg = result.error;
            }
            setError(errorMsg);
        }
        setIsLoading(false);
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="text-center mb-6">
                    <UserPlus size={40} color="var(--accent)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                    <h2>Create an Account</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Join Devlan today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email (Optional)</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group mb-6">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    {error && <div className="error-text mb-4 text-center">{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="text-center mt-6" style={{ fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                    <Link to="/login" style={{ fontWeight: 500 }}>Sign in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
