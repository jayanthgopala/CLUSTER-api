/**
 * Utility functions for error logging and diagnosis
 */

/**
 * Enhanced console logging with timestamp and error details
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 */
export const logError = (error, context) => {
  const timestamp = new Date().toISOString();
  console.group(`🔴 Error in ${context} at ${timestamp}`);
  
  console.error('Error message:', error.message);
  
  // Log axios specific details if available
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
    
    // Safely log response data
    try {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } catch (e) {
      console.error('Response data: [Unable to stringify]', error.response.data);
    }
    
    // Log request info that caused the error
    if (error.config) {
      console.log('Request URL:', error.config.url);
      console.log('Request method:', error.config.method);
      console.log('Request headers:', error.config.headers);
      
      // Log request data safely
      if (error.config.data) {
        if (error.config.data instanceof FormData) {
          console.log('Request data (FormData):');
          for (let [key, value] of error.config.data.entries()) {
            console.log(`  ${key}: ${value instanceof File ? `[File: ${value.name}]` : value}`);
          }
        } else {
          try {
            console.log('Request data:', JSON.stringify(JSON.parse(error.config.data), null, 2));
          } catch (e) {
            console.log('Request data:', error.config.data);
          }
        }
      }
    }
  } else if (error.request) {
    console.error('No response received. Request details:', error.request);
  }
  
  console.error('Stack trace:', error.stack);
  console.groupEnd();
  
  // Return error info for use in UI
  return {
    message: error.message,
    statusCode: error.response?.status,
    timestamp
  };
};

/**
 * Formats errors for user-friendly display
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error) => {
  // Log detailed error for debugging
  logError(error, 'formatErrorMessage');
  
  // Server error messages often in different formats
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle common error message formats
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].message || 'Server validation error';
    }
  }
  
  // Handle status-specific messages
  if (error.response?.status === 500) {
    return 'The server encountered an internal error. Please try again later.';
  }
  if (error.response?.status === 400) {
    return 'Invalid data submitted. Please check your entries and try again.';
  }
  if (error.response?.status === 413) {
    return 'The file you are uploading is too large. Please use a smaller file.';
  }
  if (error.response?.status === 401) {
    return 'You need to be logged in to perform this action.';
  }
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  // Network errors
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // Default message
  return error.message || 'An unexpected error occurred';
};