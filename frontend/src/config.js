const apiUrl = document.location.href.startsWith('http://localhost')
  ? 'http://localhost:3000'
  : 'https://collabx-backend-pxhm.onrender.com';
export default apiUrl;