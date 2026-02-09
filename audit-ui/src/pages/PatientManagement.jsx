import React, { useState, useEffect } from 'react';
import { UserCheck, Edit, Trash2, Plus, RefreshCw, X, Zap, CheckCircle, Shield } from 'lucide-react';
import PatientService from '../services/PatientService';

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Form data with ALL required fields
    const [formData, setFormData] = useState({
        uuid: '',
        firstName: '',
        lastName: '',
        email: '',
        nationalId: '', // Required
        dateOfBirth: '', // Required
        gender: 'MALE', // Required
        address: '',
        phoneNumber: ''
    });

    useEffect(() => {
        loadPatients();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const loadPatients = async () => {
        setLoading(true);
        try {
            const data = await PatientService.getAllPatients();
            setPatients(data);
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateRandomPatient = async () => {
        setIsProcessing(true);
        const randomNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace'];
        const randomLastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Taylor', 'Miller'];

        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        const randomLast = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
        // Generate random DOB
        const year = 1970 + Math.floor(Math.random() * 30);
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

        const newPatient = {
            firstName: randomName,
            lastName: randomLast,
            email: `${randomName.toLowerCase()}.${randomLast.toLowerCase()}@example.com`,
            nationalId: `XYZ${Math.floor(100000 + Math.random() * 900000)}`,
            dateOfBirth: `${year}-${month}-${day}`,
            gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
            address: `${Math.floor(Math.random() * 100)} Rue de la Paix`,
            phoneNumber: `+336${Math.floor(10000000 + Math.random() * 90000000)}`
        };

        try {
            await PatientService.createPatient(newPatient);
            showNotification("Patient aléatoire créé ! Transaction envoyée.", "success");
            await loadPatients();
        } catch (error) {
            console.error(error);
            showNotification(`${error.message}`, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({ ...user }); // Will copy existing fields
        } else {
            setCurrentUser(null);
            // Pre-fill required fields with random data for manual creation too (for ease of use)
            const year = 1980 + Math.floor(Math.random() * 20);
            const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

            setFormData({
                uuid: crypto.randomUUID(),
                firstName: '',
                lastName: '',
                email: '',
                nationalId: `ID-${Math.floor(100000 + Math.random() * 900000)}`,
                dateOfBirth: `${year}-${month}-${day}`,
                gender: 'MALE',
                address: '123 Test St',
                phoneNumber: '0600000000'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ uuid: '', firstName: '', lastName: '', email: '', nationalId: '', dateOfBirth: '', gender: 'MALE', address: '', phoneNumber: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            if (currentUser) {
                await PatientService.updatePatient(currentUser.id || currentUser.uuid, formData); // Ensure ID is used
                showNotification("Patient mis à jour avec succès !", "success");
            } else {
                await PatientService.createPatient(formData);
                showNotification("Patient créé avec succès !", "success");
            }
            await loadPatients();
            handleCloseModal();
        } catch (error) {
            console.error(error);
            showNotification(`${error.message}`, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (uuid) => {
        if (window.confirm('Confirmer suppression ? Cela créera un log immuable DELETE.')) {
            setIsProcessing(true);
            try {
                await PatientService.deletePatient(uuid);
                showNotification("Patient supprimé. Preuve générée.", "success");
                await loadPatients();
            } catch (error) {
                alert("Erreur lors de la suppression");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Styles constants extracted from AuditLogs.jsx for consistency
    const cardStyle = {
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1rem',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
    };

    const headerCellStyle = {
        padding: '1rem 1.25rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.075em',
        borderBottom: '2px solid rgba(59, 130, 246, 0.3)'
    };

    const cellStyle = {
        padding: '1.125rem 1.25rem',
        borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
        color: '#e2e8f0'
    };

    const buttonStyle = (color) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        background: color === 'blue' ? 'rgba(59, 130, 246, 0.9)' : color === 'green' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(71, 85, 105, 0.5)',
        color: 'white',
        fontWeight: 600,
        fontSize: '0.875rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    });

    return (
        <div style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield style={{ color: '#3b82f6' }} size={32} />
                        Simulateur Transactions
                    </h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                        Générez des opérations CRUD pour voir la magie de la Blockchain.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={generateRandomPatient}
                        style={buttonStyle('blue')}
                        disabled={isProcessing}
                    >
                        <Zap size={18} /> {isProcessing ? 'Génération...' : 'Génération Rapide'}
                    </button>
                    <button onClick={() => handleOpenModal()} style={buttonStyle('green')}>
                        <Plus size={18} /> Nouveau Patient
                    </button>
                    <button onClick={loadPatients} style={buttonStyle('gray')}>
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 100,
                    background: '#1e293b', padding: '1rem 1.5rem', borderRadius: '0.75rem',
                    borderLeft: '4px solid #10b981', color: 'white',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}>
                    <CheckCircle color="#10b981" size={24} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{notification.type === 'error' ? 'Erreur' : 'Transaction Émise'}</div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{notification.message}</div>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div style={cardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(15, 23, 42, 0.3)' }}>
                            <th style={headerCellStyle}>UUID Technique</th>
                            <th style={headerCellStyle}>Identité</th>
                            <th style={headerCellStyle}>Contact</th>
                            <th style={{ ...headerCellStyle, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</td></tr>
                        ) : patients.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    Aucune donnée. Utilisez le bouton "Génération Rapide".
                                </td>
                            </tr>
                        ) : (
                            patients.map(patient => (
                                <tr key={patient.uuid || patient.id} style={{ transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ ...cellStyle, fontFamily: 'monospace', color: '#94a3b8' }}>
                                        {patient.uuid ? patient.uuid.substring(0, 8) + '...' : `ID:${patient.id}`}
                                    </td>
                                    <td style={{ ...cellStyle, fontWeight: 600, color: 'white' }}>
                                        {patient.lastName.toUpperCase()} {patient.firstName}
                                    </td>
                                    <td style={{ ...cellStyle, color: '#cbd5e1' }}>
                                        {patient.email}
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleOpenModal(patient)}
                                                style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(patient.id || patient.uuid)} // Use ID for delete
                                                style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50
                }}>
                    <div style={{
                        background: '#1e293b', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px',
                        border: '1px solid rgba(148, 163, 184, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                                {currentUser ? 'Modifier Patient' : 'Nouveau Patient'}
                            </h2>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Only show simplified form for demo, but submit all required defaults */}
                            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Note: Les champs techniques (National ID, DOB) sont auto-générés pour cette démo.
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Prénom</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white' }} placeholder="Ex: Jean" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nom</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white' }} placeholder="Ex: Dupont" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white' }} placeholder="jean@exemple.com" />
                            </div>

                            {/* Hidden inputs for mandatory fields logic */}
                            <input type="hidden" name="nationalId" value={formData.nationalId} />
                            <input type="hidden" name="dateOfBirth" value={formData.dateOfBirth} />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={handleCloseModal} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: '#475569', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                                <button type="submit" disabled={isProcessing} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    {currentUser ? 'Enregistrer' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientManagement;
