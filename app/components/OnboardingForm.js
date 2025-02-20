'use client'
import { useState, useEffect } from "react";
import axios from "axios";

export default function OnboardingForm() {
  const [formData, setFormData] = useState({
    // Personal Info
    name: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    ssn: "",
    form1099: false,
    
    // Onboarding Checklist
    onboardingChecks: {
      addedToSlack: false,
      addedToMonday: false,
      teamIntro: false
    },

    // Budget & Goals
    dailyBudget: "",
    weeklyBudget: "",
    lifetimeBudget: "",
    networks: "",
    targetGeos: [],
    
    // Campaign Details
    verticals: [],
    kpiGoals: "",
    offerRestrictions: "",
    offerCaps: "",
    stopLoss: "",
    
    // Technical Setup
    trackingSoftware: "",
    trackingLinks: "",
    adAccounts: "",
    pixel: "",
    creativesResponsibility: "",
    
    // Communication & Reporting
    communicationPreference: {
      oneOnOne: "",
      teamMeeting: "",
      dailyUpdate: ""
    },
    
    // Financial
    commission: "10%",
    paymentInfo: "",
    paymentDate: "",
    
    // Compliance
    compliance: false,

    // Contractor Agreement
    contractorAgreement: {
      hasRead: false,
      signature: "",
      date: new Date().toISOString().split('T')[0], // Today's date
    },

    // Payment and Banking Details
    paymentDetails: {
      preferredMethod: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      paymentPlatformId: "",
      wiseEmail: "",
      wiseId: "",
      paypalEmail: ""
    },

    // Tax Information
    taxInfo: {
      isUSBased: true,
      ssnOrTin: "", // Already have SSN field, can consolidate
      taxExempt: false,
      w9Attached: false,
      countryOfResidence: "",
      foreignTaxId: "",
      usWithholding: false,
      w8benAttached: false
    },

    // Contract Details
    contractDetails: {
      startDate: new Date().toISOString().split('T')[0], // Today's date as default
      duration: "Ongoing",
      pointOfContact: "",
      preferredWorkingHours: "",
      unavailableTimes: ""
    },

    otherCountry: "",
  });
  
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false,
    driveLink: null
  });

  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    message: null,
    timestamp: null
  });

  const [c2fSignature, setC2fSignature] = useState({
    name: "Nick Torson",
    position: "CEO",
    date: new Date().toISOString().split('T')[0]
  });

  const [drafts, setDrafts] = useState([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);

  const trafficSources = [
    "Facebook",
    "Google",
    "Native",
    "TikTok",
    "Snapchat"
  ];

  const verticalOptions = [
    "Lead Generation - Solar",
    "Lead Generation - Roofing",
    "Lead Generation - Gutters",
    "Lead Generation - Auto",
    "PPC - ACA",
    "PPC - Medicare",
    "PPC - Debt",
    "PPC - Insurance",
    "VSL",
    "Other"
  ];

  const geoOptions = [
    "United States",
    "International"
  ];

  const timeZones = [
    "US/Eastern",
    "US/Central",
    "US/Mountain",
    "US/Pacific",
    "US/Alaska",
    "US/Hawaii"
  ];

  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    ssn: "",
    form1099: false,
    onboardingChecks: {
      addedToSlack: false,
      addedToMonday: false,
      teamIntro: false
    },
    dailyBudget: "",
    weeklyBudget: "",
    lifetimeBudget: "",
    networks: "",
    targetGeos: [],
    verticals: [],
    kpiGoals: "",
    offerRestrictions: "",
    offerCaps: "",
    stopLoss: "",
    trackingSoftware: "",
    trackingLinks: "",
    adAccounts: "",
    pixel: "",
    creativesResponsibility: "",
    communicationPreference: {
      oneOnOne: "",
      teamMeeting: "",
      dailyUpdate: ""
    },
    commission: "10%",
    paymentInfo: "",
    paymentDate: "",
    compliance: false,
    contractorAgreement: {
      hasRead: false,
      signature: "",
      date: new Date().toISOString().split('T')[0],
    },
    paymentDetails: {
      preferredMethod: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      paymentPlatformId: "",
      wiseEmail: "",
      wiseId: "",
      paypalEmail: ""
    },
    taxInfo: {
      isUSBased: true,
      ssnOrTin: "",
      taxExempt: false,
      w9Attached: false,
      countryOfResidence: "",
      foreignTaxId: "",
      usWithholding: false,
      w8benAttached: false
    },
    contractDetails: {
      startDate: new Date().toISOString().split('T')[0],
      duration: "Ongoing",
      pointOfContact: "",
      preferredWorkingHours: "",
      unavailableTimes: ""
    },
    otherCountry: ""
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format";
    if (!formData.compliance) return "You must agree to compliance terms";
    return null;
  };

  const generateCompressedPDF = async (element) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const options = {
      margin: 0.5,
      filename: `${formData.name}-media-buyer-onboarding.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.5 
      },
      html2canvas: { 
        scale: 1,
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true,
        compressPDF: true,
        precision: 16
      }
    };

    const pdfBlob = await html2pdf().set(options).from(element).output('blob');
    return pdfBlob;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    const error = validateForm();
    if (error) {
      setStatus({ loading: false, error, success: false });
      return;
    }

    try {
      await axios.post("/api/submit", formData);

      if (typeof window !== 'undefined') {
        const element = document.getElementById('onboardingForm');
        const pdfBlob = await generateCompressedPDF(element);
        
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64data = reader.result.split(',')[1];
          
          try {
            console.log('Uploading file:', `${formData.name}-media-buyer-onboarding.pdf`);
            
            const response = await axios.post("/api/saveToDrive", {
              fileName: `${formData.name}-media-buyer-onboarding.pdf`,
              fileData: base64data,
              isDraft: false
            }, {
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 30000
            });

            console.log('Upload successful:', response.data);
            
            setStatus({
              loading: false,
              error: null,
              success: true,
              driveLink: response.data.viewLink
            });

            // Reset form after successful submission
            setFormData(initialFormState);
            localStorage.removeItem('formDraft'); // Clear saved draft

          } catch (uploadError) {
            console.error('Upload error details:', uploadError.response?.data || uploadError.message);
            const errorMessage = uploadError.response?.data?.message === 'Google Drive setup incomplete. Please contact support.'
              ? 'System is being configured. Please try again in a few minutes.'
              : uploadError.response?.data?.message || "Failed to upload PDF. Please try again.";
            
            setStatus({
              loading: false,
              error: errorMessage,
              success: false
            });
          }
        };

        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          setStatus({
            loading: false,
            error: "Failed to process PDF. Please try again.",
            success: false
          });
        };

        reader.readAsDataURL(pdfBlob);
      }
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      setStatus({
        loading: false,
        error: error.response?.data?.message || "Failed to submit form. Please try again.",
        success: false
      });
    }
  };

  const saveDraft = async () => {
    setSaveStatus({ loading: true, message: null, timestamp: null });
    try {
      // Create new draft object with timestamp and name
      const newDraft = {
        data: formData,
        timestamp: new Date().toISOString(),
        name: formData.name || 'Unnamed Draft'
      };

      // Get existing drafts and log them
      const existingDraftsStr = localStorage.getItem('formDrafts');
      console.log('Existing drafts string:', existingDraftsStr);
      const existingDrafts = JSON.parse(existingDraftsStr || '[]');
      console.log('Existing drafts parsed:', existingDrafts);

      const updatedDrafts = [...existingDrafts, newDraft];
      console.log('Updated drafts:', updatedDrafts);
      
      // Save to localStorage
      localStorage.setItem('formDrafts', JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);

      if (typeof window !== 'undefined') {
        const element = document.getElementById('onboardingForm');
        const pdfBlob = await generateCompressedPDF(element);
        
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64data = reader.result.split(',')[1];
          
          try {
            const response = await axios.post("/api/saveToDrive", {
              fileName: `DRAFT-${formData.name}-media-buyer-onboarding.pdf`,
              fileData: base64data,
              isDraft: true
            }, {
              timeout: 30000,
              maxContentLength: Infinity,
              maxBodyLength: Infinity
            });

            console.log('Draft saved:', response.data);
            
            setSaveStatus({
              loading: false,
              message: `Draft saved successfully. You now have ${updatedDrafts.length} draft${updatedDrafts.length > 1 ? 's' : ''}.`,
              timestamp: new Date().toLocaleTimeString()
            });
          } catch (uploadError) {
            console.error('Save error:', uploadError.response?.data || uploadError);
            setSaveStatus({
              loading: false,
              message: uploadError.response?.data?.message || 'Failed to save draft. Please try again.',
              timestamp: new Date().toLocaleTimeString()
            });
          }
        };

        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          setSaveStatus({
            loading: false,
            message: 'Failed to process PDF. Please try again.',
            timestamp: new Date().toLocaleTimeString()
          });
        };

        reader.readAsDataURL(pdfBlob);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      setSaveStatus({
        loading: false,
        message: 'Failed to save draft. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const downloadPDF = async () => {
    // Import html2pdf only on client side when needed
    if (typeof window !== 'undefined') {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('onboardingForm');
      const options = {
        margin: 1,
        filename: `${formData.name}-media-buyer-onboarding.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      try {
        const pdfBlob = await html2pdf().set(options).from(element).output('blob');
        const pdfBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(pdfBlob);
        });

        // Save to Google Drive
        const driveResponse = await axios.post("/api/saveToDrive", {
          fileName: `${formData.name}-media-buyer-onboarding.pdf`,
          fileData: pdfBase64.split(',')[1]
        }, {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        setStatus(prev => ({
          ...prev,
          success: true,
          driveLink: driveResponse.data.viewLink
        }));

      } catch (error) {
        console.error('Failed to generate PDF:', error);
        setStatus(prev => ({
          ...prev,
          error: "Failed to generate PDF. Please try again."
        }));
      }
    }
  };

  const deleteDraft = (index) => {
    const updatedDrafts = drafts.filter((_, i) => i !== index);
    localStorage.setItem('formDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  };

  const DraftsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Saved Drafts</h3>
          <button
            onClick={() => setShowDraftsModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {drafts.length === 0 ? (
          <p className="text-gray-500">No saved drafts</p>
        ) : (
          <div className="space-y-2">
            {drafts.map((draft, index) => (
              <div key={index} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{draft.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(draft.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData(draft.data);
                      setShowDraftsModal(false);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteDraft(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    // Load all drafts from localStorage
    const savedDrafts = localStorage.getItem('formDrafts');
    console.log('Loading drafts:', savedDrafts);
    if (savedDrafts) {
      const parsedDrafts = JSON.parse(savedDrafts);
      console.log('Parsed drafts:', parsedDrafts);
      setDrafts(parsedDrafts);
      setSaveStatus({
        loading: false,
        message: `You have ${parsedDrafts.length} saved draft${parsedDrafts.length > 1 ? 's' : ''}`,
        timestamp: null
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
      {/* Add decorative elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full rotate-12">
          <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full -rotate-12">
          <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl rounded-xl border border-gray-200/20">
        {/* Branded Header */}
        <div className="bg-gradient-to-r from-black to-gray-900 p-6 rounded-t-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 transform rotate-45 translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <img 
                src="/c2f-logo.png" 
                alt="Convert 2 Freedom" 
                className="h-12 mb-2 drop-shadow-lg"
              />
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Media Buyer Onboarding
              </h1>
              <p className="text-gray-300 mt-1 text-shadow">
                Complete this form to formalize your partnership with Convert 2 Freedom.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center gap-4">
              {/* Manage Drafts Button */}
              <button
                type="button"
                onClick={() => setShowDraftsModal(true)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Manage Drafts ({drafts.length})</span>
              </button>

              {saveStatus.message && (
                <span className="text-sm text-gray-600">
                  {saveStatus.message} {saveStatus.timestamp && `at ${saveStatus.timestamp}`}
                </span>
              )}
              <button
                type="button"
                onClick={saveDraft}
                disabled={saveStatus.loading}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {saveStatus.loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                    </svg>
                    <span>Save Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {status.success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded flex justify-between items-center">
              <span>Form submitted successfully! Your PDF is being generated...</span>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF Again</span>
              </button>
            </div>
          )}
          
          {status.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {status.error}
            </div>
          )}

          <form id="onboardingForm" onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(555) 555-5555"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {formData.country === "Other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specify Country *</label>
                    <input
                      type="text"
                      name="otherCountry"
                      placeholder="Enter your country"
                      value={formData.otherCountry}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}

                {formData.country === "United States" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number *</label>
                      <input
                        type="password"
                        name="ssn"
                        placeholder="XXX-XX-XXXX"
                        value={formData.ssn}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="form1099"
                          checked={formData.form1099}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Form 1099-NEC Received</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Payment and Banking Details */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">Payment and Banking Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage</label>
                    <input
                      type="text"
                      name="commission"
                      placeholder="e.g. 20%"
                      value={formData.commission}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                    <input
                      type="text"
                      name="paymentDate"
                      placeholder="e.g. Net 30, 15th of month"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Payment Method *</label>
                  <select
                    name="paymentDetails.preferredMethod"
                    value={formData.paymentDetails.preferredMethod}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Payment Method</option>
                    <option value="wise">Wise</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                {formData.paymentDetails.preferredMethod === 'wise' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wise Email *</label>
                      <input
                        type="email"
                        name="paymentDetails.wiseEmail"
                        placeholder="Email associated with Wise account"
                        value={formData.paymentDetails.wiseEmail || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wise Account ID</label>
                      <input
                        type="text"
                        name="paymentDetails.wiseId"
                        placeholder="Your Wise Account ID (if known)"
                        value={formData.paymentDetails.wiseId || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {formData.paymentDetails.preferredMethod === 'bank' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                      <input
                        type="text"
                        name="paymentDetails.bankName"
                        placeholder="Your bank name"
                        value={formData.paymentDetails.bankName || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                      <input
                        type="text"
                        name="paymentDetails.accountName"
                        placeholder="Name on bank account"
                        value={formData.paymentDetails.accountName || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                      <input
                        type="text"
                        name="paymentDetails.accountNumber"
                        placeholder="Your account number"
                        value={formData.paymentDetails.accountNumber || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number *</label>
                      <input
                        type="text"
                        name="paymentDetails.routingNumber"
                        placeholder="Your routing number"
                        value={formData.paymentDetails.routingNumber || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT/BIC Code</label>
                      <input
                        type="text"
                        name="paymentDetails.swiftCode"
                        placeholder="For international transfers"
                        value={formData.paymentDetails.swiftCode || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {formData.paymentDetails.preferredMethod === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email *</label>
                    <input
                      type="email"
                      name="paymentDetails.paypalEmail"
                      placeholder="Email associated with PayPal account"
                      value={formData.paymentDetails.paypalEmail || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Contract Details */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">Contract Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="contractDetails.startDate"
                    value={formData.contractDetails.startDate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Point of Contact *</label>
                  <input
                    type="text"
                    name="contractDetails.pointOfContact"
                    placeholder="e.g. Dan Mattson"
                    value={formData.contractDetails.pointOfContact}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Working Hours</label>
                  <textarea
                    name="contractDetails.preferredWorkingHours"
                    placeholder="Specify your preferred working hours"
                    value={formData.contractDetails.preferredWorkingHours}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unavailable Times</label>
                  <textarea
                    name="contractDetails.unavailableTimes"
                    placeholder="Specify any days or times you're unavailable"
                    value={formData.contractDetails.unavailableTimes}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                  />
                </div>
              </div>
            </section>

            {/* Communication Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">Communication</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">One-on-One Meetings</label>
                  <input
                    type="text"
                    name="communicationPreference.oneOnOne"
                    placeholder="e.g., Every Monday at 2:00 PM EST"
                    value={formData.communicationPreference.oneOnOne || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Meetings</label>
                  <input
                    type="text"
                    name="communicationPreference.teamMeeting"
                    placeholder="e.g., Every Wednesday at 10:00 AM EST"
                    value={formData.communicationPreference.teamMeeting || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Updates</label>
                  <input
                    type="text"
                    name="communicationPreference.dailyUpdate"
                    placeholder="e.g., Monday-Friday by 9:00 AM EST"
                    value={formData.communicationPreference.dailyUpdate || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Onboarding Status</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="onboardingChecks.addedToSlack"
                        checked={formData.onboardingChecks.addedToSlack}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Added to Slack</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="onboardingChecks.addedToMonday"
                        checked={formData.onboardingChecks.addedToMonday}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Added to Monday</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="onboardingChecks.teamIntro"
                        checked={formData.onboardingChecks.teamIntro}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Introduced to Team</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Offer Details Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">Offer Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Networks *</label>
                  <input
                    type="text"
                    name="networks"
                    placeholder="e.g. MaxBounty, A4D"
                    value={formData.networks}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Sources *</label>
                  <input
                    type="text"
                    name="trafficSources"
                    placeholder="e.g. Facebook, Google Ads"
                    value={formData.trafficSources}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verticals/Offers *</label>
                  <input
                    type="text"
                    name="verticals"
                    placeholder="e.g. Solar Leads, Medicare"
                    value={formData.verticals}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KPI Goals *</label>
                  <input
                    type="text"
                    name="kpiGoals"
                    placeholder="e.g. $50 CPL, 200% ROI"
                    value={formData.kpiGoals}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget</label>
                  <input
                    type="text"
                    name="dailyBudget"
                    placeholder="e.g. $500/day"
                    value={formData.dailyBudget}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Budget</label>
                  <input
                    type="text"
                    name="weeklyBudget"
                    placeholder="e.g. $3500/week"
                    value={formData.weeklyBudget}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lifetime Budget</label>
                  <input
                    type="text"
                    name="lifetimeBudget"
                    placeholder="e.g. $50000"
                    value={formData.lifetimeBudget}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Restrictions</label>
                  <input
                    type="text"
                    name="offerRestrictions"
                    placeholder="e.g. Mon-Fri 9am-5pm EST only"
                    value={formData.offerRestrictions}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Caps</label>
                  <input
                    type="text"
                    name="offerCaps"
                    placeholder="e.g. 100 leads/day"
                    value={formData.offerCaps}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Technical Setup Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">Technical Setup</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Links</label>
                  <input
                    type="text"
                    name="trackingLinks"
                    placeholder="Your tracking link details"
                    value={formData.trackingLinks}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Accounts</label>
                  <input
                    type="text"
                    name="adAccounts"
                    placeholder="Your ad account details"
                    value={formData.adAccounts}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pixel Information</label>
                  <input
                    type="text"
                    name="pixel"
                    placeholder="Your pixel details"
                    value={formData.pixel}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Creatives Responsibility</label>
                  <input
                    type="text"
                    name="creativesResponsibility"
                    placeholder="e.g. Media Buyer, Advertiser"
                    value={formData.creativesResponsibility}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Contractor Agreement Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">MEDIA BUYER CONTRACTOR AGREEMENT</h3>
              
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg h-96 overflow-y-auto mb-4 border">
                  <p className="font-semibold">Effective Date: Immediately</p>
                  
                  {formData.name && (
                    <p className="font-medium mb-4">Contractor Name: {formData.name}</p>
                  )}

                  <p className="mb-4"><strong>Introduction</strong><br />
                  This Code of Conduct sets forth the professional standards, ethical guidelines, and business practices expected from all media buyers contracted by Convert 2 Freedom LLC. As key players in our lead generation business, media buyers are expected to adhere to these standards to maintain the integrity and reputation of our company and to ensure optimal performance and compliance in all lead generation activities.</p>

                  <h4 className="font-semibold mt-4">1. Professional Integrity</h4>
                  <p>1.1 Accuracy and Transparency: Media buyers must ensure that all data related to lead generation, including the quality, source, and targeting criteria, are accurate and transparent. Any misrepresentation of leads or traffic sources is strictly prohibited.</p>
                  <p>1.2 Lead Quality: Contractors must focus on acquiring high-quality leads that meet the predefined criteria set by the company. Misleading or deceptive practices to generate leads are not tolerated.</p>

                  <h4 className="font-semibold mt-4">2. Compliance with Laws and Regulations</h4>
                  <p>2.1 Adherence to Lead Generation Standards: All lead generation activities must comply with relevant laws, regulations, and industry standards, including, but not limited to, CAN-SPAM, TCPA, GDPR, and CCPA, depending on the location and nature of the leads generated.</p>
                  <p>2.2 Prohibited Practices: The use of clickbait, misleading advertisements, or false claims to generate leads is strictly prohibited. Contractors must not use any illegal or unethical tactics that could harm the reputation of the company or its clients.</p>

                  <h4 className="font-semibold mt-4">3. Confidentiality</h4>
                  <p>3.1 Protection of Confidential Information: Contractors must keep all information regarding lead generation strategies, sources, pricing, creatives and client information confidential.</p>
                  <p>3.2 Non-Disclosure: Contractors are prohibited from sharing any confidential or proprietary information related to lead generation activities with third parties without the express written consent of the company.</p>

                  <h4 className="font-semibold mt-4">4. Ethical Conduct</h4>
                  <p>4.1 Transparency in Traffic Sources: Contractors are required to disclose all asset sources used for lead generation and ensure they comply with the company's approved methods and quality standards. Media buyers are responsible for ensuring that the Convert2Freedom Management Team is fully informed of all creatives used to drive traffic. Any use of grey or black hat tactics must be discussed with Management prior to implementation.</p>
                  <p>4.2 Avoiding Conflicts of Interest: Contractors must avoid any activities that could result in a conflict of interest with the company or its associated networks. Any potential conflicts must be disclosed to the company immediately. For example, directing traffic to networks or offers affiliated with Convert2Freedom LLC for personal gain, without prior written notification to Nick Torson or Dan Mattson, would be considered a conflict of interest.</p>

                  <h4 className="font-semibold mt-4">5. Use of Company Resources</h4>
                  <p>5.1 Appropriate Use: Contractors are expected to use company-provided tools, platforms, and resources solely for the purposes of fulfilling their contractual obligations related to lead generation.</p>
                  <p>5.2 Data Security: Contractors must take appropriate measures to safeguard all data and digital resources provided by the company, including using secure networks, maintaining confidentiality, and following data protection best practices.</p>

                  <h4 className="font-semibold mt-4">6. Lead Quality and Compliance</h4>
                  <p>6.1 Quality Assurance: Contractors must ensure that all leads generated meet the quality standards and criteria specified by the company. Leads should be genuine, verifiable, and relevant to the specified target audience.</p>
                  <p>6.2 Compliance with Lead Requirements: Contractors must adhere to all requirements regarding lead generation practices, including consent for communication, data protection regulations, and any other legal obligations related to the generation and sale of leads.</p>

                  <h4 className="font-semibold mt-4">7. Communication and Collaboration</h4>
                  <p>7.1 Professional Communication: Contractors must maintain clear, professional, and timely communication with company representatives and network partners regarding lead generation activities, performance metrics, and any issues that arise.</p>
                  <p>7.2 Responsiveness: Contractors are expected to promptly respond to all communications and inquiries from the company and networks, particularly those related to lead quality, campaign performance, and compliance matters.</p>
                  <p>7.3 Meeting Attendance: Contractors are required to attend all scheduled Media Buyer Calls and participate in at least one one-on-one call with management each week, unless an alternative arrangement has been agreed upon in advance.</p>
                  <p>7.4 End of Day Reporting: Contractors must submit an End of Day Report (template provided on Monday.com) that includes ad revenue, ad spend, and profit for each ad account they manage. This report must be submitted by 6am PST the following day. Accuracy is essential, as it directly impacts commission payouts.</p>
                  <p>7.5 Daily Updates: Contractors are required to post their plan for the upcoming day in the daily-updates Slack channel. This update should include a review of the current day's performance and a detailed plan for the following day. It must be submitted before midnight each day.</p>
                  <p>7.6 Commitment: If a contractor is assigned resources such as ad accounts, pixels, creatives, or offers, these must be activated within 24 hours. If activation is not possible, the contractor must communicate a plan to the Convert2Freedom Management Team.</p>

                  <h4 className="font-semibold mt-4">8. Compliance and Reporting</h4>
                  <p>8.1 Compliance with Company Policies: Contractors must adhere to all company policies, including this Code of Conduct, and report any violations or unethical behavior they observe.</p>
                  <p>8.2 Reporting Misconduct: Contractors should promptly report any breaches of this Code of Conduct, suspicious activity, or unethical behavior to their designated company contact.</p>

                  <h4 className="font-semibold mt-4">9. Consequences of Non-Compliance</h4>
                  <p>Violations of this Code of Conduct may result in disciplinary action, including termination of the contractor's agreement, legal action, or other appropriate measures as deemed necessary by the company.</p>

                  <h4 className="font-semibold mt-4">10. Non-Compete Clause</h4>
                  <p>10.1 Non-Compete Agreement: Contractors agree that during the term of their engagement with Convert2Freedom LLC and for a period of 12 months following the termination or conclusion of their contract, they will not directly or indirectly engage in any business or provide services that compete with the lead generation activities or related services offered by Convert2Freedom LLC. This includes, but is not limited to, generating leads for companies, networks or affiliates that have a relationship with or are in direct competition with Convert2Freedom LLC.</p>
                  <p>10.2 Scope of Non-Compete: The non-compete agreement applies to all geographical areas where Convert2Freedom LLC operates or conducts business. Contractors are prohibited from using any knowledge, strategies, or contacts acquired during their time with Convert2Freedom LLC to benefit a competitor.</p>
                  <p>10.3 Non-Solicitation: Contractors agree not to solicit or attempt to solicit, directly or indirectly, any clients, partners, networks, affiliates or employees of Convert2Freedom LLC for the purpose of diverting business or talent away from the company.</p>
                  <p>10.4 Breach of Non-Compete: Any violation of this non-compete clause will result in legal action and may include, but is not limited to, financial damages, injunctive relief, and termination of any outstanding agreements with the contractor.</p>

                  <h4 className="font-semibold mt-4">11. Acknowledgment</h4>
                  <p>All contractors must acknowledge that they have read, understood, and agree to abide by this Code of Conduct. Contractors are encouraged to seek clarification on any aspect of this code if needed.</p>

                  <div className="mt-6">
                    <p className="font-semibold">Contractor Acknowledgment:</p>
                    <p>I, <span className="font-medium underline">{formData.name || "_________________________________"}</span>, have read and understood the Media Buyer Code of Conduct for Contractors, and I agree to comply with all the guidelines, policies, and standards outlined herein.</p>
                  </div>

                  <div className="mt-8 border-t pt-4">
                    <p className="font-semibold mb-4">Convert 2 Freedom LLC Representative:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={c2fSignature.name}
                          className="w-full p-2 border rounded bg-gray-50"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={c2fSignature.position}
                          className="w-full p-2 border rounded bg-gray-50"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={c2fSignature.date}
                          className="w-full p-2 border rounded bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="contractorAgreement.hasRead"
                    checked={formData.contractorAgreement.hasRead}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I have read and understood the Media Buyer Code of Conduct for Contractors *
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="compliance"
                    checked={formData.compliance}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I agree to comply with all network advertising policies and regulations *
                  </span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature *</label>
                    <input
                      type="text"
                      name="contractorAgreement.signature"
                      placeholder="Type your full name"
                      value={formData.contractorAgreement.signature}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="contractorAgreement.date"
                      value={formData.contractorAgreement.date}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status.loading || !formData.contractorAgreement.hasRead}
              className={`w-full p-3 rounded text-white font-medium
                ${(status.loading || !formData.contractorAgreement.hasRead)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 transition-colors'}`}
            >
              {status.loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>

          {showDraftsModal && <DraftsModal />}
        </div>
      </div>
    </div>
  );
} 