import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const CTA = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    parent_name: '',
    date_of_birth: '',
    age: '',
    school_name: '',
    standard: '',
    contact_number: '',
    email: '',
    whatsapp_number: '',
    whatsapp_consent: false,
    inquiry_for: 'Junior',
    source_of_inquiry: 'Website',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (e) => {
    const dob = e.target.value;
    setFormData(prev => ({
      ...prev,
      date_of_birth: dob,
      age: calculateAge(dob),
    }));
  };

  const validateForm = () => {
    if (!formData.student_name.trim()) return 'Student name is required';
    if (!formData.parent_name.trim()) return 'Parent name is required';
    if (!formData.contact_number.trim()) return 'Contact number is required';
    if (!/^\d{10}$/.test(formData.contact_number.replace(/\D/g, ''))) return 'Contact number must be 10 digits';
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email address';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: supabaseError } = await supabase
        .from('inquiries')
        .insert([{
          student_name: formData.student_name.trim(),
          parent_name: formData.parent_name.trim(),
          date_of_birth: formData.date_of_birth || null,
          age: formData.age ? parseInt(formData.age) : null,
          school_name: formData.school_name.trim() || null,
          standard: formData.standard.trim() || null,
          contact_number: formData.contact_number.trim(),
          email: formData.email.trim() || null,
          whatsapp_number: formData.whatsapp_number.trim() || null,
          whatsapp_consent: formData.whatsapp_consent,
          inquiry_for: formData.inquiry_for,
          source_of_inquiry: formData.source_of_inquiry,
          message: formData.message.trim() || null,
          status: 'new',
        }]);

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      // Reset form
      setFormData({
        student_name: '',
        parent_name: '',
        date_of_birth: '',
        age: '',
        school_name: '',
        standard: '',
        contact_number: '',
        email: '',
        whatsapp_number: '',
        whatsapp_consent: false,
        inquiry_for: 'Junior',
        source_of_inquiry: 'Website',
        message: '',
      });
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Failed to submit inquiry. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#FFF6F2] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#E2592D]" />
            <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">Start Your Journey</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-3">
            Ready to Unlock Your Child's Potential?
          </h2>
          <p className="text-[#555555] max-w-2xl mx-auto">
            Fill out the form below and our team will get back to you within 24 hours to schedule a free demo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-[#E5E5E5]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">
                Student Name <span className="text-[#E2592D]">*</span>
              </label>
              <input
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                required
              />
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">
                Parent Name <span className="text-[#E2592D]">*</span>
              </label>
              <input
                type="text"
                name="parent_name"
                value={formData.parent_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleDateChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
              />
            </div>

            {/* Age (auto-calculated) */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                readOnly
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">School Name</label>
              <input
                type="text"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
              />
            </div>

            {/* Standard */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Standard/Class</label>
              <input
                type="text"
                name="standard"
                value={formData.standard}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">
                Contact Number <span className="text-[#E2592D]">*</span>
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">WhatsApp Number</label>
              <input
                type="tel"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
              />
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="whatsapp_consent"
                  checked={formData.whatsapp_consent}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#E2592D] rounded focus:ring-[#E2592D]"
                />
                <span className="text-sm text-[#555555]">
                  I consent to receive WhatsApp messages from BrainCity regarding my inquiry.
                </span>
              </label>
            </div>

            {/* Inquiry For */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Interested In</label>
              <select
                name="inquiry_for"
                value={formData.inquiry_for}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
              >
                <option value="Junior">Junior Level (Ages 4-8)</option>
                <option value="Senior">Senior Level (Ages 9-14)</option>
                <option value="Teacher Training">Teacher Training Program</option>
              </select>
            </div>

            {/* Source of Inquiry */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">How did you hear about us?</label>
              <select
                name="source_of_inquiry"
                value={formData.source_of_inquiry}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
              >
                <option value="Website">Website</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Message (Optional)</label>
              <textarea
                name="message"
                rows="3"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                placeholder="Any specific questions or requirements?"
              ></textarea>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span className="text-sm">Thank you! We'll get back to you shortly.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Inquiry
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CTA;