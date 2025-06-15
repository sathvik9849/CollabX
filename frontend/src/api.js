import apiUrl from './config.js';
import { clearUser, delMeetings, getUserInfo } from './localStorage.js';

export const register = async ({ name, email, password, googleUser=false }) => {
  try {
    const response = await axios({
      url: `${apiUrl}/dashboard`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        name,
        email,
        password,
        googleUser
      },
    });
    console.log(response);
    if (response.status !== 201 && response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (err) {
    console.log(err);
    return { error: err.response.data || err.message };
  }
};

export const signin = async ({ email, password }) => {
  try {
    const response = await axios({
      url: `${apiUrl}/signin`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email,
        password,
      },
    });
    if (response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (err) {
    return { error: err.response.data || err.message };
  }
};

export const addMeeting = async ({ userId, meetingId }) => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/meeting/addMeeting`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        userId,
        meetingId,
      },
    });
    if (response.status !== 201) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (err) {
    return { error: err.response.data || err.message };
  }
};

export const refreshUser = async () => {
  try {
    const { refresh } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/dashboard/refresh`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        refreshToken: refresh,
      },
    });
    if (response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (err) {
    return { error: err.response.data || err.message };
  }
};

export const getMyMeetings = async () => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/meeting/getMeetings`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (err) {
    return { error: err.response.data || err.message };
  }
};

export const signout = async () => {
  try {
    const { token, refresh } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/dashboard/logout`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        refreshToken: refresh
      },
    });
    if (response.status !== 204) {
      throw new Error(response);
    }
    clearUser();
    delMeetings();
  } catch (err) {
    return { error: err.response.data || err.message };
  }
};

export const getUserProfile = async () => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/profile`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status !== 200) {
      throw new Error(response);
    }
    return response.data;
  } catch (err) {
    return { error: err.response.data || err.message };
  }
};

export const uploadProductImage = async (formData) => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/upload/profile`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      data: formData
    });
    if (response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (err) {
    return { error: err.response.data.message || err.message };
  }
};

export const updateProfile = async (profileUrl) => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/profile`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        isProfilePic: true,
        profileUrl,
      },
    });
    if (response.status !== 200) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (err) {
    return { error: err.response.data.message || err.message };
  }
};