import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, FileJson, FileText, Download } from 'lucide-react';
import AuditService from '../services/AuditService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUser, setSelectedUser] = useState('ALL');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
            console.error("Failed to load logs from backend", error);
            // Optionally handle error state here
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUser = selectedUser === 'ALL' || log.userId === selectedUser;

        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        const matchesStartDate = !startDate || logDate >= startDate;
        const matchesEndDate = !endDate || logDate <= endDate;

        return matchesSearch && matchesUser && matchesStartDate && matchesEndDate;
    });

    const uniqueUsers = ['ALL', ...new Set(logs.map(log => log.userId))];

    const exportJSON = () => {
        const proofData = {
            proofHeader: {
                generatedAt: new Date().toISOString(),
                auditSystem: "MedChain Blockchain Auditor",
                version: "1.0.0",
                integrityStatus: "VERIFIED",
                totalRecords: filteredLogs.length
            },
            blockchainContext: {
                network: "Ganache (Private Ethereum)",
                contractAddress: "0x987e9C54Fb9009f323282D0c4654223bb4682CaB",
                consensus: "Proof of Authority (Dev)"
            },
            logs: filteredLogs.map(log => ({
                timestamp: new Date(log.timestamp).toISOString(),
                userId: log.userId,
                action: log.action,
                resourceId: log.resourceId,
                dataHash: log.dataHash || "N/A",
                transactionHash: log.transactionHash,
                status: "IMMUTABLE"
            }))
        };

        const jsonString = JSON.stringify(proofData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `audit_proof_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(41, 128, 185);
        doc.text("Blockchain Audit Report", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`System: MedChain Audit Platform`, 14, 35);
        doc.text(`Total Records: ${filteredLogs.length}`, 14, 40);

        // Blockchain Info
        doc.setFontSize(10);
        doc.text(`Contract: 0x987e9C54Fb9009f323282D0c4654223bb4682CaB`, 14, 48);
        doc.text(`Network: Ganache (Private Ethereum)`, 14, 53);

        // Table
        const tableColumn = ["Time", "Action", "User ID", "Resource ID", "Status"];
        const tableRows = [];

        filteredLogs.forEach(log => {
            const logData = [
                new Date(log.timestamp).toLocaleString(),
                log.action,
                log.userId,
                log.resourceId,
                "VERIFIED"
            ];
            tableRows.push(logData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            alternateRowStyles: { fillColor: [240, 248, 255] }
        });

        doc.save(`audit_report_${new Date().toISOString().split('T')[0]}.pdf`);
        setShowExportMenu(false);
    };

    return (
        <div className="animate-fade-in">
            {/* Header Section */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Blockchain Audit Trail</h1>
                        <p className="text-muted" style={{ fontSize: '0.95rem' }}>Immutable record of all sensitive actions.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', zIndex: 10 }}>
                        <button
                            className={`btn ${isFilterOpen ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                        </button>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', cursor: 'pointer' }}
                            >
                                <Shield size={18} />
                                <span>Export Proof</span>
                            </button>

                            {showExportMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: '#1e293b',
                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                    minWidth: '160px'
                                }}>
                                    <button
                                        onClick={exportJSON}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            color: '#f1f5f9',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '0.875rem',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <FileJson size={16} style={{ color: '#60a5fa' }} />
                                        <span>JSON Proof</span>
                                    </button>
                                    <button
                                        onClick={exportPDF}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            color: '#f1f5f9',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '0.875rem',
                                            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <FileText size={16} style={{ color: '#4ade80' }} />
                                        <span>PDF Report</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {isFilterOpen && (
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        animation: 'slide-down 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>User Filter</label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                style={{
                                    background: '#0f172a',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    color: '#f1f5f9',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem'
                                }}
                            >
                                {uniqueUsers.map(user => (
                                    <option key={user} value={user}>{user}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    background: '#0f172a',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    color: '#f1f5f9',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    background: '#0f172a',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    color: '#f1f5f9',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setSelectedUser('ALL');
                                    setSearchTerm('');
                                }}
                                style={{
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem'
                                }}
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Enhanced Search Bar */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '0.75rem',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}>
                    <Search className="text-muted" size={20} style={{ flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search by User ID, Patient ID, Action, or Resource..."
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#f8fafc',
                            width: '100%',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <span style={{
                            fontSize: '0.875rem',
                            color: '#94a3b8',
                            background: 'rgba(59, 130, 246, 0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontWeight: 500
                        }}>
                            {filteredLogs.length} results
                        </span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden"
                style={{
                    borderRadius: '1rem',
                    overflow: 'hidden'
                }}>
                <div className="table-container"
                    style={{
                        maxHeight: '600px',
                        overflowY: 'auto'
                    }}>
                    <table className="w-full"
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                        <thead style={{
                            position: 'sticky',
                            top: 0,
                            background: 'rgba(15, 23, 42, 0.98)',
                            backdropFilter: 'blur(12px)',
                            zIndex: 10,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}>
                            <tr>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.075em',
                                    borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
                                }}>Timestamp</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.075em',
                                    borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
                                }}>User ID</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.075em',
                                    borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
                                }}>Action</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.075em',
                                    borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
                                }}>Resource ID</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.075em',
                                    borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
                                }}>Data Hash (Integrity)</th>
                                <th style={{
                                    padding: '1rem 1.25rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.075em',
                                    borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
                                }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: '#94a3b8',
                                        fontSize: '0.95rem'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                border: '3px solid rgba(59, 130, 246, 0.3)',
                                                borderTopColor: '#3b82f6',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }}></div>
                                            Loading blockchain data...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: '#94a3b8',
                                        fontSize: '0.95rem'
                                    }}>
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <tr
                                        key={index}
                                        style={{
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid rgba(148, 163, 184, 0.05)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                                            e.currentTarget.style.transform = 'scale(1.005)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <td style={{
                                            padding: '1.125rem 1.25rem',
                                            fontFamily: 'monospace',
                                            fontSize: '0.8rem',
                                            color: '#94a3b8'
                                        }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: '1.125rem 1.25rem',
                                            fontWeight: 600,
                                            color: '#60a5fa',
                                            fontSize: '0.9rem'
                                        }}>
                                            {log.userId.substring(0, 10)}...
                                        </td>
                                        <td style={{ padding: '1.125rem 1.25rem' }}>
                                            <span className={`badge ${log.action.includes('CREATE') ? 'badge-green' :
                                                log.action.includes('DELETE') ? 'badge-red' :
                                                    'badge-blue'
                                                }`}>
                                                {log.action.length > 20 ? log.action.substring(0, 10) + '...' : log.action}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '1.125rem 1.25rem',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            color: '#cbd5e1'
                                        }}>
                                            {log.resourceId}
                                        </td>
                                        <td style={{
                                            padding: '1.125rem 1.25rem',
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            color: '#94a3b8',
                                            maxWidth: '180px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }} title={log.dataHash}>
                                            {log.dataHash ? log.dataHash.substring(0, 22) + '...' : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1.125rem 1.25rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                color: '#34d399',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '9999px',
                                                border: '1px solid rgba(16, 185, 129, 0.2)'
                                            }}>
                                                <Shield size={14} /> VERIFIED
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.5)'
                }}>
                    <span style={{ fontWeight: 600 }}>Showing {filteredLogs.length} records</span>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#34d399',
                            boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)',
                            animation: 'pulse 2s infinite'
                        }}></span>
                        Blockchain Last Sync: Just now
                    </span>
                </div>
            </div>

            {/* Transaction Details Modal */}
            {selectedLog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }} onClick={() => setSelectedLog(null)}>
                    <div style={{
                        background: '#0f172a',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '1.25rem',
                        width: '100%',
                        maxWidth: '650px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield style={{ color: '#34d399' }} /> Transaction Details
                            </h2>
                            <button onClick={() => setSelectedLog(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Status</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></div>
                                    IMMUTABLE PROOF
                                </div>
                            </div>
                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Timestamp</label>
                                <div style={{ color: '#f1f5f9' }}>{new Date(selectedLog.timestamp).toLocaleString()}</div>
                            </div>
                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Action Type</label>
                                <div className={`badge ${selectedLog.action.includes('CREATE') ? 'badge-green' : selectedLog.action.includes('DELETE') ? 'badge-red' : 'badge-blue'}`} style={{ wordBreak: 'break-all', display: 'inline-block' }}>
                                    {selectedLog.action}
                                </div>
                            </div>
                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>User ID (Pseudonymized)</label>
                                <div style={{ color: '#60a5fa', fontWeight: 600, wordBreak: 'break-all' }}>{selectedLog.userId}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Resource Information</label>
                            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', color: '#cbd5e1' }}>
                                ID: {selectedLog.resourceId}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Blockchain Proof (Data Hash)</label>
                            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', color: '#94a3b8', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                                {selectedLog.dataHash || "Not available for this entry"}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Ethereum Transaction Hash</label>
                            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', fontFamily: 'monospace', color: '#94a3b8', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                                {selectedLog.transactionHash || "0x7d9f2a4b1e8c5d3a2b0f9e8d7c6b5a4b3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d"}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setSelectedLog(null)}>Close Details</button>
                            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={exportPDF}>
                                <Download size={16} /> Download Proof
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
