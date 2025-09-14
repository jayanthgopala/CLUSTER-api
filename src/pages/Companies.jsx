import React, { useState, useEffect } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { logError, formatErrorMessage } from "../utils/errorLogger";
// Import styles for company images and logos
import "../components/CompanyStyles.css";
// The imageResizer is imported dynamically in handleFileChange to avoid adding to initial bundle

// Define constants for API URLs
const BACKEND_URL = "https://completeplacementrepo.vercel.app";
const GRAPHQL_URL = "https://completeplacementrepo.vercel.app/graphql";
const API_PREFIX = "/api";

// CONFIRMED BACKEND ROUTES:
// POST /api/companies - upload.single('logo') - createCompany
// PUT /api/companies/:id - upload.single('logo') - updateCompany
// DELETE /api/companies/:id - deleteCompany

// IMPLEMENTATION APPROACH:
// - We use GraphQL for fetching data and text-only updates (no files)
// - We use REST API for file uploads with upload.single('logo')
// - File field MUST be named 'logo' to match backend multer configuration

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    headquarters: "",
    sub_branch_location: "",
    logo: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    
    // Try GraphQL first
    try {
      console.log("Attempting GraphQL query for companies...");
      const query = `
        query {
          companies {
            id
            name
            email
            logo
            description
            headquarters
            sub_branch_location
          }
        }
      `;
      
      const graphqlRes = await axios.post(
        GRAPHQL_URL,
        { query },
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true 
        }
      );
      
      if (graphqlRes.data?.data?.companies) {
        const companiesData = graphqlRes.data.data.companies;
        
        // Process and normalize companies data
        const normalizedCompanies = companiesData.map(company => {
          // Ensure company has an ID property (either _id or id)
          const companyId = company._id || company.id;
          
          // Process logo URL if present
          let logoUrl = company.logo;
          
          // Handle partial Cloudinary URLs
          if (logoUrl && typeof logoUrl === 'string') {
            // If it's a relative URL but we know it should be Cloudinary
            if (logoUrl.startsWith('/') && logoUrl.includes('companies/')) {
              logoUrl = `https://res.cloudinary.com/dazxud35c/image/upload${logoUrl}`;
            }
            
            // If it's a relative path without leading slash
            if (!logoUrl.startsWith('/') && !logoUrl.startsWith('http') && logoUrl.includes('companies/')) {
              logoUrl = `https://res.cloudinary.com/dazxud35c/image/upload/${logoUrl}`;
            }
          }
          
          return {
            ...company,
            id: companyId,
            _id: companyId,
            logo: logoUrl
          };
        });
        
        console.log("GraphQL fetch successful:", normalizedCompanies);
        setCompanies(normalizedCompanies);
        setLoading(false);
        return;
      }
    } catch (graphqlErr) {
      console.warn("GraphQL fetch failed, trying REST API:", graphqlErr);
    }
    
    // If GraphQL fails, try REST API with multiple potential endpoints
    const endpoints = [
      `${BACKEND_URL}${API_PREFIX}/companies`,
      `${BACKEND_URL}/companies`,
      `${BACKEND_URL}/api/companies`,
      `${BACKEND_URL}${API_PREFIX}/company`,
      `${BACKEND_URL}/company`
    ];
    
    console.log("Trying REST API endpoints:", endpoints);
    
    let success = false;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const res = await axios.get(endpoint, { withCredentials: true });
        
        if (res.data) {
          let companiesData;
          
          if (Array.isArray(res.data)) {
            companiesData = res.data;
          } else if (res.data.companies) {
            companiesData = res.data.companies;
          } else if (res.data.data) {
            companiesData = res.data.data;
            
            // Check if the data is wrapped further
            if (Array.isArray(companiesData.companies)) {
              companiesData = companiesData.companies;
            }
          } else {
            companiesData = [];
          }
          
          // Process and normalize companies data
          const normalizedCompanies = companiesData.map(company => {
            // Ensure company has an ID property (either _id or id)
            const companyId = company._id || company.id;
            
            // Process logo URL if present
            let logoUrl = company.logo;
            
            // Handle partial Cloudinary URLs
            if (logoUrl && typeof logoUrl === 'string') {
              // If it's a relative URL but we know it should be Cloudinary
              if (logoUrl.startsWith('/') && logoUrl.includes('companies/')) {
                logoUrl = `https://res.cloudinary.com/dazxud35c/image/upload${logoUrl}`;
              }
              
              // If it's a relative path without leading slash
              if (!logoUrl.startsWith('/') && !logoUrl.startsWith('http') && logoUrl.includes('companies/')) {
                logoUrl = `https://res.cloudinary.com/dazxud35c/image/upload/${logoUrl}`;
              }
            }
            
            return {
              ...company,
              id: companyId,
              _id: companyId,
              logo: logoUrl
            };
          });
          
          console.log(`Successful fetch from ${endpoint}:`, normalizedCompanies);
          setCompanies(normalizedCompanies);
          setError(null);
          success = true;
          break;
        }
      } catch (err) {
        console.error(`Error with endpoint ${endpoint}:`, err);
        // Continue to next endpoint
      }
    }
    
    if (!success) {
      console.error("All endpoints failed");
      setCompanies([]);
      setError("Failed to fetch companies. Please try again later.");
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show processing indicator
    setError("Processing image...");
    
    try {
      // Import the image resizer dynamically to avoid adding to initial bundle
      const { ensureMaxFileSize } = await import("../utils/imageResizer.js");
      
      // Process and resize the image if needed
      const processedFile = await ensureMaxFileSize(file, 2); // Max 2MB
      
      // Update form data to use the file object (not the string URL)
      // This will trigger the REST API upload path in handleSubmit
      setFormData({ ...formData, logo: processedFile });
      setError(null); // Clear the processing message
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(processedFile);
      
      // Show file information
      console.log(`File processed: ${processedFile.name}, ${processedFile.size} bytes, ${processedFile.type}`);
      
      // Alert if file was resized
      if (processedFile.size < file.size) {
        console.log(`Image was automatically resized from ${file.size} to ${processedFile.size} bytes to optimize upload.`);
        setError(`Image was automatically resized to optimize upload. Original: ${Math.round(file.size/1024)}KB, Optimized: ${Math.round(processedFile.size/1024)}KB`);
        
        // Clear message after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error("Error processing image:", err);
      
      // Fallback to original file if processing fails
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };

  const buildFormData = () => {
    const fd = new FormData();
    
    // Add required fields first - matching the fields seen in your Postman request
    fd.append("name", formData.name);
    fd.append("email", formData.email);
    
    // Add optional text fields if they have values
    if (formData.description) fd.append("description", formData.description);
    if (formData.headquarters) fd.append("headquarters", formData.headquarters);
    if (formData.sub_branch_location) fd.append("sub_branch_location", formData.sub_branch_location);
    
    // Add logo file if exists
    // CRITICAL: The field MUST be named 'logo' to match backend multer configuration
    // upload.single('logo') requires this exact field name
    if (formData.logo && formData.logo instanceof File) {
      fd.append("logo", formData.logo); 
      console.log(`Uploading file: ${formData.logo.name}, size: ${formData.logo.size} bytes, type: ${formData.logo.type}`);
    }
    
    // We don't need to include ID in the form data as it's in the URL path
    // We don't need to include existingLogo either - the backend should handle this
    
    // Log complete form data for debugging
    console.log("Form data being sent:");
    for (let [key, value] of fd.entries()) {
      console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes, ${value.type})` : value}`);
    }
    
    return fd;
  };

  // Check if a URL is a valid Cloudinary URL
  const isCloudinaryUrl = (url) => {
    if (typeof url !== 'string') return false;
    return url.includes('cloudinary.com') || 
           url.includes('res.cloudinary.com') || 
           url.includes('.cloudinary.');
  };

  // Simplified handleSubmit that focuses on GraphQL first
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // If we're not uploading a new logo file as a File object, use GraphQL (simpler)
      // GraphQL can't handle file uploads, so we use REST when we have a file to upload
      if (!(formData.logo instanceof File)) {
        console.log("Using GraphQL approach for company operation");
        
        // Prepare variables for GraphQL
        let mutation, variables;
        
        if (formMode === "add") {
          mutation = `
            mutation CreateCompany($name: String!, $email: String!, $description: String, $headquarters: String, $sub_branch_location: String) {
              createCompany(
                name: $name, 
                email: $email, 
                description: $description, 
                headquarters: $headquarters, 
                sub_branch_location: $sub_branch_location
              ) {
                id
                name
                email
              }
            }
          `;
          
          variables = {
            name: formData.name,
            email: formData.email,
            description: formData.description || "",
            headquarters: formData.headquarters || "",
            sub_branch_location: formData.sub_branch_location || ""
          };
        } else {
          // Edit mode
          const id = selectedCompany?._id || selectedCompany?.id;
          if (!id) throw new Error("Company ID is missing for update");
          
          mutation = `
            mutation UpdateCompany(
              $id: ID!, 
              $name: String!, 
              $email: String!, 
              $description: String, 
              $headquarters: String, 
              $sub_branch_location: String
            ) {
              updateCompany(
                id: $id,
                name: $name, 
                email: $email, 
                description: $description, 
                headquarters: $headquarters, 
                sub_branch_location: $sub_branch_location
              ) {
                id
                name
                email
                logo
              }
            }
          `;
          
          // GraphQL doesn't handle file uploads, so don't include logo in variables
          variables = {
            id,
            name: formData.name,
            email: formData.email,
            description: formData.description || "",
            headquarters: formData.headquarters || "",
            sub_branch_location: formData.sub_branch_location || ""
          };
        }
        
        // Execute GraphQL mutation
        const response = await axios.post(
          GRAPHQL_URL,
          { query: mutation, variables },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        
        console.log("GraphQL response:", response.data);
        
        if (response.data.errors) {
          throw new Error(response.data.errors[0]?.message || "GraphQL error");
        }
        
        const operationName = formMode === "add" ? "createCompany" : "updateCompany";
        const result = response.data?.data?.[operationName];
        
        if (result) {
          alert(formMode === "add" ? "Company added successfully!" : "Company updated successfully!");
          resetForm();
          fetchCompanies();
          return;
        } else {
          throw new Error("Unknown GraphQL response format");
        }
      } else {
        // For file uploads, use the confirmed REST API endpoints with multer upload.single('logo')
        console.log("Using REST approach with upload.single('logo')");
        
        const formDataToSend = buildFormData();
        
        // Define the endpoint based on the confirmed backend route
        // router.post("/companies", adminLimiter, upload.single('logo'), createCompany);
        // router.put("/companies/:id", adminLimiter, upload.single('logo'), updateCompany);
        const companyEndpoint = `${BACKEND_URL}${API_PREFIX}/companies`;
        
        console.log(`Using confirmed endpoint: ${companyEndpoint}`);
        
        try {
          let response;
          
          if (formMode === "add") {
            // For adding a new company with image
            // Matches: router.post("/companies", adminLimiter, upload.single('logo'), createCompany);
            console.log("Sending POST with FormData to:", companyEndpoint);
            console.log("Form data contents:");
            for (let [key, value] of formDataToSend.entries()) {
              console.log(`  ${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes, ${value.type})` : value}`);
            }
            
            response = await axios.post(companyEndpoint, formDataToSend, { 
              headers: { 
                "Content-Type": "multipart/form-data"
              },
              withCredentials: true 
            });
          } else {
            // For editing an existing company
            // Matches: router.put("/companies/:id", adminLimiter, upload.single('logo'), updateCompany);
            const id = selectedCompany?._id || selectedCompany?.id;
            const updateEndpoint = `${companyEndpoint}/${id}`;
            
            console.log(`Sending PUT to: ${updateEndpoint}`);
            console.log("Form data contents:");
            for (let [key, value] of formDataToSend.entries()) {
              console.log(`  ${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes, ${value.type})` : value}`);
            }
            
            response = await axios.put(updateEndpoint, formDataToSend, { 
              headers: { 
                "Content-Type": "multipart/form-data"
              },
              withCredentials: true 
            });
          }
          
          console.log("Response:", response);
          
          if (response.status >= 200 && response.status < 300) {
            console.log("Upload successful:", response.data);
            alert(formMode === "add" ? "Company added successfully!" : "Company updated successfully!");
            resetForm();
            fetchCompanies();
            return;
          } else {
            throw new Error(`Request failed with status ${response.status}`);
          }
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          throw new Error("Failed to upload company with logo. Please try without a logo image.");
        }
      }
    } catch (err) {
      // Use enhanced error logging
      logError(err, "handleSubmit");
      
      // Special handling for file upload issues
      if (formData.logo) {
        console.warn("Error occurred with logo upload. Offering to try without logo...");
        
        if (window.confirm("Upload failed. Would you like to try creating the company without a logo? You can add the logo later by editing the company.")) {
          // Remove logo and try again
          const newFormData = {...formData, logo: null};
          setFormData(newFormData);
          setPreviewUrl("");
          
          // Recursive call without logo
          try {
            const submitEvent = { preventDefault: () => {} };
            await handleSubmit(submitEvent);
            return; // If successful, exit this function
          } catch (retryErr) {
            console.error("Failed even without logo:", retryErr);
            // Continue to show original error
          }
        }
      }
      
      // Display user-friendly message
      const userMessage = formatErrorMessage(err);
      alert(userMessage);
      setError(userMessage);
      
      // If it's a 404 error, suggest creating company without logo
      if (err.response?.status === 404) {
        console.warn("The API endpoints for company creation don't seem to exist.");
        console.warn("Try creating a company without uploading a logo.");
        
        if (formData.logo) {
          setError(userMessage + " Please try again without uploading a logo image.");
        }
      }
      
      // If it's a 413 error (payload too large), show specific message
      if (err.response?.status === 413) {
        setError("The logo file is too large. Please use a smaller image (under 2MB) and try again.");
      }
      
      // If it's a 500 error, provide additional guidance
      if (err.response?.status === 500) {
        console.warn("Potential causes of 500 error:");
        console.warn("1. Invalid data format being sent to server");
        console.warn("2. Server-side validation failing");
        console.warn("3. Database constraints being violated");
        console.warn("4. Server misconfiguration");
        
        if (formData.logo) {
          setError(userMessage + " There was a problem processing your logo image. Try again without the logo.");
        }
      }
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    
    // Process logo URL
    let logoUrl = company.logo || "";
    
    // If it's a Cloudinary URL, store it as is
    // Otherwise, set logo to null so we'll upload a new file
    const logoFile = isCloudinaryUrl(logoUrl) || logoUrl.startsWith('http') ? logoUrl : null;
    
    setFormData({
      name: company.name || "",
      email: company.email || "",
      description: company.description || "",
      headquarters: company.headquarters || "",
      sub_branch_location: company.sub_branch_location || "",
      logo: logoFile,
    });
    
    // Always show the preview if we have a URL
    setPreviewUrl(logoUrl);
    
    setFormMode("edit");
    
    console.log("Editing company with logo:", logoUrl);
    console.log("Is Cloudinary URL?", isCloudinaryUrl(logoUrl));
  };

  const handleDelete = async (company) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    
    const id = company._id || company.id;
    if (!id) {
      alert("Error: Company ID not found");
      return;
    }
    
    try {
      // Use GraphQL for deletion
      const mutation = `
        mutation DeleteCompany($id: ID!) {
          deleteCompany(id: $id) {
            id
            name
          }
        }
      `;
      
      const response = await axios.post(
        GRAPHQL_URL,
        { query: mutation, variables: { id } },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      
      console.log("Delete response:", response.data);
      
      if (response.data.errors) {
        throw new Error(response.data.errors[0]?.message || "GraphQL error");
      }
      
      if (response.data?.data?.deleteCompany) {
        alert("Company deleted successfully!");
        fetchCompanies();
      } else {
        throw new Error("Unknown response format");
      }
    } catch (err) {
      logError(err, "handleDelete");
      alert(formatErrorMessage(err) || "Failed to delete company. Please try again later.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      description: "",
      headquarters: "",
      sub_branch_location: "",
      logo: null,
    });
    setPreviewUrl("");
    setSelectedCompany(null);
    setFormMode("add");
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="companies-page">
          <h2>{formMode === "add" ? "Add New Company" : "Edit Company"}</h2>
          {error && <div className="alert alert-error">{error}</div>}

          {/* === Form === */}
          <form onSubmit={handleSubmit} className="company-form">
            <div className="form-row">
              <label htmlFor="name">Company Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Company Name"
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="company@example.com"
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Company description"
                rows={3}
              />
            </div>

            <div className="form-row">
              <label htmlFor="headquarters">Headquarters</label>
              <input
                id="headquarters"
                name="headquarters"
                type="text"
                value={formData.headquarters}
                onChange={handleInputChange}
                placeholder="Headquarters location"
              />
            </div>

            <div className="form-row">
              <label htmlFor="sub_branch_location">Branch Location</label>
              <input
                id="sub_branch_location"
                name="sub_branch_location"
                type="text"
                value={formData.sub_branch_location}
                onChange={handleInputChange}
                placeholder="Sub-branch location"
              />
            </div>

            <div className="form-row">
              <label htmlFor="logo">Company Logo</label>
              <input
                id="logo"
                name="logo"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
              {previewUrl && (
                <div className="logo-preview">
                  <img 
                    src={previewUrl} 
                    alt="Logo preview" 
                    width="100" 
                    style={{ 
                      maxHeight: "100px", 
                      objectFit: "contain",
                      border: "1px solid #ddd", 
                      borderRadius: "4px", 
                      padding: "5px" 
                    }}
                    onError={(e) => {
                      console.error("Preview image failed to load:", previewUrl);
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/100x100?text=Logo";
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn outline small"
                    onClick={() => {
                      setFormData({...formData, logo: null});
                      setPreviewUrl("");
                    }}
                  >
                    Remove Logo
                  </button>
                  {isCloudinaryUrl(previewUrl) && (
                    <div className="cloudinary-info">
                      <small style={{ color: "green" }}>
                        ✓ Using Cloudinary image
                      </small>
                    </div>
                  )}
                </div>
              )}
              <div className="upload-guidelines">
                <p className="hint">
                  <strong>Logo Upload Guidelines:</strong>
                </p>
                <ul className="hint-list">
                  <li>Maximum file size: 2MB</li>
                  <li>Supported formats: PNG, JPG, JPEG</li>
                  <li>Recommended dimensions: 200x200 pixels</li>
                  <li>If upload fails, try creating the company first without a logo, then edit to add the logo</li>
                </ul>
                {formData.logo && (
                  <p className="hint warning">
                    <strong>Note:</strong> If you encounter errors when uploading a logo, try submitting without a logo first, 
                    then edit the company to add the logo.
                  </p>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn primary">
                {formMode === "add" ? "Add Company" : "Update Company"}
              </button>
              {formMode === "edit" && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* === Companies List === */}
          <h2>Companies List</h2>
          {loading ? (
            <div>Loading companies...</div>
          ) : (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Description</th>
                    <th>Headquarters</th>
                    <th>Branch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No companies found</td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr key={company._id || company.id}>
                        <td>
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              width="40"
                              height="40"
                              style={{ objectFit: "contain", borderRadius: "4px" }}
                              onError={(e) => {
                                console.error("Image failed to load:", company.logo);
                                e.target.onerror = null; 
                                e.target.src = "https://via.placeholder.com/40x40?text=Logo";
                              }}
                            />
                          ) : (
                            "No logo"
                          )}
                        </td>
                        <td>{company.name}</td>
                        <td>{company.email}</td>
                        <td>{company.description}</td>
                        <td>{company.headquarters}</td>
                        <td>{company.sub_branch_location}</td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() => handleEdit(company)}
                              className="btn outline small"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(company)}
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
        </div>
      </main>
    </div>
  );
}