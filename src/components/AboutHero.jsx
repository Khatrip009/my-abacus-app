import React from 'react';
import LottiePackage from 'lottie-react';
import animationData from '../assets/animations/business-group-meeting.json';
import { Sparkles, Target, Heart, Users } from 'lucide-react';

// Ensure Lottie is the correct component
const Lottie = LottiePackage.default || LottiePackage;

const AboutHero = () => {
  const isValidLottie = Lottie && typeof Lottie === 'function' && animationData && typeof animationData === 'object';

  return (
    <section className="relative w-full bg-gradient-to-br from-[#FFF6F2] to-white overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#E2592D] rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#27403B] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#F4A261] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text Content */}
        <div className="text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm mb-6 border border-[#FDE3DA]">
            <Sparkles className="w-4 h-4 text-[#E2592D]" />
            <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">Our Story</span>
          </div>
          <h1 className="text-2xl sm:text-2xl lg:text-4xl xl:text-3xl font-black text-[#1A1A1A] leading-tight mb-6">
            Shaping Young Minds,{' '}
            <span className="bg-gradient-to-r from-[#E2592D] to-[#F4A261] bg-clip-text text-transparent">
              One Bead at a Time
            </span>
          </h1>
          <p className="text-[#555555] text-lg md:text-xl leading-relaxed mb-8">
            BrainCity is a trusted leader in abacus and brain development programs, founded with a mission to make math fun, engaging, and transformative for children across India.
          </p>

          {/* Quick stats or values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#E5E5E5]">
              <div className="flex justify-center lg:justify-start mb-2">
                <div className="w-10 h-10 bg-[#FDE3DA] rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#E2592D]" />
                </div>
              </div>
              <p className="font-black text-[#1A1A1A]">Our Mission</p>
              <p className="text-xs text-[#555555]">Empower children with mental math & confidence</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#E5E5E5]">
              <div className="flex justify-center lg:justify-start mb-2">
                <div className="w-10 h-10 bg-[#FDE3DA] rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#E2592D]" />
                </div>
              </div>
              <p className="font-black text-[#1A1A1A]">Our Vision</p>
              <p className="text-xs text-[#555555]">India’s most loved brain development ecosystem</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#E5E5E5]">
              <div className="flex justify-center lg:justify-start mb-2">
                <div className="w-10 h-10 bg-[#FDE3DA] rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#E2592D]" />
                </div>
              </div>
              <p className="font-black text-[#1A1A1A]">Our Values</p>
              <p className="text-xs text-[#555555]">Integrity, Innovation, Child-Centric</p>
            </div>
          </div>
        </div>

        {/* Right: Animation */}
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
                  <div className="text-4xl mb-2">🤝</div>
                  <p className="font-bold text-[#E2592D]">Loading animation...</p>
                </div>
              </div>
            )}
          </div>
        </div>
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
};

export default AboutHero;