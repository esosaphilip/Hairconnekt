import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';
import { Search, CheckCircle, XCircle } from 'lucide-react';
// import classNames from 'classnames';

export const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = () => {
        setLoading(true);
        api.get<any>('/admin/users', {
            params: {
                role: roleFilter || undefined,
                search: search || undefined,
                page: page,
                limit: 10
            }
        })
            .then(res => {
                setUsers(res.data.data);
                // Update pagination meta if available
                if (res.data.meta) {
                    setTotalPages(res.data.meta.totalPages);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, page]); // Re-fetch when page or filter changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on new search
        fetchUsers();
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(p => p + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const toggleVerify = async (userId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/admin/users/${userId}/verify-provider`, { isVerified: !currentStatus });
            // Optimistic update
            setUsers(prev => prev.map(u => {
                if (u.id === userId && u.providerProfile) {
                    return { ...u, providerProfile: { ...u.providerProfile, isVerified: !currentStatus } };
                }
                return u;
            }));
        } catch (err) {
            console.error('Failed to update verification', err);
            alert('Action failed');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>User Management</h1>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', flex: 1, backgroundColor: '#f9fafb', borderRadius: '8px', padding: '8px 12px', border: '1px solid #e5e7eb' }}>
                    <Search size={20} color="#9ca3af" />
                    <input
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', marginLeft: '12px', outline: 'none', flex: 1, fontSize: '0.925rem' }}
                    />
                </form>
                <select
                    value={roleFilter}
                    onChange={e => {
                        setRoleFilter(e.target.value);
                        setPage(1); // Reset to page 1 on filter change
                    }}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: '#fff' }}
                >
                    <option value="">All Roles</option>
                    <option value="CLIENT">Clients</option>
                    <option value="PROVIDER">Providers</option>
                </select>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provider Verification</th>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : users.map(user => (
                            <tr key={user.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', marginRight: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            {user.profilePictureUrl ? (
                                                <img src={user.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#6b7280' }}>{user.firstName[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#111827' }}>{user.firstName} {user.lastName}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                                        backgroundColor: user.userType === 'PROVIDER' ? '#f3e8ff' : '#eff6ff',
                                        color: user.userType === 'PROVIDER' ? '#7e22ce' : '#1d4ed8'
                                    }}>
                                        {user.userType}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ color: '#03543f', fontWeight: 500, fontSize: '0.875rem' }}>Active</span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    {user.userType === 'PROVIDER' && user.providerProfile ? (
                                        <button
                                            onClick={() => toggleVerify(user.id, user.providerProfile!.isVerified)}
                                            style={{
                                                display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: '6px',
                                                border: '1px solid', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                                                backgroundColor: user.providerProfile.isVerified ? '#ecfdf5' : '#fff',
                                                borderColor: user.providerProfile.isVerified ? '#a7f3d0' : '#d1d5db',
                                                color: user.providerProfile.isVerified ? '#047857' : '#374151'
                                            }}
                                        >
                                            {user.providerProfile.isVerified ? (
                                                <><CheckCircle size={16} style={{ marginRight: '6px' }} /> Verified</>
                                            ) : (
                                                <><XCircle size={16} style={{ marginRight: '6px' }} /> Unverified</>
                                            )}
                                        </button>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>-</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px', color: '#6b7280', fontSize: '0.875rem' }}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Page {page} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            backgroundColor: page === 1 ? '#f3f4f6' : '#fff',
                            color: page === 1 ? '#9ca3af' : '#374151',
                            cursor: page === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={page === totalPages}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            backgroundColor: page === totalPages ? '#f3f4f6' : '#fff',
                            color: page === totalPages ? '#9ca3af' : '#374151',
                            cursor: page === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
