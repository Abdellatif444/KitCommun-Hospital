const API_URL = 'http://localhost:8081/api/patients'; // Correct endpoint with context path

const PatientService = {
    getAllPatients: async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error("Error fetching patients:", error);
            return [];
        }
    },

    createPatient: async (patient) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patient)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Erreur ${response.status}: ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating patient:", error);
            throw error;
        }
    },

    updatePatient: async (id, patient) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patient)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Erreur ${response.status}: ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error updating patient:", error);
            throw error;
        }
    },

    deletePatient: async (id) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Error deleting patient:", error);
            throw error;
        }
    }
};

export default PatientService;
