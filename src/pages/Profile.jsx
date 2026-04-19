// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  Loader2, User, Mail, Phone, Calendar, MapPin, School,
  Camera, Save, Award, Star, TrendingUp, AlertCircle, CheckCircle,
  Bell, Lock, Eye, EyeOff
} from 'lucide-react';
import { sendNotification, NotificationTemplates } from '../utils/notifications';

const Profile = () => {
  const { user, userDetails, studentData } = useAuth();
  const [localStudentData, setLocalStudentData] = useState(studentData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfileStats, setUserProfileStats] = useState(null);
  const [formData, setFormData] = useState({
    child_name: '',
    parent_name: '',
    date_of_birth: '',
    age: '',
    contact_no: '',
    email: '',
    standard: '',
    school_name: '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    area: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef(null);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Sync local state with context studentData
  useEffect(() => {
    if (studentData) {
      setLocalStudentData(studentData);
      setFormData({
        child_name: studentData.child_name || '',
        parent_name: studentData.parent_name || '',
        date_of_birth: studentData.date_of_birth || '',
        age: studentData.age?.toString() || '',
        contact_no: studentData.contact_no || '',
        email: studentData.email || user?.email || '',
        standard: studentData.standard || '',
        school_name: studentData.school_name || '',
        address_line1: studentData.address_line1 || '',
        address_line2: studentData.address_line2 || '',
        landmark: studentData.landmark || '',
        area: studentData.area || '',
        city: studentData.city || '',
        district: studentData.district || '',
        state: studentData.state || '',
        pincode: studentData.pincode || '',
      });
      setImagePreview(studentData.image_url || null);
    }
  }, [studentData, user]);

  useEffect(() => {
    if (userDetails?.id) {
      fetchUserProfileStats();
    }
  }, [userDetails]);

  const fetchUserProfileStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('total_points, stars, level, last_active')
        .eq('user_id', userDetails.id)
        .maybeSingle();
      if (!error && data) {
        setUserProfileStats(data);
      }
    } catch (err) {
      console.error('Error fetching profile stats:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'date_of_birth' && value) {
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

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError('Current password is incorrect');
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordSuccess('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);

      // Send email notification about password change
      if (formData.email) {
        try {
          await sendNotification({
            to: formData.email,
            type: 'email',
            subject: 'Password Changed',
            message: `Your BrainCity account password was just changed. If this wasn't you, please contact support immediately.`,
          });
        } catch (notifErr) {
          console.warn('Password change notification failed:', notifErr);
        }
      }

      showToast('Password updated successfully!', 'success');
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      showToast('Image must be less than 500KB', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Only image files are allowed', 'error');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile || !localStudentData?.id) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${localStudentData.id}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('BrainCityStorage')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('BrainCityStorage')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.message || 'Failed to upload image. Check storage permissions.', 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!localStudentData?.id) throw new Error('No student record found');

      let imageUrl = localStudentData.image_url;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const { data: updatedStudent, error: updateError } = await supabase
        .from('enrolled_students')
        .update({
          child_name: formData.child_name,
          parent_name: formData.parent_name || null,
          date_of_birth: formData.date_of_birth || null,
          age: formData.age ? parseInt(formData.age) : null,
          contact_no: formData.contact_no,
          email: formData.email,
          standard: formData.standard || null,
          school_name: formData.school_name || null,
          address_line1: formData.address_line1 || null,
          address_line2: formData.address_line2 || null,
          landmark: formData.landmark || null,
          area: formData.area || null,
          city: formData.city || null,
          district: formData.district || null,
          state: formData.state || null,
          pincode: formData.pincode || null,
          image_url: imageUrl,
        })
        .eq('id', localStudentData.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setLocalStudentData(updatedStudent);
      setImagePreview(updatedStudent.image_url || null);
      setImageFile(null);

      if (formData.email !== user.email) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (authUpdateError) throw authUpdateError;

        await supabase
          .from('users')
          .update({ email: formData.email })
          .eq('id', userDetails.id);
      }

      const template = NotificationTemplates.profileUpdated(formData.child_name);
      try {
        await sendNotification({
          to: formData.contact_no,
          type: 'whatsapp',
          message: template.message,
        });
      } catch (notifErr) {
        console.warn('WhatsApp notification failed:', notifErr);
      }
      try {
        await sendNotification({
          to: formData.email,
          type: 'email',
          subject: template.subject,
          message: template.message,
        });
      } catch (notifErr) {
        console.warn('Email notification failed:', notifErr);
      }

      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Update error:', err);
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!localStudentData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#E2592D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6F2] to-white py-6 px-4 md:py-8 md:px-6">
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FDE3DA] rounded-2xl">
              <User className="text-[#E2592D]" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1A1A1A]">My Profile</h1>
              <p className="text-sm md:text-base text-[#555555]">Manage your personal information and security</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column – Avatar, Stats, Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
              <div className="p-6 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-100 mx-auto border-4 border-[#FDE3DA] shadow-md">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FDE3DA]">
                        <User size={52} className="text-[#E2592D]" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-[#E2592D] text-white p-2.5 rounded-full hover:bg-[#C94E26] transition shadow-lg disabled:opacity-50"
                    disabled={uploading}
                  >
                    <Camera size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {uploading && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-sm text-[#555555]">
                    <Loader2 size={14} className="animate-spin" /> Uploading...
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Max 500KB • JPG, PNG</p>
                <h3 className="font-bold text-xl mt-3">{localStudentData.child_name}</h3>
                <p className="text-sm text-[#555555]">{localStudentData.standard || 'No standard'} • {localStudentData.school_name || 'No school'}</p>
                
                <div className="mt-4 pt-4 border-t border-[#E5E5E5] text-left space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-[#E2592D]" />
                    <span className="text-[#555555] truncate">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-[#E2592D]" />
                    <span className="text-[#555555]">{formData.contact_no}</span>
                  </div>
                </div>
              </div>
            </div>

            {userProfileStats && (
              <div className="bg-gradient-to-br from-[#FDE3DA] to-white rounded-2xl border border-[#FDE3DA] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <Award className="text-[#E2592D]" size={20} />
                  My Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#555555] flex items-center gap-1">
                      <Star size={18} className="text-yellow-500" /> Stars
                    </span>
                    <span className="font-bold text-lg">{userProfileStats.stars}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#555555] flex items-center gap-1">
                      <TrendingUp size={18} className="text-[#E2592D]" /> Level
                    </span>
                    <span className="font-bold text-lg">{userProfileStats.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#555555]">Total Points</span>
                    <span className="font-bold text-lg">{userProfileStats.total_points}</span>
                  </div>
                  {userProfileStats.last_active && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
                      <span className="text-sm text-[#555555]">Last Active</span>
                      <span className="text-xs font-medium">
                        {new Date(userProfileStats.last_active).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                <Bell size={18} className="text-[#E2592D]" />
                Notifications
              </h3>
              <p className="text-xs text-[#555555]">
                You'll receive updates via WhatsApp & Email for important activities.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                <CheckCircle size={14} /> Enabled
              </div>
            </div>
          </div>

          {/* Right Column – Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-5 md:p-6 space-y-6">
              {/* Personal Information */}
              <div className="pb-4 border-b border-[#F0F0F0]">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <User className="text-[#E2592D]" size={20} />
                  Personal Information
                </h3>
                <p className="text-sm text-[#555555] mb-4">Basic details about the student</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Child Name *</label>
                    <input type="text" name="child_name" value={formData.child_name} onChange={handleChange} required className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="Enter full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Parent / Guardian</label>
                    <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="Parent name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Date of Birth</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Age</label>
                    <input type="number" name="age" value={formData.age} readOnly className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl bg-gray-50 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Contact No. *</label>
                    <input type="tel" name="contact_no" value={formData.contact_no} onChange={handleChange} required className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="Mobile number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="email@example.com" />
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="pb-4 border-b border-[#F0F0F0]">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <School className="text-[#E2592D]" size={20} />
                  School Information
                </h3>
                <p className="text-sm text-[#555555] mb-4">Academic details</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">School Name</label>
                    <input type="text" name="school_name" value={formData.school_name} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="School name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Standard / Class</label>
                    <input type="text" name="standard" value={formData.standard} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="e.g., 5th Grade" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="pb-4 border-b border-[#F0F0F0]">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <MapPin className="text-[#E2592D]" size={20} />
                  Address
                </h3>
                <p className="text-sm text-[#555555] mb-4">Your location details</p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Address Line 1</label>
                    <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="Street address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Address Line 2</label>
                    <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="Apartment, suite, etc." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Landmark</label><input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="Nearby landmark" /></div>
                    <div><label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Area</label><input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="Locality / area" /></div>
                    <div><label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="City" /></div>
                    <div><label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">District</label><input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="District" /></div>
                    <div><label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">State</label><input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="State" /></div>
                    <div><label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition" placeholder="Postal code" /></div>
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="flex items-center gap-2 text-[#E2592D] font-medium hover:underline"
                >
                  <Lock size={18} />
                  {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
                </button>

                {showPasswordSection && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
                    <h4 className="font-semibold text-[#1A1A1A]">Update Password</h4>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 pr-10 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 pr-10 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition"
                            placeholder="Enter new password (min 6 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium mb-1.5 text-[#1A1A1A]">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 pr-10 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent transition"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {passwordError}
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
                        <CheckCircle size={16} />
                        {passwordSuccess}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="w-full bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.01] shadow-md disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;