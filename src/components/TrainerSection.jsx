import React from 'react';
import LottiePackage from 'lottie-react';
import animationData from '../assets/animations/business-group-meeting.json';
import { Award, Users, TrendingUp, BookOpen, Heart, Clock, Star } from 'lucide-react';

// Ensure Lottie is the correct component
const Lottie = LottiePackage.default || LottiePackage;

const TrainerSection = () => {
  const isValidLottie = Lottie && typeof Lottie === 'function' && animationData && typeof animationData === 'object';

  const achievements = [
    { icon: Award, title: '15+ Years', description: 'Teaching Experience', color: '#E2592D' },
    { icon: Users, title: '10,000+', description: 'Students Trained', color: '#F4A261' },
    { icon: TrendingUp, title: 'Proven Results', description: 'Across Gujarat', color: '#27403B' },
  ];

  const qualities = [
    'Student‑friendly approach',
    'Result‑oriented teaching',
    'Scientifically structured curriculum',
  ];

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#FFF6F2] py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Trainer Info */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2">
              <Heart className="w-4 h-4 text-[#E2592D]" />
              <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">Meet Your Mentor</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A]">
              Mrs. Pooja Pankaj Khatri
            </h2>
            <p className="text-[#E2592D] font-bold text-lg">M.Com. | Master Abacus Trainer</p>
            <p className="text-[#555555] leading-relaxed">
              With over 15 years of teaching experience, she is one of Gujarat’s most trusted abacus trainers. She has successfully trained 10,000+ students, helping them excel in academics, improve mental speed, and build lifelong learning skills.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {achievements.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-sm border border-[#E5E5E5] hover:shadow-md transition">
                  <div className="flex justify-center mb-2">
                    <item.icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <p className="font-black text-[#1A1A1A] text-lg">{item.title}</p>
                  <p className="text-sm text-[#555555]">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#FDE3DA]">
              <h4 className="font-bold text-lg text-[#1A1A1A] mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E2592D]" />
                Her Teaching Approach:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {qualities.map((q, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#E2592D] rounded-full"></div>
                    <span className="text-[#555555] font-medium">{q}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 text-sm text-[#27403B] font-semibold pt-2">
              <Clock className="w-5 h-5" />
              <span>15+ years of excellence</span>
              <span className="mx-2">•</span>
              <Star className="w-5 h-5" />
              <span>10,000+ lives transformed</span>
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
                    <div className="text-4xl mb-2">👩‍🏫</div>
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

export default TrainerSection;