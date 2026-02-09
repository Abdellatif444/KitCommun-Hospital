const API_URL = 'http://localhost:8086/api/appointments'; // Port 8086 mapped to 8083

const AppointmentService = {
    // Create new appointment
    createAppointment: async (appointment) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointment)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating appointment:", error);
            throw error;
        }
    },

    // Get appointments by Patient
    getAppointmentsByPatient: async (patientId) => {
        try {
            const response = await fetch(`${API_URL}/patient/${patientId}`);
            if (!response.ok) throw new Error("Failed to fetch appointments");
            return await response.json();
        } catch (error) {
            console.error("Error fetching appointments:", error);
            return [];
        }
    }
};

export default AppointmentService;
