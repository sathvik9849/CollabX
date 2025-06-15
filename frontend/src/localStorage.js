export const setUserInfo = ({
  _id = '',
  name = '',
  email = '',
  personalMeetingId = '',
  token = '',
  refresh = '',
  dob = '',
  googleUser = '',
  profileUrl = '',
  isProfilePic = '',
  gender = '',
  referralCode = '',
  referralRedeemCode = '',
  totalSpend = '',
}) => {
  localStorage.setItem('userInfo', JSON.stringify({
    _id,
    name,
    email,
    personalMeetingId,
    token,
    refresh,
    dob,
    googleUser,
    profileUrl,
    isProfilePic,
    gender,
    referralCode,
    referralRedeemCode,
    totalSpend,
  }));
};

export const getUserInfo = () => (localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : { name: '', email: '' });

export const clearUser = () => {
  localStorage.removeItem('userInfo');
};

export const setMeetings = (meetings = []) => {
  localStorage.setItem('my_meetings', JSON.stringify(meetings));
};

export const getMeetings = () => (localStorage.getItem('my_meetings') ? JSON.parse(localStorage.getItem('my_meetings')) : []);

export const delMeetings = () => {
  localStorage.removeItem('my_meetings');
};
