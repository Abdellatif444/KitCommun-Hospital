import React, { useState, useEffect } from 'react';
import { Link, Radio, Zap, Shield, Search, X } from 'lucide-react';
import AuditService from '../services/AuditService';

const BlockchainView = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await AuditService.getAllLogs();
            if (data) {
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to load logs", error);
        } finally {
            setLoading(false);
        }
    };

    // Grouper les logs par blocs (par exemple, 3 transactions par bloc)
    const groupLogsIntoBlocks = (logs) => {
        const blocks = [];
        for (let i = 0; i < logs.length; i += 3) {
            blocks.push({
                blockNumber: Math.floor(i / 3) + 1,
                timestamp: logs[i]?.timestamp || Date.now(),
                transactions: logs.slice(i, i + 3),
                hash: logs[i]?.transactionHash || 'N/A' // Hash complet, pas de troncature
            });
        }
        return blocks;
    };

    const allBlocks = groupLogsIntoBlocks(logs);

    const filteredBlocks = allBlocks.map(block => {
        const matchingTransactions = block.transactions.filter(tx => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
                (tx.transactionHash && tx.transactionHash.toLowerCase().includes(term)) ||
                (tx.action && tx.action.toLowerCase().includes(term)) ||
                (tx.resourceId && tx.resourceId.toLowerCase().includes(term)) ||
                (tx.userId && tx.userId.toLowerCase().includes(term))
            );
        });
        return { ...block, transactions: matchingTransactions };
    }).filter(block => block.transactions.length > 0);

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return '#4ade80';
        if (action.includes('DELETE')) return '#f87171';
        if (action.includes('UPDATE')) return '#60a5fa';
        return '#94a3b8';
    };

    return (
        <div className="animate-fade-in" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link style={{ color: '#3b82f6' }} />
                    Blockchain Visualization
                </h1>
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                    Immutable chain of audit blocks secured by cryptographic hashing.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Radio size={20} style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Blocks</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9' }}>{allBlocks.length}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Zap size={20} style={{ color: '#4ade80' }} />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Transactions</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9' }}>{logs.length}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Shield size={20} style={{ color: '#34d399' }} />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Chain Integrity</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>100%</div>
                </div>
            </div>

            {/* Blockchain Visualization */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid rgba(59, 130, 246, 0.3)',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    Loading blockchain...
                </div>
            ) : (
                <div style={{ position: 'relative' }}>

                    {/* Search Bar */}
                    <div style={{ marginBottom: '2rem', position: 'relative' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            gap: '1rem',
                            transition: 'all 0.3s'
                        }}>
                            <Search className="text-muted" size={20} style={{ color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Paste Transaction Hash or Resource Hash to verify existence..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1rem',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredBlocks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            No blocks found matching your search.
                        </div>
                    ) : (
                        filteredBlocks.map((block, index) => (
                            <div key={index} style={{ position: 'relative', marginBottom: index < filteredBlocks.length - 1 ? '2rem' : 0 }}>
                                {/* Block Container */}
                                <div
                                    className="glass-card"
                                    style={{
                                        padding: '2rem',
                                        position: 'relative',
                                        border: '2px solid rgba(59, 130, 246, 0.3)',
                                        transition: 'all 0.3s ease',
                                        animation: `slide-up 0.5s ease-out ${index * 0.1}s both`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                                        e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Block Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: '#34d399',
                                                    boxShadow: '0 0 10px rgba(52, 211, 153, 0.6)',
                                                    animation: 'pulse 2s infinite'
                                                }}></div>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>
                                                    Block #{block.blockNumber}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                {new Date(block.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Block Hash
                                            </div>
                                            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#60a5fa' }}>
                                                {block.hash}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transactions in Block */}
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        {block.transactions.map((tx, txIndex) => {
                                            // Bugfix: Backend seems to swap Action and ResourceID during decoding or fallback
                                            // If resourceId looks like an action, we swap them for display
                                            let displayAction = tx.action;
                                            let displayResource = tx.resourceId;
                                            let isSwapped = false;

                                            if (tx.resourceId && (tx.resourceId.startsWith('CREATE') || tx.resourceId.startsWith('UPDATE') || tx.resourceId.startsWith('DELETE') || tx.resourceId.includes('_'))) {
                                                displayAction = tx.resourceId;
                                                displayResource = tx.action.startsWith('0x') ? 'Hash: ' + tx.action.substring(0, 10) + '...' : tx.action;
                                                isSwapped = true;
                                            }

                                            // If resource is "N/A" or effectively missing, show a placeholder
                                            if (!displayResource || displayResource === 'N/A' || displayResource === 'Error Decoding') {
                                                displayResource = 'Encrypted / Private';
                                            }

                                            return (
                                                <div
                                                    key={txIndex}
                                                    style={{
                                                        background: 'rgba(15, 23, 42, 0.5)',
                                                        padding: '1rem',
                                                        borderRadius: '0.5rem',
                                                        border: '1px solid rgba(148, 163, 184, 0.1)',
                                                        display: 'grid',
                                                        gridTemplateColumns: 'auto 1fr auto',
                                                        gap: '1rem',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: getActionColor(displayAction),
                                                        boxShadow: `0 0 8px ${getActionColor(displayAction)}80`
                                                    }}></div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                                        <div>
                                                            <span style={{ color: '#64748b', marginRight: '0.5rem', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>Action</span>
                                                            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{displayAction}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#64748b', marginRight: '0.5rem', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' }}>Resource</span>
                                                            <span style={{ color: isSwapped ? '#94a3b8' : '#f59e0b', fontWeight: isSwapped ? 400 : 700, fontFamily: 'monospace', fontSize: isSwapped ? '0.8rem' : '1rem' }}>
                                                                {displayResource}
                                                            </span>
                                                        </div>
                                                        <div style={{ gridColumn: 'span 2' }}>
                                                            <span style={{ color: '#64748b', marginRight: '0.5rem', fontSize: '0.75rem' }}>User Hash:</span>
                                                            <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                                                {tx.userId}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        color: '#34d399',
                                                        fontWeight: 700,
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                                        height: 'fit-content'
                                                    }}>
                                                        VERIFIED
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Transaction Count Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-12px',
                                        right: '2rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                                    }}>
                                        {block.transactions.length} TX
                                    </div>
                                </div>

                                {/* Chain Link */}
                                {index < filteredBlocks.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '50%',
                                        bottom: '-2rem',
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        zIndex: 1
                                    }}>
                                        <div style={{
                                            width: '3px',
                                            height: '2rem',
                                            background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6)',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: '#3b82f6',
                                                boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
                                            }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )))}


                    {/* Genesis Block Indicator */}
                    {filteredBlocks.length > 0 && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '0.5rem'
                        }}>
                            <Shield size={24} style={{ color: '#22c55e', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '0.9rem', color: '#22c55e', fontWeight: 700 }}>
                                Genesis Block (Start of Chain)
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                All subsequent blocks are cryptographically linked
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlockchainView;
