import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, Send, MessageCircle, ChevronRight 
} from 'lucide-react';


// Optional: if the following icons are not available, comment them out
// and uncomment the text links below.
// import { Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const whatsappNumber = '919876543210';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hello%20BrainCity%2C%20I%27m%20interested%20in%20your%20program.`;

  const handleNewsletter = (e) => {
    e.preventDefault();
    alert('Newsletter subscription coming soon!');
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>

      <footer className="relative bg-[#27403B] text-white overflow-hidden">
        {/* Wave Background */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg
            className="relative block w-full h-12"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill="#FFF6F2"
              opacity="0.2"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Section */}
            <div className="space-y-4">
              <img
                src="/braincity_logo.png"
                alt="BrainCity"
                className="h-12 w-auto filter brightness-0 invert"
              />
              <p className="text-sm text-[#BFC8C6] leading-relaxed">
                One Stop Math Solution
              </p>
              <p className="text-sm text-[#BFC8C6] leading-relaxed">
                BrainCity helps children unlock their full brain potential through scientifically designed abacus and mental math programs.
              </p>
              <div className="flex space-x-4 pt-2">
                {/* Use text links if icons are missing; otherwise replace with <Facebook size={20} /> etc. */}
                <a href="#" className="text-[#BFC8C6] hover:text-[#E2592D] transition">
                  <span>FB</span>
                </a>
                <a href="#" className="text-[#BFC8C6] hover:text-[#E2592D] transition">
                  <span>IG</span>
                </a>
                <a href="#" className="text-[#BFC8C6] hover:text-[#E2592D] transition">
                  <span>YT</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-[#BFC8C6] hover:text-[#E2592D] transition flex items-center gap-1"><ChevronRight size={14} /> Home</Link></li>
                <li><Link to="/about" className="text-[#BFC8C6] hover:text-[#E2592D] transition flex items-center gap-1"><ChevronRight size={14} /> About</Link></li>
                <li><Link to="/courses" className="text-[#BFC8C6] hover:text-[#E2592D] transition flex items-center gap-1"><ChevronRight size={14} /> Courses</Link></li>
                <li><Link to="/results" className="text-[#BFC8C6] hover:text-[#E2592D] transition flex items-center gap-1"><ChevronRight size={14} /> Results</Link></li>
                <li><Link to="/contact" className="text-[#BFC8C6] hover:text-[#E2592D] transition flex items-center gap-1"><ChevronRight size={14} /> Contact</Link></li>
              </ul>
            </div>

            {/* Courses */}
            <div>
              <h3 className="text-lg font-bold mb-4">Our Courses</h3>
              <ul className="space-y-2">
                <li><Link to="/courses/junior" className="text-[#BFC8C6] hover:text-[#E2592D] transition flex items-center gap-1"><ChevronRight size={14} /> Junior Level (12 Levels)</Link></li>
                <li><Link to="/courses/senior" className="text-[#BFC8C6] hover:text-[#E2592D] transition flex items-center gap-1"><ChevronRight size={14} /> Senior Level (10 Levels)</Link></li>
                <li><Link to="/courses/teacher-training" className="text-[#BFC8C6] hover:text-[#E2592D] transition flex items-center gap-1"><ChevronRight size={14} /> Teacher Training Program</Link></li>
              </ul>
            </div>

            {/* Contact + CTA */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
              <div className="space-y-2 text-[#BFC8C6]">
                <div className="flex items-center gap-2"><MapPin size={16} /><span className="text-sm">Gujarat (Online + Offline)</span></div>
                <div className="flex items-center gap-2"><Phone size={16} /><span className="text-sm">+91 98765 43210</span></div>
                <div className="flex items-center gap-2"><Mail size={16} /><span className="text-sm">info@braincity.com</span></div>
              </div>
              <button onClick={() => navigate('/demo')} className="bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold px-6 py-2 rounded-lg transition transform hover:scale-105 shadow-md mt-2">
                Book Free Demo
              </button>
              <div className="pt-4">
                <p className="text-sm font-semibold mb-2">Get tips for your child’s brain development</p>
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-[#BFC8C6] focus:outline-none focus:ring-2 focus:ring-[#E2592D]" required />
                  <button type="submit" className="bg-[#E2592D] hover:bg-[#C94E26] px-3 py-2 rounded-lg transition"><Send size={16} /></button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#BFC8C6]/20 mt-12 pt-6 text-sm text-[#BFC8C6] flex flex-col md:flex-row justify-between items-center gap-4">
            <div>© {currentYear} BrainCity. All rights reserved.</div>
            <div>Design and Developed by <a href="https://www.exotech.co.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#E2592D] transition">Exotech Developers</a></div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;