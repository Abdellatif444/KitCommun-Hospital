import React, { useState, useEffect } from 'react';
import { UserCheck, Edit, Trash2, Plus, RefreshCw, X, Zap, CheckCircle, Shield, Briefcase, Stethoscope } from 'lucide-react';
import StaffService from '../services/StaffService';

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'DOCTOR',
        specialty: 'GENERAL_MEDICINE'
    });

    const roles = ['DOCTOR', 'NURSE', 'ADMIN', 'RECEPTIONIST'];
    const specialties = ['GENERAL_MEDICINE', 'CARDIOLOGY', 'PEDIATRICS', 'SURGERY', 'No Specialty'];

    useEffect(() => {
        loadStaff();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const loadStaff = async () => {
        setLoading(true);
        try {
            const data = await StaffService.getAllStaff();
            setStaffList(data);
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateRandomDoctor = async () => {
        setIsProcessing(true);
        const randomNames = ['John', 'Lisa', 'Mark', 'Sarah', 'Paul', 'Emily'];
        const randomLastNames = ['House', 'Cuddy', 'Wilson', 'Chase', 'Cameron', 'Foreman'];
        const specialtiesList = ['CARDIOLOGY', 'NEUROLOGY', 'ONCOLOGY', 'DIAGNOSTICS'];

        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        const randomLast = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
        const randomSpecialty = specialtiesList[Math.floor(Math.random() * specialtiesList.length)];
        const empId = `EMP-${Date.now().toString().slice(-6)}`;

        const newDoctor = {
            employeeId: empId,
            firstName: randomName,
            lastName: randomLast,
            email: `${randomName.toLowerCase()}.${randomLast.toLowerCase()}@ppth.com`,
            phoneNumber: `555-${Math.floor(1000 + Math.random() * 9000)}`,
            role: 'DOCTOR',
            specialty: randomSpecialty
        };

        try {
            await StaffService.createStaff(newDoctor);
            showNotification(`Dr. ${newDoctor.lastName} créé avec succès !`, "success");
            await loadStaff();
        } catch (error) {
            showNotification(`Erreur: ${error.message}`, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenModal = (staff = null) => {
        if (staff) {
            setEditingId(staff.id);
            setFormData({
                employeeId: staff.employeeId,
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                phoneNumber: staff.phoneNumber,
                role: staff.role,
                specialty: staff.specialty || 'GENERAL_MEDICINE'
            });
        } else {
            setEditingId(null);
            setFormData({
                employeeId: `EMP-${Date.now().toString().slice(-6)}`,
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                role: 'DOCTOR',
                specialty: 'GENERAL_MEDICINE'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            if (editingId) {
                await StaffService.updateStaff(editingId, formData);
                showNotification(`Personnel ${formData.firstName} ${formData.lastName} mis à jour !`, "success");
            } else {
                await StaffService.createStaff(formData);
                showNotification(`Personnel ${formData.firstName} ${formData.lastName} ajouté !`, "success");
            }
            await loadStaff();
            handleCloseModal();
        } catch (error) {
            showNotification(`Erreur: ${error.message}`, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Confirmer la désactivation de ce membre du personnel ?')) {
            setIsProcessing(true);
            try {
                await StaffService.deactivateStaff(id);
                showNotification("Personnel désactivé.", "success");
                await loadStaff();
            } catch (error) {
                alert("Erreur lors de la suppression");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Styles constants
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
                        <Briefcase style={{ color: '#3b82f6' }} size={32} />
                        Gestion Personnel (Staff)
                    </h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                        Gérez les médecins, infirmiers et administrateurs du système hospitalier.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={generateRandomDoctor}
                        style={buttonStyle('blue')}
                        disabled={isProcessing}
                    >
                        <Zap size={18} /> {isProcessing ? 'Génération...' : 'Génération Aléatoire'}
                    </button>
                    <button onClick={() => handleOpenModal(null)} style={buttonStyle('green')}>
                        <Plus size={18} /> Nouveau Membre
                    </button>
                    <button onClick={loadStaff} style={buttonStyle('gray')}>
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 100,
                    background: '#1e293b', padding: '1rem 1.5rem', borderRadius: '0.75rem',
                    borderLeft: `4px solid ${notification.type === 'error' ? '#ef4444' : '#10b981'}`,
                    color: 'white',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}>
                    <CheckCircle color={notification.type === 'error' ? '#ef4444' : '#10b981'} size={24} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{notification.type === 'error' ? 'Erreur' : 'Succès'}</div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{notification.message}</div>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div style={cardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(15, 23, 42, 0.3)' }}>
                            <th style={headerCellStyle}>ID / Role</th>
                            <th style={headerCellStyle}>Identité</th>
                            <th style={headerCellStyle}>Spécialité</th>
                            <th style={headerCellStyle}>Contact</th>
                            <th style={headerCellStyle}>Integrity Hash</th>
                            <th style={{ ...headerCellStyle, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Chargement...</td></tr>
                        ) : staffList.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    Aucun personnel trouvé. Utilisez le bouton "Génération Aléatoire".
                                </td>
                            </tr>
                        ) : (
                            staffList.map(staff => (
                                <tr key={staff.id} style={{ transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ ...cellStyle, fontFamily: 'monospace' }}>
                                        <div style={{ color: '#f1f5f9', fontWeight: 600 }}>ID: {staff.id}</div>
                                        <div style={{
                                            color: staff.role === 'DOCTOR' ? '#60a5fa' : '#94a3b8',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: staff.role === 'DOCTOR' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            width: 'fit-content',
                                            marginTop: '4px'
                                        }}>
                                            {staff.role}
                                        </div>
                                    </td>
                                    <td style={{ ...cellStyle, fontWeight: 600, color: 'white' }}>
                                        {staff.lastName.toUpperCase()} {staff.firstName}
                                    </td>
                                    <td style={{ ...cellStyle, color: '#e2e8f0' }}>
                                        {staff.specialty ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Stethoscope size={14} color="#10b981" />
                                                {staff.specialty}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#64748b' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ ...cellStyle, color: '#cbd5e1', fontSize: '0.85rem' }}>
                                        <div>{staff.email}</div>
                                        <div style={{ color: '#64748b' }}>{staff.phoneNumber}</div>
                                    </td>
                                    <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                                        {staff.integrityHash ? (
                                            <span title={staff.integrityHash} style={{ cursor: 'help', borderBottom: '1px dashed #64748b' }}>
                                                {staff.integrityHash.substring(0, 8)}...
                                            </span>
                                        ) : (
                                            <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>N/A</span>
                                        )}
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleOpenModal(staff)}
                                                style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(staff.id)}
                                                style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                                                title="Désactiver"
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
                                Nouveau Membre Personnel
                            </h2>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Matricule Employé</label>
                                <input required name="employeeId" value={formData.employeeId} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white' }} placeholder="EMP-XXXX" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Prénom</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nom</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Téléphone</label>
                                <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Rôle</label>
                                    <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}>
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Spécialité</label>
                                    <select name="specialty" value={formData.specialty} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }} disabled={formData.role !== 'DOCTOR'}>
                                        {formData.role === 'DOCTOR' ? (
                                            specialties.map(s => <option key={s} value={s}>{s}</option>)
                                        ) : (
                                            <option value="">N/A</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={handleCloseModal} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: '#475569', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                                <button type="submit" disabled={isProcessing} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    {editingId ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
