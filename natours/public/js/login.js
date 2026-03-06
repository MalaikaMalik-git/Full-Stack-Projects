/* eslint-disable */
import axios from 'axios';
import { showAlerts } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios(
      {
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/v1/users/login',
        data: {
          email,
          password,
        },
      },
      {
        withCredentials: true,
      }
    );
    if (res.data.status === 'success') {
      showAlerts('success', 'Logged In Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlerts('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
      withCredentials: true,
    });
    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlerts('error', 'Error logging out! Try again.');
  }
};
