import React from 'react';
import LottiePackage from 'lottie-react';
import animationData from '../assets/animations/business-chart.json';
import { ArrowRight, Award, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Ensure Lottie is the correct component
const Lottie = LottiePackage.default || LottiePackage;

export default function Hero() {
  const navigate = useNavigate();

  // Validate Lottie component and animation data
  const isValidLottie = Lottie && typeof Lottie === 'function' && animationData && typeof animationData === 'object';

  return (
    <section className="relative w-full bg-[#FFF6F2] overflow-hidden">
      {/* Decorative animated blobs in brand colors */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#E2592D] rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#F4A261] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#27403B] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT SIDE - Text Content */}
        <div className="text-center lg:text-left z-10">
          {/* Sparkle badge */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-6 border border-[#FDE3DA]">
            <Sparkles className="w-4 h-4 text-[#E2592D]" />
            <span className="text-sm font-bold text-[#27403B]">Brain Development Program</span>
          </div>

          {/* Headline */}
          <h1 className="text-1xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-[#1A1A1A] leading-tight mb-6">
            Unlock Your Child’s <br />
            <span className="bg-gradient-to-r from-[#E2592D] to-[#F4A261] bg-clip-text text-transparent">
              Brain Power
            </span> with <span className="text-[#27403B]">BrainCity</span>
          </h1>

          {/* Subheading */}
          <p className="text-[#555555] text-lg md:text-xl font-semibold mb-2">
            India’s Most Trusted Abacus & Brain Development Program
          </p>
          <p className="text-[#E2592D] text-md font-bold mb-8">
            Designed by Expert Trainer <span className="font-black">Mrs. Pooja Pankaj Khatri</span>
          </p>

          {/* Key Highlights - Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow border border-[#E5E5E5]">
              <Award className="w-8 h-8 text-[#E2592D] mb-2 mx-auto lg:mx-0" />
              <p className="font-black text-[#1A1A1A] text-lg">15+ Years</p>
              <p className="text-[#555555] text-sm">Experience</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow border border-[#E5E5E5]">
              <Users className="w-8 h-8 text-[#E2592D] mb-2 mx-auto lg:mx-0" />
              <p className="font-black text-[#1A1A1A] text-lg">10,000+</p>
              <p className="text-[#555555] text-sm">Happy Students</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow border border-[#E5E5E5]">
              <CheckCircle2 className="w-8 h-8 text-[#E2592D] mb-2 mx-auto lg:mx-0" />
              <p className="font-black text-[#1A1A1A] text-lg">Proven Results</p>
              <p className="text-[#555555] text-sm">Across Gujarat</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={() => navigate("/enroll")}
              className="group bg-[#E2592D] hover:bg-[#C94E26] text-white px-8 py-3 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Enroll Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="border-2 border-[#E2592D] bg-white text-[#E2592D] hover:bg-[#FDE3DA] px-8 py-3 rounded-xl font-black text-lg transition-all shadow-md hover:shadow-lg"
            >
              Book Free Demo Class
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - Lottie Animation */}
        <div className="relative z-10">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-[#FDE3DA]">
            {isValidLottie ? (
              <div className="w-full h-80 md:h-96 lg:h-[500px] flex items-center justify-center">
                <Lottie 
                  animationData={animationData} 
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div className="w-full h-80 md:h-96 bg-gradient-to-br from-[#FDE3DA] to-[#FFF6F2] rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🧮</div>
                  <p className="font-bold text-[#E2592D]">Loading animation...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="relative text-center text-xs text-[#555555] pb-6">
        <a href="https://iconscout.com/lottie-animations/business-chart" target="_blank" rel="noopener noreferrer" className="hover:text-[#E2592D]">
          Business chart by nanoagency on IconScout
        </a>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}