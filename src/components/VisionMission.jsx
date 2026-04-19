import React from 'react';
import LottiePackage from 'lottie-react';
import animationData from '../assets/animations/seeking-development.json';
import { Eye, Target, Sparkles } from 'lucide-react';

// Ensure Lottie is the correct component
const Lottie = LottiePackage.default || LottiePackage;

const VisionMission = () => {
  const isValidLottie = Lottie && typeof Lottie === 'function' && animationData && typeof animationData === 'object';

  return (
    <section className="w-full bg-gradient-to-b from-[#FFF6F2] to-white py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Vision & Mission Cards */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#E2592D]" />
                <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">
                  Our Guiding Stars
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A]">
                Vision & Mission
              </h2>
              <p className="text-[#555555] mt-2">
                Shaping the future of education with purpose and passion.
              </p>
            </div>

            <div className="space-y-6">
              {/* Vision Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-[#E5E5E5] group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#FDE3DA] rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <Eye className="w-6 h-6 text-[#E2592D]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1A1A1A] group-hover:text-[#E2592D] transition">
                    Our Vision
                  </h3>
                </div>
                <p className="text-[#555555] leading-relaxed">
                  To be India’s most loved brain development ecosystem, empowering every child with the joy of learning, confidence, and mental agility.
                </p>
              </div>

              {/* Mission Card */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-[#E5E5E5] group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#FDE3DA] rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <Target className="w-6 h-6 text-[#E2592D]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1A1A1A] group-hover:text-[#E2592D] transition">
                    Our Mission
                  </h3>
                </div>
                <p className="text-[#555555] leading-relaxed">
                  To provide scientifically designed abacus and brain development programs that make learning math fun, fast, and effective, while building lifelong skills in children.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Animation */}
          <div className="relative">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-[#FDE3DA]">
              {isValidLottie ? (
                <div className="w-full h-80 md:h-96 flex items-center justify-center">
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
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="font-bold text-[#E2592D]">Loading animation...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;