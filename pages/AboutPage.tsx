import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const BackgroundBlobs: React.FC = () => (
    <>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/30 rounded-full filter blur-3xl opacity-50 animate-float"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/30 rounded-full filter blur-3xl opacity-50 animate-float2"></div>
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl opacity-40 animate-float3"></div>
    </>
);


const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="relative isolate overflow-hidden min-h-screen py-24 sm:py-32">
      <BackgroundBlobs />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-2xl lg:mx-0 text-center">
          <p className="text-base font-semibold leading-7 text-brand-secondary">{t.aboutTitle}</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-6xl">{t.aboutSubtitle}</h2>
          <p className="mt-6 text-xl leading-8 text-slate-300">
            {t.aboutMotto}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:mt-24">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold tracking-tight text-white">{t.aboutProjectTitle}</h3>
              <div className="mt-6 space-y-6 text-slate-300">
                <p>
                  {t.aboutProjectDesc1}
                </p>
                <p>
                  {t.aboutProjectDesc2}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold tracking-tight text-white">{t.aboutVisionTitle}</h3>
              <div className="mt-6 space-y-6 text-slate-300">
                <p>
                  <strong className="text-brand-secondary">{t.aboutVision}</strong> {t.aboutVisionDesc}
                </p>
                <p>
                  <strong className="text-brand-secondary">{t.aboutMission}</strong> {t.aboutMissionDesc}
                </p>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold tracking-tight text-white">{t.aboutRoleTitle}</h3>
              <div className="mt-6 space-y-6 text-slate-300">
                <p>
                  {t.aboutRoleDesc1}
                </p>
                <p>
                  {t.aboutRoleDesc2}
                </p>
                <ul className="list-disc list-inside space-y-2">
                  {t.aboutRoleFeatures.map((feature, index) => (
                    <li key={index}><span className="text-brand-secondary mr-2">&#10003;</span>{feature}</li>
                  ))}
                </ul>
                <p>
                  {t.aboutRoleClosing}
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;