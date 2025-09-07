import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <p className="text-base font-semibold leading-7 text-brand-primary">{t.aboutTitle}</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{t.aboutSubtitle}</h2>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            {t.aboutMotto}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-24 lg:max-w-none lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">{t.aboutProjectTitle}</h3>
              <div className="mt-6 space-y-6 text-gray-600">
                <p>
                  {t.aboutProjectDesc1}
                </p>
                <p>
                  {t.aboutProjectDesc2}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">{t.aboutVisionTitle}</h3>
              <div className="mt-6 space-y-6 text-gray-600">
                <p>
                  <strong>{t.aboutVision}</strong> {t.aboutVisionDesc}
                </p>
                <p>
                  <strong>{t.aboutMission}</strong> {t.aboutMissionDesc}
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">{t.aboutRoleTitle}</h3>
              <div className="mt-6 space-y-6 text-gray-600">
                <p>
                  {t.aboutRoleDesc1}
                </p>
                <p>
                  {t.aboutRoleDesc2}
                </p>
                <ul className="list-disc list-inside space-y-2">
                  {t.aboutRoleFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
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
