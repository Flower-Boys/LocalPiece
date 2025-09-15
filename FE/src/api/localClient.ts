import axios from "axios";

const localClient = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default localClient;
