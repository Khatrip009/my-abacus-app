import React from 'react';
import LottiePackage from 'lottie-react';
import animationData from '../assets/animations/business-customer-access.json';
import { CheckCircle2, Sparkles, Shield, BookOpen } from 'lucide-react';

// Ensure Lottie is the correct component
const Lottie = LottiePackage.default || LottiePackage;

const AboutIntro = () => {
  const isValidLottie = Lottie && typeof Lottie === 'function' && animationData && typeof animationData === 'object';

  const pillars = [
    {
      icon: BookOpen,
      title: 'Scientifically Designed',
      description: 'Curriculum based on cognitive development research',
    },
    {
      icon: Sparkles,
      title: 'Child-Centric Approach',
      description: 'Learning at each child’s unique pace',
    },
    {
      icon: Shield,
      title: 'Trusted by Parents',
      description: '10,000+ families across Gujarat',
    },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#FFF6F2] py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-[#E2592D]" />
              <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">
                Why BrainCity Works
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] leading-tight">
              More Than Just Abacus – <br />
              <span className="text-[#E2592D]">A Complete Brain Development Ecosystem</span>
            </h2>
            <p className="text-[#555555] text-lg leading-relaxed">
              At BrainCity, we combine traditional abacus techniques with modern neuroscience to create a learning experience that boosts concentration, memory, and confidence.
            </p>
            <div className="space-y-4">
              {pillars.map((pillar, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#FDE3DA] rounded-full flex items-center justify-center">
                    <pillar.icon className="w-5 h-5 text-[#E2592D]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A1A]">{pillar.title}</h3>
                    <p className="text-sm text-[#555555]">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#E2592D]" />
                <span className="font-bold text-[#27403B]">15+ Years</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#E2592D]" />
                <span className="font-bold text-[#27403B]">10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#E2592D]" />
                <span className="font-bold text-[#27403B]">100% Satisfaction</span>
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
                    <div className="text-4xl mb-2">🧠</div>
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

export default AboutIntro;