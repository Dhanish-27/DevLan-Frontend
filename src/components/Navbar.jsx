import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Terminal } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav style={styles.navbar}>
            <div className="container flex items-center justify-between" style={{ height: '100%' }}>
                <Link to="/" style={styles.brand}>
                    <Terminal size={24} color="var(--accent)" />
                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Devlan</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/" style={styles.navLink}>
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                            <div style={styles.userInfo}>
                                <span>{user.username}</span>
                            </div>
                            <button onClick={logout} style={styles.logoutBtn}>
                                <LogOut size={18} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-primary)',
        textDecoration: 'none',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-secondary)',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'color 0.2s',
    },
    userInfo: {
        padding: '0.25rem 0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: 500,
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontWeight: 500,
        fontFamily: 'inherit',
        fontSize: '1rem',
    }
};

export default Navbar;
