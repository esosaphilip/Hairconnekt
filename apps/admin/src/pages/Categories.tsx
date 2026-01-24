import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Category } from '../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        nameDe: '',
        nameEn: '',
        slug: '',
        description: '',
        isActive: true
    });
    const [error, setError] = useState('');

    const fetchCategories = () => {
        api.get<Category[]>('/admin/categories').then(res => setCategories(res.data));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                nameDe: category.nameDe,
                nameEn: category.nameEn || '',
                slug: category.slug,
                description: category.description || '',
                isActive: category.isActive
            });
        } else {
            setEditingCategory(null);
            setFormData({ nameDe: '', nameEn: '', slug: '', description: '', isActive: true });
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingCategory) {
                await api.patch(`/admin/categories/${editingCategory.id}`, formData);
            } else {
                await api.post('/admin/categories', formData);
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to deactive this category?')) {
            try {
                await api.delete(`/admin/categories/${id}`);
                fetchCategories();
            } catch (err) {
                alert('Failed to delete');
            }
        }
    }

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Service Categories</h1>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        padding: '10px 16px', backgroundColor: '#111827', color: '#fff', borderRadius: '6px',
                        display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer', fontWeight: 500
                    }}
                >
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Add Category
                </button>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name (DE)</th>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slug</th>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '16px', fontWeight: 500, color: '#111827' }}>{cat.nameDe}</td>
                                <td style={{ padding: '16px', color: '#6b7280' }}>
                                    <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em' }}>{cat.slug}</code>
                                </td>
                                <td style={{ padding: '16px', color: '#6b7280', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.description || '-'}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                                        backgroundColor: cat.isActive ? '#def7ec' : '#fde8e8',
                                        color: cat.isActive ? '#03543f' : '#9b1c1c'
                                    }}>
                                        {cat.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleOpenModal(cat)}
                                            style={{ padding: '6px', cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: '4px', background: 'white', color: '#374151' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            style={{ padding: '6px', cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: '4px', background: 'white', color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
                            {editingCategory ? 'Edit Category' : 'New Category'}
                        </h2>

                        {error && <div style={{ color: 'red', marginBottom: '12px', fontSize: '0.875rem' }}>{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Name (DE)</label>
                                <input
                                    value={formData.nameDe}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            nameDe: val,
                                            // Auto-generate slug if adding new and slug is empty or matches previous auto-gen
                                            slug: (!editingCategory && (prev.slug === generateSlug(prev.nameDe) || prev.slug === '')) ? generateSlug(val) : prev.slug
                                        }));
                                    }}
                                    required
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Name (EN) (Optional)</label>
                                <input
                                    value={formData.nameEn}
                                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Slug</label>
                                <input
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontFamily: 'monospace' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    style={{ marginRight: '8px' }}
                                />
                                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Active</label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#111827', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
