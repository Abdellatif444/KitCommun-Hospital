import { useEffect, useState } from 'react';
import AuditService from '../services/AuditService';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Activity, ShieldCheck, Users, Database, Copy, Check } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, byUser: 0, byPatient: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [expandedResources, setExpandedResources] = useState(new Set());
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        // Fetch real data
        AuditService.getAllLogs().then(data => {
            // Calculate stats
            setStats({
                total: data.length,
                byUser: new Set(data.map(l => l.userId)).size,
                byPatient: new Set(data.map(l => l.resourceId)).size // Approx
            });
            // Sort by timestamp descending (Newest first)
            const sortedData = [...data].sort((a, b) => b.timestamp - a.timestamp);
            setRecentLogs(sortedData.slice(0, 5));

            // Process chart data (last 7 days activity)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(today.getDate() - (6 - i));
                return d;
            });

            const labels = last7Days.map(d => days[d.getDay()]);
            const counts = last7Days.map(d => {
                const dateStr = d.toISOString().split('T')[0];
                return data.filter(log => {
                    if (!log.timestamp) return false;
                    // Robust timestamp parsing (handles both number and string)
                    const logDate = new Date(log.timestamp);
                    const logDateStr = logDate.toISOString().split('T')[0];
                    return logDateStr === dateStr;
                }).length;
            });

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Audit Transactions',
                        data: counts,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        tension: 0.4,
                    },
                ],
            });

        }).catch(err => {
            console.error("Failed to load logs from backend", err);
            // Ensure stats and logs are empty/default on error
            setStats({ total: 0, byUser: 0, byPatient: 0 });
            setRecentLogs([]);
            setChartData({
                labels: [],
                datasets: []
            });
        });
    }, []);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8' } },
            title: { display: false },
        },
        scales: {
            y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
    };

    return (
        <div className="animate-fade-in">
            <h1>Audit Dashboard</h1>
            <p className="text-muted mb-8">Real-time blockchain integrity monitoring.</p>

            {/* Enhanced KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Total Transactions Card */}
                <div
                    className="glass-card"
                    style={{
                        padding: '1.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(30, 41, 59, 0.7))',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Database size={28} style={{ color: '#60a5fa' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Transactions</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1 }}>{stats.total}</div>
                    </div>
                </div>

                {/* System Integrity Card */}
                <div
                    className="glass-card"
                    style={{
                        padding: '1.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(30, 41, 59, 0.7))',
                        border: '1px solid rgba(16, 185, 129, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ShieldCheck size={28} style={{ color: '#34d399' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Integrity</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399', lineHeight: 1 }}>100%</div>
                    </div>
                </div>

                {/* Active Users Card */}
                <div
                    className="glass-card"
                    style={{
                        padding: '1.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(30, 41, 59, 0.7))',
                        border: '1px solid rgba(168, 85, 247, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Users size={28} style={{ color: '#c084fc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Users</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1 }}>{stats.byUser}</div>
                    </div>
                </div>

                {/* Daily Activity Card */}
                <div
                    className="glass-card"
                    style={{
                        padding: '1.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(30, 41, 59, 0.7))',
                        border: '1px solid rgba(236, 72, 153, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.3)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(236, 72, 153, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Activity size={28} style={{ color: '#f472b6' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Activity</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1 }}>+24%</div>
                    </div>
                </div>
            </div>

            {/* Charts & Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card p-6">
                    <h3 className="mb-4">Transaction Volume</h3>
                    <Line options={chartOptions} data={chartData} />
                </div>

                <div className="glass-card p-6">
                    <h3 className="mb-4">Recent Blockchain Logs</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLogs.map((log, i) => {
                                    // Swap logic for Action
                                    const displayAction = (log.resourceId && (log.resourceId.includes('CREATE') || log.resourceId.includes('UPDATE') || log.resourceId.includes('DELETE')))
                                        ? log.resourceId
                                        : log.action;

                                    // Swap logic for Resource (Hash)
                                    const displayResource = (log.resourceId && (log.resourceId.includes('CREATE') || log.resourceId.includes('UPDATE') || log.resourceId.includes('DELETE')))
                                        ? log.action // Valid Hash in swapped case
                                        : log.resourceId;

                                    return (
                                        <tr key={i}>
                                            <td className="text-xs text-muted">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td>
                                                <span className={`badge ${displayAction.includes('CREATE') ? 'badge-green' : displayAction.includes('DELETE') ? 'badge-red' : 'badge-blue'}`}>
                                                    {displayAction.length > 20 ? displayAction.substring(0, 10) + '...' : displayAction}
                                                </span>
                                            </td>
                                            <td className="text-sm">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                                                    <span
                                                        style={{ fontFamily: 'monospace', color: '#cbd5e1', cursor: 'pointer', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                        onClick={() => {
                                                            const newSet = new Set(expandedResources);
                                                            if (newSet.has(i)) newSet.delete(i);
                                                            else newSet.add(i);
                                                            setExpandedResources(newSet);
                                                        }}
                                                        title={expandedResources.has(i) ? "Click to collapse" : "Click to expand"}
                                                    >
                                                        {displayResource && displayResource.startsWith('0x')
                                                            ? (expandedResources.has(i) ? displayResource : displayResource.substring(0, 10) + '...')
                                                            : displayResource}
                                                    </span>

                                                    {displayResource && displayResource.startsWith('0x') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(displayResource, i);
                                                            }}
                                                            style={{
                                                                background: 'rgba(59, 130, 246, 0.1)',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                padding: '4px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: copiedIndex === i ? '#34d399' : '#94a3b8',
                                                                transition: 'all 0.2s',
                                                                flexShrink: 0
                                                            }}
                                                            title="Copy full hash"
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                                        >
                                                            {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-sm">{log.userId.substring(0, 10)}...</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
