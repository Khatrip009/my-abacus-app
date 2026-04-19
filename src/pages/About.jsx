import React from 'react';
import AboutHero from '../components/AboutHero';
import AboutIntro from '../components/AboutIntro';
import TrainerSection from '../components/TrainerSection';
import VisionMission from '../components/VisionMission';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <AboutHero />
      <AboutIntro />
      <TrainerSection />
      <VisionMission />
      <CTA />
    </div>
  );
}