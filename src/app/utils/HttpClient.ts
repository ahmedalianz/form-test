import axios from "axios";
const privateKey='3%o8i}_;3D4bF]G5@22r2)Et1&mLJ4?$@+16'
const HttpClient = axios.create({
    baseURL: 'https://staging.mazaady.com/api/v1', 
    headers: {
      'Content-Type': 'application/json',
      'private-key': privateKey,
    },
  });
  export default HttpClient;