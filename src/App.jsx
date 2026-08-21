import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateRepository from './pages/CreateRepository';
import RepositoryDetails from './pages/RepositoryDetails';
import { Toaster } from 'react-hot-toast';
import CommandPalette from './components/CommandPalette';
import { useShortcuts } from './hooks/useShortcuts';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

// Redirect if already logged in Wrapper
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/" replace />;
    return children;
};

const AppLayout = ({ children }) => {
    const location = useLocation();
    const isIdeRoute = location.pathname.startsWith('/repositories/') && location.pathname !== '/repositories/new';
    
    useShortcuts();

    if (isIdeRoute) {
        return (
            <>
                {children}
                <CommandPalette />
            </>
        );
    }

    return (
        <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main className="main-content" style={{ flex: 1, padding: '2rem 0' }}>
                {children}
                <CommandPalette />
            </main>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="bottom-right" toastOptions={{ 
                    style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }
                }} />
                <AppLayout>
                    <Routes>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/repositories/new" element={<ProtectedRoute><CreateRepository /></ProtectedRoute>} />
                        <Route path="/repositories/:id" element={<ProtectedRoute><RepositoryDetails /></ProtectedRoute>} />
                    </Routes>
                </AppLayout>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
