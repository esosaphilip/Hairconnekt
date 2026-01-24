import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Stats } from '../types';
import { Users, Calendar, Briefcase } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Stats>('/admin/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '32px' }}>Dashboard Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Total Users"
                    value={stats?.users.total || 0}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Providers"
                    value={stats?.users.providers || 0}
                    icon={Briefcase}
                    color="purple"
                />
                <StatCard
                    title="Active Services"
                    value={stats?.services.active || 0}
                    icon={ListIcon}
                    color="green"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats?.bookings.total || 0}
                    icon={Calendar}
                    color="orange"
                />
            </div>
        </div>
    );
};

const ListIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        {...props}
    >
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => {
    const colors: Record<string, string> = {
        blue: '#eff6ff',
        blueText: '#1d4ed8',
        purple: '#f3e8ff',
        purpleText: '#7e22ce',
        green: '#f0fdf4',
        greenText: '#15803d',
        orange: '#fff7ed',
        orangeText: '#c2410c',
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
            <div style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: colors[color],
                color: colors[`${color}Text`],
                marginRight: '16px'
            }}>
                <Icon size={24} />
            </div>
            <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{value}</p>
            </div>
        </div>
    );
};
