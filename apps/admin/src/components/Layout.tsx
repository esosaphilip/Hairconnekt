import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { LayoutDashboard, List, Users, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Categories', path: '/categories', icon: List },
        { label: 'Users', path: '/users', icon: Users },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <h1 style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#111827' }}>Hairconnekt Admin</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Hello, {user?.firstName}</p>
                </div>

                <nav style={{ flex: 1, padding: '16px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} style={{ marginBottom: '4px' }}>
                                    <Link
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: isActive ? '#fff' : '#4b5563',
                                            backgroundColor: isActive ? '#111827' : 'transparent',
                                            fontWeight: 500
                                        }}
                                    >
                                        <Icon size={20} style={{ marginRight: '12px' }} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        <LogOut size={20} style={{ marginRight: '12px' }} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};
