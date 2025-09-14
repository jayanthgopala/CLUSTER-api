import React, { useState, useEffect } from 'react';
import { jobService } from '../services/api';
import { Bell, Trash2, Edit, Plus, Save, X, AlertCircle } from 'lucide-react';

const JobManager = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: { name: '', logo: '' },
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    req_skills: []
  });
  const [isCreating, setIsCreating] = useState(false);
  const [formSkill, setFormSkill] = useState('');

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getAllJobs();
      
      // Handle different response formats
      let jobsArray = [];
      if (Array.isArray(data)) {
        jobsArray = data;
      } else if (data.jobs && Array.isArray(data.jobs)) {
        jobsArray = data.jobs;
      } else if (data.data && Array.isArray(data.data)) {
        jobsArray = data.data;
      }
      
      setJobs(jobsArray);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like company.name
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddSkill = () => {
    if (formSkill.trim()) {
      setFormData({
        ...formData,
        req_skills: [...formData.req_skills, formSkill.trim()]
      });
      setFormSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = [...formData.req_skills];
    updatedSkills.splice(index, 1);
    setFormData({
      ...formData,
      req_skills: updatedSkills
    });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await jobService.createJob(formData);
      setIsCreating(false);
      setFormData({
        title: '',
        company: { name: '', logo: '' },
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        req_skills: []
      });
      await fetchJobs();
    } catch (err) {
      console.error("Error creating job:", err);
      setError("Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await jobService.updateJob(editingJob, formData);
      setEditingJob(null);
      setFormData({
        title: '',
        company: { name: '', logo: '' },
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        req_skills: []
      });
      await fetchJobs();
    } catch (err) {
      console.error("Error updating job:", err);
      setError("Failed to update job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job.id);
    setFormData({
      title: job.title || '',
      company: {
        name: job.company?.name || '',
        logo: job.company?.logo || ''
      },
      description: job.description || '',
      startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : '',
      endDate: job.endDate ? new Date(job.endDate).toISOString().split('T')[0] : '',
      location: job.location || '',
      req_skills: job.req_skills || []
    });
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        setLoading(true);
        await jobService.deleteJob(id);
        await fetchJobs();
      } catch (err) {
        console.error("Error deleting job:", err);
        setError("Failed to delete job. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelEditing = () => {
    setEditingJob(null);
    setIsCreating(false);
    setFormData({
      title: '',
      company: { name: '', logo: '' },
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      req_skills: []
    });
  };

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
          Manage Job Notifications
        </h1>
        
        {!isCreating && !editingJob && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Plus size={16} /> New Job
          </button>
        )}
      </div>
      
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#b91c1c', 
          padding: '12px 16px', 
          borderRadius: '6px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      
      {/* Form for creating/editing jobs */}
      {(isCreating || editingJob) && (
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
            {isCreating ? 'Create New Job' : 'Edit Job'}
          </h2>
          
          <form onSubmit={isCreating ? handleCreateJob : handleUpdateJob}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Job Title*
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Company Name*
                </label>
                <input
                  type="text"
                  name="company.name"
                  value={formData.company.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Company Logo URL
                </label>
                <input
                  type="url"
                  name="company.logo"
                  value={formData.company.logo}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              ></textarea>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Start Date*
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Required Skills
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={formSkill}
                  onChange={(e) => setFormSkill(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="e.g. JavaScript"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0 12px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.req_skills.map((skill, index) => (
                  <div 
                    key={index}
                    style={{
                      background: '#e0e7ff',
                      color: '#4338ca',
                      borderRadius: '16px',
                      padding: '4px 10px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={cancelEditing}
                style={{
                  background: '#f3f4f6',
                  color: '#4b5563',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Job'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Jobs list */}
      {!loading && jobs.length === 0 ? (
        <div style={{ 
          padding: '32px', 
          textAlign: 'center',
          background: 'white',
          borderRadius: '8px',
          border: '1px dashed #d1d5db'
        }}>
          <Bell size={36} style={{ color: '#9ca3af', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
            No job notifications yet
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Create your first job notification to get started.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px' }}>Loading jobs...</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {jobs.map((job) => (
                <div 
                  key={job.id || job._id} 
                  style={{ 
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ 
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ 
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src={job.company?.logo || 'https://via.placeholder.com/100?text=Logo'} 
                        alt={job.company?.name || 'Company'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100?text=Logo';
                        }}
                      />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>
                        {job.company?.name || 'Company'}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>
                        {job.startDate ? new Date(job.startDate).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', flex: 1 }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#3b82f6', marginTop: 0 }}>
                      {job.title || 'Job Title'}
                    </h4>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#4b5563',
                      margin: '8px 0 12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {job.description || 'No description provided.'}
                    </p>
                    
                    {job.req_skills && job.req_skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {job.req_skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#f3f4f6',
                              color: '#4b5563',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '12px'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.req_skills.length > 3 && (
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#6b7280'
                          }}>
                            +{job.req_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ 
                    padding: '12px 16px',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <button
                      onClick={() => handleEditJob(job)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f3f4f6',
                        color: '#4b5563',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id || job._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobManager;