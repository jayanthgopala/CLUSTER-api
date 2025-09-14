import axios from "axios";

// Use direct backend URL if VITE_BACKEND_URL is not defined
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://completeplacementrepo.vercel.app';

const api = axios.create({
  baseURL: BACKEND_URL, // backend URL
  withCredentials: true, // send cookies for session auth
});

// Company API Functions
export const getCompanies = () => api.get("/api/companies");
export const createCompany = (formData) => api.post("/api/companies", formData);
export const updateCompany = (id, formData) => api.put(`/api/companies/${id}`, formData);
export const deleteCompany = (id) => api.delete(`/api/companies/${id}`);

// Job API Functions
export const getJobs = () => api.get("/api/jobs");
export const createJob = (jobData) => api.post("/api/jobs", jobData);
export const updateJob = (id, jobData) => api.put(`/api/jobs/${id}`, jobData);
export const deleteJob = (id) => api.delete(`/api/jobs/${id}`);

// Notices API Functions
export const getNotices = () => api.get("/api/notices");
export const getCacheJobs = () => api.get("/api/cachejobs");

// GraphQL API Helper
export const graphqlRequest = (query, variables) => api.post("/graphql", 
  { query, variables }, 
  { headers: { "Content-Type": "application/json" }}
);

export default api;
