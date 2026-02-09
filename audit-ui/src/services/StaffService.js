const API_URL = 'http://localhost:8082/api/staff';

const StaffService = {
    getAllStaff: async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error("Error fetching staff:", error);
            return [];
        }
    },

    createStaff: async (staff) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staff)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Erreur ${response.status}: ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating staff:", error);
            throw error;
        }
    },

    deactivateStaff: async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to deactivate staff');
        } catch (error) {
            console.error("Error deactivating staff:", error);
            throw error;
        }
    }
};

export default StaffService;
