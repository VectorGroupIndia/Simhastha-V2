import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const BackgroundBlobs: React.FC = () => (
    <>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/30 rounded-full filter blur-3xl opacity-50 animate-float"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/30 rounded-full filter blur-3xl opacity-50 animate-float2"></div>
    </>
);

interface FaqItemProps {
  question: string;
  children: React.ReactNode;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg overflow-hidden transition-all duration-300">
      <dt>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-start justify-between text-left text-white p-6"
        >
          <span className="text-base font-semibold leading-7">{question}</span>
          <span className="ml-6 flex h-7 items-center transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </span>
        </button>
      </dt>
      <dd className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="px-6 pb-6 pt-2">
            <p className="text-base leading-7 text-slate-300">{children}</p>
          </div>
        </dd>
    </div>
  );
};


const FaqPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="relative isolate overflow-hidden min-h-screen py-24 sm:py-32">
       <BackgroundBlobs />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold leading-10 tracking-tight text-white text-center mb-12">{t.faqTitle}</h2>
          <dl className="space-y-6">
            {t.faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.q}>
                {faq.a}
              </FaqItem>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
