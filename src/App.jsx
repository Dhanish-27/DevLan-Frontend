import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateRepository from './pages/CreateRepository';
import RepositoryDetails from './pages/RepositoryDetails';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return null; // Or a loading spinner

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Redirect if already logged in Wrapper
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return null;

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="page-wrapper">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/login" element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            } />
                            <Route path="/register" element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            } />
                            
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/repositories/new" element={
                                <ProtectedRoute>
                                    <CreateRepository />
                                </ProtectedRoute>
                            } />
                            <Route path="/repositories/:id" element={
                                <ProtectedRoute>
                                    <RepositoryDetails />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
