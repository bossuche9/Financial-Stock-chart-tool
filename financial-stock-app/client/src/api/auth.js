import axios from 'axios';
import { API_URL } from '../config';


 // Adjust if your backend runs on a different port

export const registerUser = async (userData) => {
    try {
        return await axios.post(`${API_URL}/register`, userData);
    } catch (error) {
        console.error('Error in registerUser:', error);
        throw error;
    }
};


export const loginUser = async (userData) => {
    return axios.post(`${API_URL}/login`, userData);
};

export const getUserDetails = async (token) => {
    return axios.get(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
