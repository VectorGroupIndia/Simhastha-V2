import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FaqItemProps {
  question: string;
  children: React.ReactNode;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 py-6">
      <dt>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-start justify-between text-left text-slate-900"
        >
          <span className="text-base font-semibold leading-7">{question}</span>
          <span className="ml-6 flex h-7 items-center">
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            )}
          </span>
        </button>
      </dt>
      {isOpen && (
        <dd className="mt-4 pr-12">
          <p className="text-base leading-7 text-slate-600">{children}</p>
        </dd>
      )}
    </div>
  );
};


const FaqPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl divide-y divide-slate-900/10">
          <h2 className="text-4xl font-bold leading-10 tracking-tight text-slate-900">{t.faqTitle}</h2>
          <dl className="mt-10 space-y-6 divide-y divide-slate-900/10">
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
