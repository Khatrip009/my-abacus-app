import React from 'react';
import LottiePackage from 'lottie-react';
import animationData from '../assets/animations/business-goal.json';
import { Brain, Target, Zap, Award, Sparkles } from 'lucide-react';

// Ensure Lottie is the correct component
const Lottie = LottiePackage.default || LottiePackage;

const WhyUs = () => {
  const isValidLottie = Lottie && typeof Lottie === 'function' && animationData && typeof animationData === 'object';

  const benefits = [
    {
      icon: Brain,
      title: 'Improve concentration & focus',
      color: '#E2592D',
    },
    {
      icon: Target,
      title: 'Develop photographic memory',
      color: '#F4A261',
    },
    {
      icon: Zap,
      title: 'Perform fast calculations without calculator',
      color: '#E2592D',
    },
    {
      icon: Award,
      title: 'Build confidence in academics',
      color: '#27403B',
    },
    {
      icon: Sparkles,
      title: 'Strengthen left & right brain coordination',
      color: '#F4A261',
    },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#FFF6F2] py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#E2592D]" />
            <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">Why BrainCity?</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-4">
            Why Parents Choose <span className="text-[#27403B]">BrainCity</span>
          </h2>
          <p className="text-lg text-[#555555] max-w-2xl mx-auto">
            At BrainCity, we don’t just teach math — we transform the way your child thinks.
          </p>
        </div>

        {/* Content Grid - Equal Height Columns */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Benefits List */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all border border-[#E5E5E5] hover:border-[#FDE3DA] group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${benefit.color}10` }}
                >
                  <benefit.icon className="w-6 h-6 transition-all duration-300 group-hover:scale-110" style={{ color: benefit.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1A1A] group-hover:text-[#E2592D] transition-colors">
                    {benefit.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Lottie Animation (takes full height of left column) */}
          <div className="relative h-full">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-[#FDE3DA] h-full flex flex-col">
              {isValidLottie ? (
                <div className="flex-1 w-full flex items-center justify-center">
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              ) : (
                <div className="flex-1 bg-gradient-to-br from-[#FDE3DA] to-[#FFF6F2] rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="font-bold text-[#E2592D]">Loading animation...</p>
                  </div>
                </div>
              )}
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#F4A261] rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Custom animation for icons (optional) */}
      <style jsx>{`
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .icon-pulse {
          animation: gentlePulse 2s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default WhyUs;