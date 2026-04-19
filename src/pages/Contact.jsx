// src/pages/Contact.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { sendNotification } from '../utils/notifications';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = '916352372744'; // +91 6352372744
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hello%20BrainCity%2C%20I%20have%20a%20query.`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendNotification({
        to: 'poojakhatri519@gmail.com',
        type: 'email',
        subject: `New Contact Query from ${formData.name}`,
        message: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6F2] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-4">Get in Touch</h1>
          <p className="text-lg text-[#555555] max-w-2xl mx-auto">
            Have questions about our programs? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
              <div className="w-12 h-12 bg-[#FDE3DA] rounded-xl flex items-center justify-center mb-4">
                <Phone className="text-[#E2592D]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Call Us</h3>
              <p className="text-[#555555] mb-1">Mrs. Pooja Pankaj Khatri</p>
              <a href="tel:+916352372744" className="text-2xl font-black text-[#E2592D] hover:underline">
                +91 63523 72744
              </a>
              <p className="text-sm text-[#BFC8C6] mt-2">Mon-Sat, 9am-7pm</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
              <div className="w-12 h-12 bg-[#FDE3DA] rounded-xl flex items-center justify-center mb-4">
                <Mail className="text-[#E2592D]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Email Us</h3>
              <a href="mailto:poojakhatri519@gmail.com" className="text-[#E2592D] font-medium hover:underline break-all">
                poojakhatri519@gmail.com
              </a>
              <p className="text-sm text-[#BFC8C6] mt-2">We'll respond within 24 hours</p>
            </div>

            <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-2xl p-6 shadow-sm text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">WhatsApp</h3>
              <p className="text-white/90 mb-4">Quick responses via WhatsApp</p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#128C7E] font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
              <div className="w-12 h-12 bg-[#FDE3DA] rounded-xl flex items-center justify-center mb-4">
                <Clock className="text-[#E2592D]" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Office Hours</h3>
              <ul className="space-y-2 text-[#555555]">
                <li className="flex justify-between">
                  <span>Mon - Fri</span>
                  <span className="font-medium">9:00 AM - 7:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM - 5:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-[#E2592D]">Closed</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E5E5E5]">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Send us a Message</h2>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Thank You!</h3>
                  <p className="text-green-700">Your message has been sent successfully. We'll get back to you soon.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-[#E2592D] font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#E2592D] focus:border-transparent resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Map placeholder or additional info */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-[#E5E5E5]">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-[#E2592D]" size={24} />
            <h3 className="text-lg font-bold text-[#1A1A1A]">Our Location</h3>
          </div>
          <p className="text-[#555555]">Surat, Gujarat, India (Online & Offline Classes Available)</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;