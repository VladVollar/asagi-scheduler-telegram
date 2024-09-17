import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiToken = process.env.ALERTS_IN_UA_API_TOKEN; // Load API token from .env

export const checkAirAlert = async () => {
  try {
    return await axios.get('https://api.alerts.in.ua/v1/iot/active_air_raid_alerts/18.json', {
      params: {token: apiToken}  // Use the API token here
    });
  } catch (error) {
    console.error('Error fetching alert data:', error);
    throw error;
  }
};