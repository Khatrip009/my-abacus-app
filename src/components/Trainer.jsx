import React from 'react';
import { Award, Users, TrendingUp, BookOpen, Heart, Clock } from 'lucide-react';

const Trainer = () => {
  const achievements = [
    {
      icon: Award,
      title: '15+ Years',
      description: 'Teaching Experience',
      color: '#E2592D',
    },
    {
      icon: Users,
      title: '10,000+',
      description: 'Students Trained',
      color: '#F4A261',
    },
    {
      icon: TrendingUp,
      title: 'Proven Results',
      description: 'Across Gujarat',
      color: '#27403B',
    },
  ];

  const qualities = [
    'Student-friendly approach',
    'Result-oriented teaching',
    'Scientifically structured curriculum',
  ];

  return (
    <section className="w-full bg-gradient-to-b from-[#FFF6F2] to-white py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2 mb-4">
            <Heart className="w-4 h-4 text-[#E2592D]" />
            <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">Meet Your Mentor</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-4">
            Meet Your <span className="text-[#27403B]">Mentor</span>
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="relative group">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#FDE3DA]">
              <img
                src="/pooja.jpg"  // Adjust path if needed (e.g., "/pooja.jpg" if in public, or import)
                alt="Mrs. Pooja Pankaj Khatri"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ maxHeight: '500px' }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#27403B]/20 to-transparent"></div>
            </div>
            {/* Decorative element */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#E2592D] rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#F4A261] rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none"></div>
          </div>

          {/* Right: Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-black text-[#1A1A1A] mb-2">
                Mrs. Pooja Pankaj Khatri
              </h3>
              <p className="text-[#E2592D] font-bold text-lg">M.Com. | Master Abacus Trainer</p>
            </div>

            <p className="text-[#555555] leading-relaxed">
              With over 15 years of teaching experience, she is one of Gujarat’s most trusted abacus trainers.
            </p>

            <p className="text-[#555555] leading-relaxed">
              She has successfully trained 10,000+ students, helping them:
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

            {/* Trust Signal */}
            <div className="flex gap-3 text-sm text-[#27403B] font-semibold pt-2">
              <Clock className="w-5 h-5" />
              <span>15+ years of excellence</span>
              <span className="mx-2">•</span>
              <Heart className="w-5 h-5" />
              <span>10,000+ lives transformed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trainer;