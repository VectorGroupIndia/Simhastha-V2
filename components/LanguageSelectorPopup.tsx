import React from 'react';

const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

const SmsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

interface LanguageSelectorPopupProps {
  onClose: () => void;
}

const LanguageSelectorPopup: React.FC<LanguageSelectorPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95 hover:scale-100 border border-white/20">
        <div className="p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">
            Welcome to Foundtastic!
            <br />
            <span className="text-xl font-normal">फाउंडटास्टिक में आपका स्वागत है!</span>
          </h2>
          <p className="text-slate-600 mb-6 font-semibold">continue with / जारी रखें</p>
          
          <div className="space-y-4">
            <a href="https://wa.me/+917276199099" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors">
              <WhatsAppIcon className="mr-3 flex-shrink-0" />
              <div className="leading-tight text-left">
                <p className="font-medium text-base">Continue with WhatsApp</p>
                <p className="text-xs">व्हाट्सएप के साथ जारी रखें</p>
              </div>
            </a>
            <button disabled className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-md text-slate-700 bg-slate-100 cursor-not-allowed opacity-60">
              <SmsIcon className="mr-3 flex-shrink-0" />
              <div className="leading-tight text-left">
                <p className="font-medium text-base">Continue with SMS <span className="text-xs">(Coming Soon)</span></p>
                <p className="text-xs">एसएमएस के साथ जारी रखें <span className="text-xs">(जल्द आ रहा है)</span></p>
              </div>
            </button>
            <button disabled className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-md text-slate-700 bg-slate-100 cursor-not-allowed opacity-60">
              <PhoneIcon className="mr-3 flex-shrink-0" />
               <div className="leading-tight text-left">
                <p className="font-medium text-base">Continue with Call <span className="text-xs">(Coming Soon)</span></p>
                <p className="text-xs">कॉल के साथ जारी रखें <span className="text-xs">(जल्द आ रहा है)</span></p>
              </div>
            </button>
          </div>
          
          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                  <span className="px-2 bg-white/0 text-sm text-gray-500">OR</span>
              </div>
          </div>

          <button onClick={onClose} className="w-full px-6 py-3 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-primary hover:text-white transition-colors">
              <div className="leading-tight">
                <p className="font-bold text-base">Continue with the application</p>
                <p className="text-sm font-normal">ऐप्लिकेशन के साथ जारी रखें</p>
              </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorPopup;
