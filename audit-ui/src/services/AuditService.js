import axios from 'axios';

// En développement local sans Docker Network, on attaque localhost:8083 direct.
// Idéalement, on taperait sur la Gateway (8080).
// Pour éviter les problèmes CORS, assurez-vous que le Backend a @CrossOrigin.
const API_URL = "http://localhost:8083/audit";

const getAllLogs = async () => {
    try {
        const response = await axios.get(`${API_URL}/logs`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all logs", error);
        throw error;
    }
};

const getLogsByPatient = async (patientId) => {
    if (!patientId) return [];
    try {
        const response = await axios.get(`${API_URL}/patient/${patientId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching logs for patient ${patientId}`, error);
        throw error;
    }
};

const getLogsByUser = async (userId) => {
    if (!userId) return [];
    try {
        const response = await axios.get(`${API_URL}/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching logs for user ${userId}`, error);
        throw error;
    }
};

export default {
    getAllLogs,
    getLogsByPatient,
    getLogsByUser
};
