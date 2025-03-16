import axios from 'axios';

const API_URL = 'https://special-space-meme-4w675g6967rhjpxw-3000.app.github.dev/api';
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
