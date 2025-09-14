import React, { useState, useEffect } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import axios from "axios";

// Backend API URL
const BACKEND_URL = 'https://completeplacementrepo.vercel.app';
const API_PREFIX = '/api'; // API endpoint prefix

export default function Jobs() {
  // State for jobs list
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for form mode
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [selectedJob, setSelectedJob] = useState(null);
  
  // State for companies (for the dropdown)
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary_range: "",
    location: "",
    company_id: "",
    start_date: "",
    end_date: "",
    status: "Open" // Default status
  });

  // Fetch jobs and companies on component mount
  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);

    // Try with API prefix first
    async function tryFetch(useApiPrefix) {
      try {
        const endpoint = useApiPrefix 
          ? `${BACKEND_URL}${API_PREFIX}/jobs` 
          : `${BACKEND_URL}/jobs`;
        
        console.log(`Fetching jobs from ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          withCredentials: true
        });
        
        console.log("Jobs API response:", response);
        
        if (response.data) {
          // Handle different response formats
          const jobsData = Array.isArray(response.data) ? response.data : 
                          (response.data.jobs || response.data.data || []);
          console.log("Jobs data:", jobsData);
          setJobs(jobsData);
          setError(null);
          return true; // Success
        } else {
          console.error("Invalid API response:", response);
          setError("Failed to fetch jobs. Invalid response format.");
          return false;
        }
      } catch (err) {
        console.error(`Error fetching jobs from ${useApiPrefix ? 'with' : 'without'} API prefix:`, err);
        setError(`Failed to fetch jobs: ${err.message}`);
        return false; // Failed
      }
    }
    
    // Try with API prefix first, then fallback to no prefix
    const succeeded = await tryFetch(true);
    if (!succeeded) {
      console.log("First attempt failed, trying alternate endpoint...");
      await tryFetch(false);
    }
    
    setLoading(false);
  };

  const fetchCompanies = async () => {
    setLoadingCompanies(true);

    // Try with API prefix first
    async function tryFetch(useApiPrefix) {
      try {
        const endpoint = useApiPrefix 
          ? `${BACKEND_URL}${API_PREFIX}/companies` 
          : `${BACKEND_URL}/companies`;
        
        console.log(`Fetching companies from ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          withCredentials: true
        });
        
        console.log("Companies API response for dropdown:", response);
        
        if (response.data) {
          // Handle different response formats
          const companiesData = Array.isArray(response.data) ? response.data : 
                               (response.data.companies || response.data.data || []);
          console.log("Companies data for dropdown:", companiesData);
          setCompanies(companiesData);
          return true; // Success
        } else {
          console.error("Invalid API response for companies:", response);
          return false;
        }
      } catch (err) {
        console.error(`Error fetching companies from ${useApiPrefix ? 'with' : 'without'} API prefix:`, err);
        return false; // Failed
      }
    }
    
    // Try with API prefix first, then fallback to no prefix
    const succeeded = await tryFetch(true);
    if (!succeeded) {
      console.log("First company fetch attempt failed, trying alternate endpoint...");
      await tryFetch(false);
    }
    
    setLoadingCompanies(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create a job object with form data
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        salary_range: formData.salary_range,
        location: formData.location,
        company_id: formData.company_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status
      };
      
      let response;
      
      if (formMode === "add") {
        // Create new job using REST API
        console.log(`Creating new job at ${BACKEND_URL}${API_PREFIX}/jobs`);
        try {
          response = await axios.post(`${BACKEND_URL}${API_PREFIX}/jobs`, jobData, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
          });
        } catch (firstError) {
          console.log(`First attempt failed, trying ${BACKEND_URL}/jobs`);
          response = await axios.post(`${BACKEND_URL}/jobs`, jobData, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
          });
        }
      } else {
        // Use the correct ID field from your API (either _id or id)
        const jobId = selectedJob._id || selectedJob.id;
        console.log(`Updating job with ID: ${jobId} at ${BACKEND_URL}${API_PREFIX}/jobs/${jobId}`);
        
        try {
          response = await axios.put(`${BACKEND_URL}${API_PREFIX}/jobs/${jobId}`, jobData, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
          });
        } catch (firstError) {
          console.log(`First attempt failed, trying ${BACKEND_URL}/jobs/${jobId}`);
          response = await axios.put(`${BACKEND_URL}/jobs/${jobId}`, jobData, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      
      console.log("API response:", response);
      
      // Reset form and refetch jobs
      resetForm();
      fetchJobs();
      setError(null);
    } catch (err) {
      console.error("Error saving job:", err);
      setError(`Failed to save job: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
      salary_range: job.salary_range || "",
      location: job.location || "",
      company_id: job.company?._id || "",
      start_date: job.start_date ? new Date(job.start_date).toISOString().split('T')[0] : "",
      end_date: job.end_date ? new Date(job.end_date).toISOString().split('T')[0] : "",
      status: job.status || "Open"
    });
    
    setFormMode("edit");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        // Use the direct URL to the backend with API prefix
        console.log(`Deleting job with ID: ${id} from ${BACKEND_URL}${API_PREFIX}/jobs/${id}`);
        
        try {
          await axios.delete(`${BACKEND_URL}${API_PREFIX}/jobs/${id}`, {
            withCredentials: true
          });
        } catch (firstError) {
          console.log(`First delete attempt failed, trying ${BACKEND_URL}/jobs/${id}`);
          await axios.delete(`${BACKEND_URL}/jobs/${id}`, {
            withCredentials: true
          });
        }
        
        // Refresh the jobs list
        fetchJobs();
        setError(null);
      } catch (err) {
        console.error("Error deleting job:", err);
        setError(`Failed to delete job: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: "",
      salary_range: "",
      location: "",
      company_id: "",
      start_date: "",
      end_date: "",
      status: "Open"
    });
    setSelectedJob(null);
    setFormMode("add");
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h2>Job Management</h2>
          <p className="muted">Create and manage job listings</p>
        </div>
        
        {/* Form section */}
        <section className="card">
          <h3>{formMode === "add" ? "Add New Job" : "Edit Job"}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-row">
              <label htmlFor="title">Job Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Job Title"
                required
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="company_id">Company</label>
              <select
                id="company_id"
                name="company_id"
                value={formData.company_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a company</option>
                {loadingCompanies ? (
                  <option value="" disabled>Loading companies...</option>
                ) : (
                  companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="form-row">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Job description"
                rows={3}
                required
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Job requirements"
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="salary_range">Salary Range</label>
              <input
                id="salary_range"
                name="salary_range"
                type="text"
                value={formData.salary_range}
                onChange={handleInputChange}
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Job location"
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="start_date">Start Date</label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="end_date">Application Deadline</label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn primary">
                {formMode === "add" ? "Add Job" : "Update Job"}
              </button>
              {formMode === "edit" && (
                <button type="button" onClick={resetForm} className="btn outline">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
        
        {/* Jobs List */}
        <section className="card" style={{ marginTop: "20px" }}>
          <h3>Jobs List</h3>
          {loading ? (
            <div>Loading jobs...</div>
          ) : (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Salary Range</th>
                    <th>Start Date</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No jobs found</td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {job.company && job.company.logo ? (
                              <img 
                                src={job.company.logo} 
                                alt={job.company.name} 
                                width="30" 
                                height="30" 
                                style={{ borderRadius: "4px", objectFit: "contain" }} 
                              />
                            ) : null}
                            {job.company ? job.company.name : "Unknown Company"}
                          </div>
                        </td>
                        <td>{job.title}</td>
                        <td>{job.location || "-"}</td>
                        <td>{job.salary_range || "-"}</td>
                        <td>{formatDate(job.start_date)}</td>
                        <td>{formatDate(job.end_date)}</td>
                        <td>
                          <span className={`status-badge ${job.status.toLowerCase()}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() => handleEdit(job)}
                              className="btn outline small"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="btn danger small"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}