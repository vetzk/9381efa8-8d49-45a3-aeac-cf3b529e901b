import axios from "axios";

const apiCall = axios.create({
  baseURL: "http://localhost:8010",
});

export default apiCall;
