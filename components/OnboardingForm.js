import { useState } from "react";
import axios from "axios";

export default function OnboardingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    budget: "",
    kpi: "",
    offer: "",
    compliance: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/submit", formData);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-bold mb-4">Media Buyer Onboarding</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="budget"
          placeholder="Budget (e.g. $5000/month)"
          value={formData.budget}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="kpi"
          placeholder="KPI Goals (e.g. $10 CPL)"
          value={formData.kpi}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="offer"
          placeholder="Offer Type (e.g. Insurance, Finance)"
          value={formData.offer}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            name="compliance"
            checked={formData.compliance}
            onChange={handleChange}
            className="mr-2"
          />
          I agree to compliance terms
        </label>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
