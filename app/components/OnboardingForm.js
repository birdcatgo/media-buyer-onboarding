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
    commission: "",
    paymentInfo: "",
    paymentDate: "",
    
    // Compliance
    compliance: false,

    // Contractor Agreement
    contractorAgreement: {
      hasRead: false,
      signature: "",
      appendixSignature: "",
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

    // New fields for Loss Tolerance
    lossTolerance: {
      daily: "",
      weekly: "",
      lifetime: ""
    },

    budget: {
      daily: "",
    },

    monthlySalary: "",
  });
  
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false,
    driveLink: null
  });

  const [c2fSignature, setC2fSignature] = useState({
    name: "Nick Torson",
    position: "CEO",
    date: new Date().toISOString().split('T')[0],
    signature: "",
    appendixSignature: ""
  });

  const [signatureStatus, setSignatureStatus] = useState({
    nickSigned: false,
    contractorSigned: false,
    formId: null,
    signatureLink: null
  });

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
    commission: "",
    paymentInfo: "",
    paymentDate: "",
    compliance: false,
    contractorAgreement: {
      hasRead: false,
      signature: "",
      appendixSignature: "",
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
    otherCountry: "",
    lossTolerance: {
      daily: "",
      weekly: "",
      lifetime: ""
    },
    budget: {
      daily: "",
    },
    monthlySalary: "",
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
    return null;
  };

  const generateCompressedPDF = async (element) => {
    try {
      console.log('Starting PDF generation');
      const html2pdf = (await import('html2pdf.js')).default;
      
      const options = {
        margin: 0.5,
        filename: `${formData.name}-media-buyer-onboarding.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true, // Enable logging
          letterRendering: true,
          allowTaint: true,
          foreignObjectRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait',
          compress: true
        }
      };

      console.log('Generating PDF with options:', options);
      
      const pdfBlob = await html2pdf()
        .set(options)
        .from(element)
        .save()
        .output('blob');
      
      console.log('PDF generated successfully');
      return pdfBlob;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      console.log('Starting form submission');
      const element = document.getElementById('onboardingForm');
      
      if (!element) {
        throw new Error('Form element not found');
      }

      const pdfBlob = await generateCompressedPDF(element);
      
      // Convert PDF to base64
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(pdfBlob);
      });

      // Prepare submission data
      const submissionData = {
        name: formData.name,
        email: formData.email,
        pdfData: base64data
      };

      console.log('Submitting form data', {
        name: submissionData.name,
        email: submissionData.email,
        pdfSize: base64data.length
      });

      // Submit form
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit form');
      }

      setStatus({ loading: false, success: true });
    } catch (error) {
      console.error('Submission error:', error);
      setStatus({ 
        loading: false, 
        error: error.message || 'Failed to generate PDF. Please try again.'
      });
    }
  };

  const downloadPDF = async () => {
    try {
      const element = document.getElementById('onboardingForm');
      const pdfBlob = await generateCompressedPDF(element);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.name}-media-buyer-onboarding.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setStatus(prev => ({
        ...prev,
        error: "Failed to download PDF. Please try again."
      }));
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const response = await fetch('/api/saveForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          c2fSignature
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save form');
      }

      setSignatureStatus({
        nickSigned: true,
        contractorSigned: false,
        formId: data.formId,
        signatureLink: data.signatureLink
      });

      setStatus({ loading: false, success: true });
    } catch (error) {
      console.error('Submission error:', error);
      setStatus({ 
        loading: false, 
        error: error.message || 'Failed to save form'
      });
    }
  };

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
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Full Name *</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Email *</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </label>
              </div>
            </div>

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
                      placeholder="e.g. 10%"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loss Tolerance</label>
                  <input
                    type="text"
                    name="lossTolerance.lifetime"
                    placeholder="e.g. Lifetime Total Loss of $2,000"
                    value={formData.lossTolerance.lifetime}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
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
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
                  <div className="markdown-content">
                    <h1>INDEPENDENT CONTRACTOR AGREEMENT</h1>
                    <p>(Media Buyer -- 30-Day Profit Share)</p>

                    <p>This Independent Contractor Agreement ("Agreement") is entered into as of the date of signing below by and between:</p>

                    <p>Company: Convert 2 Freedom LLC ("Company")<br />
                    Contractor: {formData.name || "____________________"} ("Media Buyer")</p>

                    <p>Collectively referred to as the "Parties."</p>

                    <h2>1.0 Scope of Work</h2>
                    <p>The Media Buyer agrees to provide media buying and advertising services for the Company, including but not limited to launching, managing, optimizing, and reporting on advertising campaigns as directed by the Company.</p>

                    <h2>2.0 Term</h2>
                    <p>This Agreement shall commence on the date of signing and shall remain in effect for an initial term of 30 calendar days, unless terminated earlier by either party with written notice.</p>

                    <h2>3.0 Compensation</h2>
                    <p>3.1 For the first 30 days of this Agreement, the Media Buyer shall receive no base salary.</p>
                    <p>3.2 Instead, the Media Buyer shall be compensated with 10% of net profits generated directly from the advertising campaigns they manage.</p>
                    <p>3.3 "Net Profits" is defined as the gross revenue from advertising campaigns managed by the Media Buyer, minus ad spend and direct campaign-related expenses.</p>

                    <h2>4.0 Independent Contractor Status</h2>
                    <p>4.1 The Media Buyer is engaged as an independent contractor. Nothing in this Agreement shall be construed as creating an employer-employee relationship, a partnership, or a joint venture between the Parties.</p>
                    <p>4.2 The Company shall not be responsible for withholding taxes or providing any employee benefits to the Media Buyer.</p>

                    <h2>5.0 Confidentiality</h2>
                    <p>The Media Buyer agrees to maintain the confidentiality of all business strategies, advertising data, intellectual property, and any sensitive information related to the Company and its clients, during and after the term of this Agreement.</p>

                    <h2>6.0 Termination</h2>
                    <p>Either party may terminate this Agreement at any time with written notice. Upon termination, the Media Buyer shall be entitled to any earned compensation as outlined in Section 3, up to the date of termination.</p>

                    <h2>7.0 Post-Term Review</h2>
                    <p>At the conclusion of the 30-day term, the Parties agree to re-evaluate performance and results, and to discuss a potential continuation or restructuring of the working relationship, including any updates to compensation, responsibilities, or terms of engagement.</p>

                    <h2>8.0 Governing Law</h2>
                    <p>This Agreement shall be governed by and interpreted in accordance with the laws of the state/province/country in which the Company is registered.</p>

                    <h2>9.0 Contractor Commitment and Transparency</h2>
                    <p>9.1 The Contractor agrees to a full-time role with the Company. If the Contractor currently engages in part-time work, intends to work part-time elsewhere, or plans to run their own advertising campaigns, they are required to disclose this and discuss it with the Company. Transparency is expected at all times regarding work activities and future intentions. The Company reserves the right to evaluate and determine whether such arrangements conflict with the expectations of a full-time commitment.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Appendix A Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">APPENDIX A: PRICING AND COMPENSATION GUIDELINES</h3>
              
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
                  <div className="markdown-content">
                    <h2>1.0 Definitions</h2>
                    <p>1.1 Contractor Gross Revenue: Revenue received before taxes and deductions as a direct result of Contractor Services.</p>

                    <h2>2.0 Compensation</h2>
                    <p>2.1 Contractor will work 40 hours per week for a flat rate salary of $
                      <input
                        type="text"
                        name="monthlySalary"
                        value={formData.monthlySalary}
                        onChange={handleChange}
                        className="w-20 p-1 border rounded inline-block focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      /> USD monthly.</p>
                    <p>2.2 Contractor will also be paid commission on profit earned by the media buyer according to the following breakdown:</p>
                    <p>$0 -- $100,000 = 15%<br />
                    $100,001 -- $250,000 = 20%<br />
                    $250,001 and above = 30%</p>

                    <h2>3.0 Tax Treatment of Contractor Payment</h2>
                    <p>3.1 The Company shall not be responsible for federal, state, local, or foreign taxes derived from the Contractor's net income or for the withholding and/or payment of any federal, state, local, or foreign income and other payroll taxes, workers' compensation, disability benefits, or other legal requirements applicable to the Contractor.</p>

                    <h2>4.0 Contractor Commitment and Transparency</h2>
                    <p>4.1 The Contractor agrees to a full-time role with the Company. If the Contractor currently engages in part-time work, intends to work part-time elsewhere, or plans to run their own advertising campaigns, they are required to disclose this and discuss it with the Company. Transparency is expected at all times regarding work activities and future intentions. The Company reserves the right to evaluate and determine whether such arrangements conflict with the expectations of a full-time commitment.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Final Signatures Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-red-600 pl-3">Agreement Signatures</h3>
              
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
                  <div className="markdown-content">
                    <p className="text-lg font-semibold mb-6">IN WITNESS WHEREOF, the parties have executed this Agreement as of the date written below.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Company Representative */}
                      <div className="space-y-2">
                        <p className="font-medium">Company Representative:</p>
                        <p className="ml-4">Name: Nick Torson</p>
                        <p className="ml-4">Title: CEO</p>
                        <div className="ml-4">
                          <p>Signature:</p>
                          <input
                            type="text"
                            name="c2fSignature.signature"
                            placeholder="Type your full name"
                            value={c2fSignature.signature}
                            onChange={(e) => setC2fSignature({...c2fSignature, signature: e.target.value})}
                            className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <p className="ml-4">Date: 24/03/2025</p>
                      </div>

                      {/* Media Buyer Signature */}
                      <div className="space-y-2">
                        <p className="font-medium">Media Buyer (Contractor):</p>
                        <p className="ml-4">Name: {formData.name || "____________________"}</p>
                        <p className="ml-4">Title: Freelance Media Buyer</p>
                        <div className="ml-4">
                          <p>Signature:</p>
                          <input
                            type="text"
                            name="contractorAgreement.signature"
                            placeholder="Type your full name"
                            value={formData.contractorAgreement.signature}
                            onChange={handleChange}
                            className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <p className="ml-4">Date: 24/03/2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Buttons Section */}
            <div className="space-y-4">
              {!signatureStatus.nickSigned ? (
                <button
                  type="button"
                  onClick={handleInitialSubmit}
                  disabled={status.loading}
                  className={`w-full p-3 rounded text-white font-medium
                    ${(status.loading)
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 transition-colors'}`}
                >
                  {status.loading ? 'Saving...' : 'Save and Send for Signature'}
                </button>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-green-600">Form saved and sent to contractor for signature</p>
                  <p className="text-sm text-gray-600">Signature link: {signatureStatus.signatureLink}</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 