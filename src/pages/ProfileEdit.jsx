import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, User, School, Users, MapPin, Save } from 'lucide-react';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [parents, setParents] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Form state
  const [formData, setFormData] = useState({
    // Student fields
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    age: '',
    // School fields
    school_name: '',
    standard: '',
    // Parents fields
    father_name: '',
    father_mobile: '',
    mother_name: '',
    mother_mobile: '',
    // Address fields
    address_line: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);

        // Fetch student record
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (studentError) throw studentError;
        setStudent(studentData);

        if (studentData) {
          // Pre‑fill student fields
          setFormData(prev => ({
            ...prev,
            first_name: studentData.first_name || '',
            last_name: studentData.last_name || '',
            gender: studentData.gender || '',
            date_of_birth: studentData.date_of_birth || '',
            age: studentData.age || '',
          }));

          // Fetch school details
          const { data: schoolData, error: schoolError } = await supabase
            .from('student_school_details')
            .select('*')
            .eq('student_id', studentData.id)
            .maybeSingle();
          if (!schoolError && schoolData) {
            setSchoolDetails(schoolData);
            setFormData(prev => ({
              ...prev,
              school_name: schoolData.school_name || '',
              standard: schoolData.standard || '',
            }));
          }

          // Fetch parents details
          const { data: parentsData, error: parentsError } = await supabase
            .from('student_parents')
            .select('*')
            .eq('student_id', studentData.id)
            .maybeSingle();
          if (!parentsError && parentsData) {
            setParents(parentsData);
            setFormData(prev => ({
              ...prev,
              father_name: parentsData.father_name || '',
              father_mobile: parentsData.father_mobile || '',
              mother_name: parentsData.mother_name || '',
              mother_mobile: parentsData.mother_mobile || '',
            }));
          }

          // Fetch address
          const { data: addressData, error: addressError } = await supabase
            .from('student_addresses')
            .select('*')
            .eq('student_id', studentData.id)
            .maybeSingle();
          if (!addressError && addressData) {
            setAddress(addressData);
            setFormData(prev => ({
              ...prev,
              address_line: addressData.address_line || '',
              city: addressData.city || '',
              state: addressData.state || '',
              country: addressData.country || '',
              pincode: addressData.pincode || '',
            }));
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data. Please refresh.');
        showToast('Failed to load profile data. Please refresh.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Auto‑calculate age from date of birth
    if (name === 'date_of_birth') {
      const dob = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let studentId = student?.id;

      // If student record doesn't exist, create it first
      if (!studentId) {
        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert({
            user_id: user.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            gender: formData.gender,
            date_of_birth: formData.date_of_birth || null,
            age: formData.age ? parseInt(formData.age) : null,
          })
          .select()
          .single();
        if (insertError) throw insertError;
        studentId = newStudent.id;
        setStudent(newStudent);
      } else {
        // Update existing student
        const { error: updateError } = await supabase
          .from('students')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            gender: formData.gender,
            date_of_birth: formData.date_of_birth || null,
            age: formData.age ? parseInt(formData.age) : null,
          })
          .eq('id', studentId);
        if (updateError) throw updateError;
      }

      // Upsert school details
      const { error: schoolError } = await supabase
        .from('student_school_details')
        .upsert({
          student_id: studentId,
          school_name: formData.school_name || null,
          standard: formData.standard || null,
        }, { onConflict: 'student_id' });
      if (schoolError) throw schoolError;

      // Upsert parents details
      const { error: parentsError } = await supabase
        .from('student_parents')
        .upsert({
          student_id: studentId,
          father_name: formData.father_name || null,
          father_mobile: formData.father_mobile || null,
          mother_name: formData.mother_name || null,
          mother_mobile: formData.mother_mobile || null,
        }, { onConflict: 'student_id' });
      if (parentsError) throw parentsError;

      // Upsert address
      const { error: addressError } = await supabase
        .from('student_addresses')
        .upsert({
          student_id: studentId,
          address_line: formData.address_line || null,
          city: formData.city || null,
          state: formData.state || null,
          country: formData.country || null,
          pincode: formData.pincode || null,
        }, { onConflict: 'student_id' });
      if (addressError) throw addressError;

      setSuccess('Profile updated successfully!');
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save profile. Please check your inputs and try again.');
      showToast('Failed to save profile. Please check your inputs and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F2]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <Loader2 className="w-8 h-8 text-[#E2592D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF6F2] py-8 px-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } transition-all duration-300 animate-in slide-in-from-top-2`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#E5E5E5]">
          <h1 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
            <User className="w-6 h-6 text-[#E2592D]" />
            Complete Your Profile
          </h1>
          <p className="text-[#555555] mt-1">
            Please fill in your details to personalize your learning experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Details */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E5E5]">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#E2592D]" />
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
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
            </div>
          </div>

          {/* School Details */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E5E5]">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-[#E2592D]" />
              School Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">School Name</label>
                <input
                  type="text"
                  name="school_name"
                  value={formData.school_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Standard / Class</label>
                <input
                  type="text"
                  name="standard"
                  value={formData.standard}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Parents Details */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E5E5]">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E2592D]" />
              Parent / Guardian Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Father's Name</label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Father's Mobile</label>
                <input
                  type="tel"
                  name="father_mobile"
                  value={formData.father_mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Mother's Name</label>
                <input
                  type="text"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Mother's Mobile</label>
                <input
                  type="tel"
                  name="mother_mobile"
                  value={formData.mother_mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E5E5]">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E2592D]" />
              Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Address Line</label>
                <textarea
                  name="address_line"
                  rows="2"
                  value={formData.address_line}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error/Success messages (fallback) */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 