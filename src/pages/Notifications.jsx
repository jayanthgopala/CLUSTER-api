import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getNotices, getCacheJobs } from '../services/api';
import './Notification.css';
import './Notifications.css';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('jobOfferings'); // 'notifications', 'jobOfferings'
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch job offerings data (existing functionality)
    fetchJobOfferings();
    
    // Fetch real notification data from API
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    getNotices()
      .then(response => {
        console.log('Notices API response:', response.data);
        let noticesArr = response.data;
        
        if (Array.isArray(noticesArr)) {
          // Transform the data to match our expected notification structure
          const formattedNotifications = noticesArr.map(notice => ({
            id: notice._id || notice.id,
            title: notice.title,
            message: notice.content || notice.message || notice.description,
            date: new Date(notice.createdAt || notice.date),
            type: notice.type || 'event'
          }));
          
          setNotifications(formattedNotifications);
        } else if (Array.isArray(response.data.notices)) {
          const formattedNotifications = response.data.notices.map(notice => ({
            id: notice._id || notice.id,
            title: notice.title,
            message: notice.content || notice.message || notice.description,
            date: new Date(notice.createdAt || notice.date),
            type: notice.type || 'event'
          }));
          
          setNotifications(formattedNotifications);
        } else {
          setNotifications([]);
          console.log('No notices array found in response:', response.data);
        }
      })
      .catch(err => {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      });
  };

  const fetchJobOfferings = () => {
    getCacheJobs()
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
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'event': return '📅';
      case 'reminder': return '⏰';
      case 'workshop': return '👨‍💻';
      case 'result': return '📊';
      default: return '📌';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Re-added for Job Offerings section only
  const formatTimeAgo = (dateInput) => {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (isNaN(diffSecs)) return 'Invalid date';
    
    // Show minutes for posts less than 1 hour old
    if (diffSecs < 30) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    
    // For anything older than 1 hour, show the date
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const renderContent = () => {
    if (loading && activeTab === 'jobOfferings') {
      return <div style={{textAlign: 'center', marginTop: '2rem'}}>Loading content...</div>;
    }

    if (error && activeTab === 'jobOfferings') {
      return <div style={{textAlign: 'center', marginTop: '2rem', color: 'red'}}>{error}</div>;
    }

    switch(activeTab) {
      case 'notifications':
        return (
          <>
            <h2 className="section-title">Recent Notifications</h2>
            {notifications.length === 0 ? (
              <div className="feed-empty">
                <div className="feed-empty-icon">🔔</div>
                <div className="feed-empty-title">No notifications yet</div>
                <div className="feed-empty-message">You'll see notifications here when there's new activity</div>
              </div>
            ) : (
              <div className="feed-container">
                {notifications.map(notification => (
                  <div key={notification.id} className="feed-post">
                    <div className="feed-post-header">
                      <div className="feed-avatar">
                        <div className="feed-notification-icon">{getNotificationIcon(notification.type)}</div>
                      </div>
                      <div className="feed-user-info">
                        <div className="feed-name">BMSIT Placement Cell</div>
                      </div>
                    </div>
                    
                    <div className="feed-post-content">
                      <div className="feed-post-title">{notification.title}</div>
                      <div className="feed-post-text">{notification.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );

      case 'jobOfferings':
        return (
          <>
            <h2 className="section-title">Job Offerings</h2>
            {Array.isArray(jobs) && jobs.length > 0 ? (
              <div className="feed-container">
                {jobs.map((job, idx) => (
                  <div key={idx} className="feed-post">
                    <div className="feed-post-header">
                      <div className="feed-avatar">
                        <img 
                          src={job.company?.logo || "/company-default.png"} 
                          alt={job.company?.name || "Company"} 
                          onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/en/6/65/B.M.S._Institute_of_Technology_and_Management_logo.png"; }} 
                        />
                      </div>
                      <div className="feed-user-info">
                        <div className="feed-name">{job.company?.name || 'Company'}</div>
                      </div>
                      <div className="feed-timestamp">
                        {formatTimeAgo(job.createdAt || job.updatedAt || job.startDate || new Date())}
                      </div>
                    </div>
                    
                    <div className="feed-post-content">
                      <div className="feed-post-title">{job.title || 'Job Position'}</div>
                      <div className="feed-post-text">{job.description || 'No description available'}</div>
                      
                      {job.skills && job.skills.length > 0 && (
                        <div className="feed-tags">
                          {job.skills.map((skill, i) => (
                            <span key={i} className="feed-tag">#{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="feed-empty">
                <div className="feed-empty-icon">🔍</div>
                <div className="feed-empty-title">No job offerings yet</div>
                <div className="feed-empty-message">New opportunities will appear here when they become available</div>
              </div>
            )}
          </>
        );



      default:
        return null;
    }
  };

  return (
    <div className="notification-page">
      <div className="notification-header">
        <div className="left">
          <img src="https://upload.wikimedia.org/wikipedia/en/6/65/B.M.S._Institute_of_Technology_and_Management_logo.png" alt="BMSIT logo" className="bmsit-logo" />
          <div>
            <div className="title">BMSIT PlacementHub</div>
            <div className="subtitle">Stay updated with latest placement opportunities and campus news</div>
          </div>
        </div>
        <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
      </div>
      
      {/* Elegant Tab Switcher */}
      <div className="tab-switcher">
        <div className="tab-slider" style={{ left: activeTab === 'notifications' ? '0' : '50%' }}></div>
        <div 
          className={`tab-item ${activeTab === 'notifications' ? 'active' : ''}`} 
          onClick={() => setActiveTab('notifications')}
        >
          <span className="tab-icon">📢</span>
          <span className="tab-label">Notifications</span>
        </div>
        <div 
          className={`tab-item ${activeTab === 'jobOfferings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('jobOfferings')}
        >
          <span className="tab-icon">🏢</span>
          <span className="tab-label">Job Offerings</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Notifications;