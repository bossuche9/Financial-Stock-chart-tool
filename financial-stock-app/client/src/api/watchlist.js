import axios from 'axios';
import { API_URL } from '../config';

export const addToWatchlist = async (token, symbol) => {
    try{
        return axios.post(`${API_URL}/watchlist/add`,{ symbol }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error( 'Error in addToWatchlsit', error);
        throw error;
    }
};

export const removeFromWatchlist = async (token, symbol) => {
    try{
        return axios.post(`${API_URL}/watchlist/remove`,{ symbol }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error( 'Error in removeFromWatchlsit', error);
        throw error;
    }
};

export const getWatchlistDetails = async (token) => {
    try{
        return axios.get(`${API_URL}/watchlist`, {
            headers: { Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' 
        }
        });
    } catch (error) {
        console.error( 'Error in getWatchlsit', error);
        throw error;
    }
};

