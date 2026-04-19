import React from 'react';
import HomeHero from '../components/HomeHero';
import WhyUs from '../components/WhyUs';
import Trainer from '../components/Trainer';
import Courses from '../components/Courses';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <HomeHero />
      <WhyUs />
      <Trainer />
      <Courses />
    </div>
  );
}