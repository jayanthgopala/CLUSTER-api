
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Notification.css';


const Notification = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/cachejobs')
      .then(response => {
        console.log('cachejobs API response:', response.data);
        let jobsArr = response.data;
        if (Array.isArray(jobsArr)) {
          setJobs(jobsArr);
          console.log('jobsArr used:', jobsArr);
        } else if (Array.isArray(response.data.jobs)) {
          setJobs(response.data.jobs);
          console.log('response.data.jobs used:', response.data.jobs);
        } else if (Array.isArray(response.data.data)) {
          setJobs(response.data.data);
          console.log('response.data.data used:', response.data.data);
        } else {
          setJobs([]);
          console.log('No jobs array found in response:', response.data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch jobs');
        setLoading(false);
      });
  }, []);

  return (
    <div className="notification-page">
      <div className="notification-header">
        <div className="left">
          <img src="https://upload.wikimedia.org/wikipedia/en/6/65/B.M.S._Institute_of_Technology_and_Management_logo.png" alt="BMSIT logo" className="bmsit-logo" />
          <div>
            <div className="title">BMSIT PlacementHub</div>
            <div className="subtitle">Notice Board — latest placement and opportunity updates</div>
          </div>
        </div>
        <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
      </div>
      <div className="notice-board-title">Notice Board</div>
      {loading ? (
        <div style={{textAlign: 'center', marginTop: '2rem'}}>Loading jobs...</div>
      ) : error ? (
        <div style={{textAlign: 'center', marginTop: '2rem', color: 'red'}}>{error}</div>
      ) : Array.isArray(jobs) ? (
        jobs.length === 0 ? (
          <div style={{textAlign: 'center', marginTop: '2rem'}}>
            No jobs available at the moment.
          </div>
        ) : (
          <div className="notice-card-grid custom-notice-grid">
            {jobs.map((job, idx) => (
              <div key={idx} className="notice-card custom-notice-card">
                <div className="card-company-section">
                  <img src={job.company?.logo || "https://via.placeholder.com/50"} alt={job.company?.name || "Company"} className="company-logo" />
                  <div>
                    <div className="company-name">{job.company?.name || 'Company'}</div>
                    <div className="job-date">{job.startDate ? new Date(job.startDate).toLocaleDateString() : '14/09/2025'}</div>
                  </div>
                </div>
                <div className="job-title">{job.title || 'Software Engineer'}</div>
                <div className="job-description">{job.description || 'We are looking for an experienced software engineer to join our development team. The ideal candidate will have strong programming skills and experience with modern web technologies.'}</div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{textAlign: 'center', marginTop: '2rem', color: 'red'}}>
          Unexpected response from server. Please contact admin.
        </div>
      )}
    </div>
  );
};

export default Notification;
