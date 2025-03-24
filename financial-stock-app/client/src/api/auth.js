import axios from 'axios';
import { API_URL } from '../config';


export const registerUser = async (userData) => {
    try {
        return await axios.post(`${API_URL}/register`, userData);
    } catch (error) {
        console.error('Error in registerUser:', error);
        throw error;
    }
};


export const loginUser = async (userData) => {
    try {
         return axios.post(`${API_URL}/login`, userData);
    } catch (error) {
        console.error('Error in loginUser:', error);
        throw error;
    }
};

export const getUserDetails = async (token) => {
    try{
         return axios.get(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    } catch (error) {
        console.error('Error in getUserDetails:', error);
        throw error;
    }
};
