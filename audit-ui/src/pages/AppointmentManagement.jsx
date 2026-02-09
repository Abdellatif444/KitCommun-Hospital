import React, { useState } from 'react';
import { Calendar, UserPlus, FileText, CheckCircle, Clock, Video, User, RefreshCw } from 'lucide-react';
import AppointmentService from '../services/AppointmentService';
import PatientService from '../services/PatientService';
import StaffService from '../services/StaffService';

const AppointmentManagement = () => {
    const [patientId, setPatientId] = useState('');
    const [patientsList, setPatientsList] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [appointmentDateTime, setAppointmentDateTime] = useState(() => {
        // Default: tomorrow at 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        return tomorrow.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const loadAppointments = async (id = patientId) => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await AppointmentService.getAppointmentsByPatient(id);
            setAppointments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        const patients = await PatientService.getAllPatients();
        setPatientsList(patients);
    };

    const fetchDoctors = async () => {
        const staff = await StaffService.getAllStaffIncludingInactive();
        // Filter only doctors (active and inactive)
        const doctors = staff.filter(s => s.role === 'DOCTOR');
        setDoctorsList(doctors);

        // Auto-select first active doctor if available
        const activeDoctors = doctors.filter(d => d.active !== false);
        if (activeDoctors.length > 0 && !selectedDoctorId) {
            setSelectedDoctorId(activeDoctors[0].id);
        }
    };

    const generateTestDoctor = async () => {
        try {
            const newDoctor = {
                employeeId: `EMP-${Date.now().toString().slice(-6)}`,
                firstName: "Gregory",
                lastName: "House",
                role: "DOCTOR",
                specialty: "GENERAL_MEDICINE",
                email: `house.${Date.now()}@ppth.com`,
                phoneNumber: "555-0199"
            };
            await StaffService.createStaff(newDoctor);
            showNotification("Dr. House a été créé avec succès !", "success");
            fetchDoctors();
        } catch (error) {
            showNotification("Erreur lors de la création du médecin: " + error.message, "error");
        }
    };

    // Load patients and doctors on mount
    React.useEffect(() => {
        fetchPatients();
        fetchDoctors();
    }, []);

    const createAppointment = async () => {
        if (!patientId) {
            showNotification("Veuillez saisir un ID Patient valide", "error");
            return;
        }

        if (!selectedDoctorId) {
            showNotification("Veuillez sélectionner un médecin (ou en générer un)", "error");
            return;
        }

        const newAppointment = {
            patientId: parseInt(patientId),
            doctorId: parseInt(selectedDoctorId),
            appointmentDateTime: new Date(appointmentDateTime).toISOString(), // User-selected date
            durationMinutes: 30, // Default duration
            appointmentType: "ROUTINE_CHECKUP", // Valid ENUM value
            status: "SCHEDULED",
            reason: "Consultation de Routine (Demo)",
            notes: "Patient test créé par Auditeur"
        };

        try {
            const created = await AppointmentService.createAppointment(newAppointment);
            showNotification(`Rendez-vous planifié ! Preuve Blockchain (ID: ${created.id}) générée.`, "success");
            await loadAppointments();
        } catch (error) {
            showNotification(`Erreur: ${error.message}`, "error");
        }
    };

    // Helper function to get doctor name from ID
    const getDoctorInfo = (doctorId) => {
        const doctor = doctorsList.find(d => d.id === doctorId);
        if (doctor) {
            const isInactive = doctor.active === false;
            return (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Dr. {doctor.lastName} {doctor.firstName} ({doctor.specialty || 'N/A'})
                    {isInactive && (
                        <span style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            ⚠️ INACTIF
                        </span>
                    )}
                </span>
            );
        }
        return `Dr. ID: ${doctorId}`;
    };

    // Premium Styles
    const cardStyle = {
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        padding: '2.5rem',
        boxShadow: '0 20px 50px -12px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1)',
        position: 'relative',
        overflow: 'hidden'
    };

    const inputStyle = {
        background: 'rgba(51, 65, 85, 0.8)',
        border: '2px solid rgba(139, 92, 246, 0.3)',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.75rem',
        fontSize: '0.9rem',
        width: '100%',
        marginBottom: '1rem',
        transition: 'all 0.3s ease',
        outline: 'none'
    };

    const itemStyle = {
        padding: '1rem',
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '0.5rem',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    return (
        <div style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Premium Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                borderRadius: '1.5rem',
                padding: '2rem',
                marginBottom: '2.5rem',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.3)'
            }}>
                <h1 style={{
                    fontSize: '2.25rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    margin: 0
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        padding: '0.75rem',
                        borderRadius: '1rem',
                        display: 'flex',
                        boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.5)'
                    }}>
                        <Calendar style={{ color: 'white' }} size={36} />
                    </div>
                    Gestion Consultations
                </h1>
                <p style={{ color: '#cbd5e1', marginTop: '0.75rem', fontSize: '1rem', marginLeft: '4.5rem' }}>
                    Planifiez et gérez les rendez-vous médicaux avec traçabilité blockchain
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Creation Panel */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', borderBottom: '1px solid #475569', paddingBottom: '0.5rem' }}>
                        Nouveau Rendez-vous
                    </h2>

                    <div>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Sélectionner Patient</label>
                        <select
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            onChange={(e) => {
                                setPatientId(e.target.value);
                                loadAppointments(e.target.value);
                            }}
                            value={patientId}
                        >
                            <option value="">-- Choisir un patient --</option>
                            {patientsList.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.firstName} {p.lastName} (ID: {p.id})
                                </option>
                            ))}
                        </select>

                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', margin: '0.5rem 0' }}>OU</div>

                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>ID Patient (Manuel)</label>
                        <input
                            placeholder="Entrez l'ID numérique (ex: 1)"
                            style={inputStyle}
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Médecin</label>
                        {doctorsList.length === 0 ? (
                            <button
                                onClick={generateTestDoctor}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    color: '#60a5fa',
                                    border: '1px dashed #3b82f6',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                + Générer un Médecin (Dr. House)
                            </button>
                        ) : (
                            <select
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                value={selectedDoctorId}
                                onChange={(e) => setSelectedDoctorId(e.target.value)}
                            >
                                <option value="">-- Choisir un médecin --</option>
                                {doctorsList.map(d => (
                                    <option key={d.id} value={d.id}>
                                        Dr. {d.lastName} {d.firstName} ({d.specialty})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Date et Heure du Rendez-vous</label>
                        <input
                            type="datetime-local"
                            style={inputStyle}
                            value={appointmentDateTime}
                            onChange={(e) => setAppointmentDateTime(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    <button
                        onClick={createAppointment}
                        disabled={!patientId}
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            background: !patientId ? 'rgba(71, 85, 105, 0.5)' : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '1rem',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: !patientId ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s ease',
                            boxShadow: !patientId ? 'none' : '0 10px 30px -5px rgba(139, 92, 246, 0.5)',
                            transform: 'translateY(0)',
                            marginTop: '1.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (patientId) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px -5px rgba(139, 92, 246, 0.7)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = !patientId ? 'none' : '0 10px 30px -5px rgba(139, 92, 246, 0.5)';
                        }}
                    >
                        <Clock size={20} /> Planifier Consultation
                    </button>

                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        * Simule une consultation pour demain avec le Dr. Mock (ID 101).
                    </div>
                </div>

                {/* List Panel */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid rgba(139, 92, 246, 0.2)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <FileText size={24} style={{ color: '#a78bfa' }} />
                            Historique Consultations
                        </h2>
                        <button
                            onClick={() => loadAppointments()}
                            style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                color: '#a78bfa',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)';
                            }}
                        >
                            <RefreshCw size={16} />
                            Rafraîchir
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Chargement...</div>
                    ) : appointments.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            color: '#94a3b8',
                            padding: '3rem',
                            border: '2px dashed rgba(139, 92, 246, 0.3)',
                            borderRadius: '1rem',
                            background: 'rgba(139, 92, 246, 0.05)'
                        }}>
                            <Calendar size={48} style={{ color: 'rgba(139, 92, 246, 0.5)', marginBottom: '1rem' }} />
                            <div>Aucun rendez-vous trouvé pour ce patient.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {appointments.map(apt => (
                                <div key={apt.id} style={{
                                    background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%)',
                                    padding: '1.5rem',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateX(8px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)';
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                    }}
                                >
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            display: 'flex',
                                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                        }}>
                                            <Calendar size={24} style={{ color: 'white' }} />
                                        </div>
                                        <div>
                                            <div style={{
                                                color: '#ffffff',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {apt.reason || 'Consultation'}
                                            </div>
                                            <div style={{
                                                color: '#a78bfa',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                marginBottom: '0.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <Clock size={14} />
                                                {apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleString('fr-FR', {
                                                    dateStyle: 'full',
                                                    timeStyle: 'short'
                                                }) : 'Date non disponible'}
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                <User size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                                {getDoctorInfo(apt.doctorId)}
                                            </div>
                                            {apt.notes && (
                                                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                                    📝 {apt.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '2rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        background: apt.status === 'SCHEDULED'
                                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)'
                                            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.3) 100%)',
                                        color: apt.status === 'SCHEDULED' ? '#10b981' : '#f87171',
                                        border: `2px solid ${apt.status === 'SCHEDULED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <CheckCircle size={16} />
                                        {apt.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Toast */}
            {
                notification && (
                    <div style={{
                        position: 'fixed', top: '20px', right: '20px', zIndex: 100,
                        background: '#1e293b', padding: '1rem 1.5rem', borderRadius: '0.75rem',
                        borderLeft: `4px solid ${notification.type === 'error' ? '#ef4444' : '#10b981'}`,
                        color: 'white',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}>
                        <strong>{notification.type === 'error' ? 'Erreur' : 'Succès'}</strong>
                        <div>{notification.message}</div>
                    </div>
                )
            }
        </div >
    );
};

export default AppointmentManagement;
