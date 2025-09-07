import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ContactPage: React.FC = () => {
    const { t } = useLanguage();
    const [formStep, setFormStep] = useState<'details' | 'otp' | 'success'>('details');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [message, setMessage] = useState('');
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = t.contactErrors.name;
        if (!email.trim()) {
            newErrors.email = t.contactErrors.email;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t.contactErrors.emailInvalid;
        }
        if (!mobile.trim()) {
            newErrors.mobile = t.contactErrors.mobile;
        } else if (!/^[6-9]\d{9}$/.test(mobile)) {
            newErrors.mobile = t.contactErrors.mobileInvalid;
        }
        if (!message.trim()) newErrors.message = t.contactErrors.message;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Simulating sending OTP...');
            setFormStep('otp');
        }
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (otp === '123456') {
            console.log('OTP verification successful!');
            setFormStep('success');
        } else {
            setErrors({ otp: t.contactErrors.otp });
        }
    };
    
    const getInputClassName = (field: string) => `mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-slate-900 ${errors[field] ? 'border-red-500' : 'border-slate-300'}`;

    const renderDetailsForm = () => (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">{t.contactFormName}</label>
                <input type="text" name="name" id="name" value={name} onChange={e => setName(e.target.value)} className={getInputClassName('name')} />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">{t.contactFormEmail}</label>
                <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={getInputClassName('email')} />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-slate-700">{t.contactFormMobile}</label>
                <input type="tel" name="mobile" id="mobile" value={mobile} onChange={e => setMobile(e.target.value)} className={getInputClassName('mobile')} />
                {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700">{t.contactFormMessage}</label>
                <textarea id="message" name="message" rows={4} value={message} onChange={e => setMessage(e.target.value)} className={getInputClassName('message')}></textarea>
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
            </div>
            <div>
                <button type="submit" className="w-full bg-brand-secondary text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">{t.contactFormSend}</button>
            </div>
        </form>
    );

    const renderOtpForm = () => (
        <form onSubmit={handleOtpSubmit} className="space-y-4 text-center">
            <p className="text-sm text-slate-600">
                {t.contactFormOtpPrompt}
                <br />
                {t.contactFormOtpDemo}
            </p>
            <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-700 sr-only">{t.contactFormOtpPlaceholder}</label>
                <input type="text" name="otp" id="otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder={t.contactFormOtpPlaceholder} className={getInputClassName('otp') + ' text-center'} />
                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
            </div>
            <div>
                <button type="submit" className="w-full bg-brand-secondary text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">{t.contactFormOtpVerify}</button>
            </div>
        </form>
    );
    
    const renderSuccessMessage = () => (
        <div className="text-center space-y-4 p-6 bg-green-50 border border-green-200 rounded-lg">
             <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-green-800">{t.contactFormSuccessTitle}</h3>
            <p className="text-green-700">{t.contactFormSuccessBody}</p>
        </div>
    );

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-brand-dark sm:text-5xl">{t.contactTitle}</h1>
            <p className="mt-4 text-lg text-slate-600">{t.contactSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div>
                <h2 className="text-2xl font-bold text-brand-primary mb-4 border-b-2 border-brand-primary pb-2">{t.contactOrgTitle}</h2>
                <div className="space-y-4 text-slate-700">
                    <p><strong>{t.contactOrgAddress}</strong> 2371, Kshitij Nivas, Datta Nagar, Vasud-Akola Road, Sangola, Solpaur, Maharashtra, 413307</p>
                    <p><strong>{t.contactOrgEmail}</strong> <a href="mailto:contact@thetransfigure.com" className="text-brand-secondary hover:underline">contact@thetransfigure.com</a></p>
                    <p><strong>{t.contactOrgPhone}</strong> <a href="tel:+917276199099" className="text-brand-secondary hover:underline">+91 7276199099</a></p>
                </div>
            </div>

            {/* Right Column */}
            <div>
                 <h2 className="text-2xl font-bold text-brand-secondary mb-4 border-b-2 border-brand-secondary pb-2">{t.contactEventTitle}</h2>
                 <div className="space-y-4 text-slate-700 mb-8">
                    <p>{t.contactEventDesc}</p>
                    <p><strong>{t.contactEventEmail}</strong> <a href="mailto:help@simhastha2028.gov.in" className="text-brand-primary hover:underline">help@simhastha2028.gov.in</a></p>
                    <p><strong>{t.contactEventHelpline}</strong> Helpline <a href="tel:18001232028" className="text-brand-primary hover:underline">1800-123-2028</a></p>
                    <p><strong>{t.contactEventEmergency}</strong> Dial <a href="tel:112" className="text-brand-primary hover:underline font-bold">112</a></p>
                     <p><strong>{t.contactEventLostFound}</strong> {t.contactEventLostFoundDesc}</p>
                </div>

                <div className="bg-brand-light p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-brand-dark mb-4 text-center">{t.contactFormTitle}</h3>
                    {formStep === 'details' && renderDetailsForm()}
                    {formStep === 'otp' && renderOtpForm()}
                    {formStep === 'success' && renderSuccessMessage()}
                </div>
            </div>
        </div>

        {/* Map Section */}
        <div className="mt-20">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">{t.contactMapTitle}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-brand-light p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-brand-dark mb-4">{t.contactMapSubtitle}</h3>
                    <ul className="space-y-3 text-slate-700">
                        {t.contactMapLocations.map((loc, index) => (
                            <li key={index} className="p-3 bg-white rounded-md shadow-sm"><strong>{loc.split(':')[0]}:</strong>{loc.split(':')[1]}</li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-2 rounded-lg overflow-hidden shadow-2xl">
                    <iframe 
                        src="https://maps.google.com/maps?q=Ujjain&t=&z=13&ie=UTF8&iwloc=&output=embed"
                        width="100%"
                        height="100%"
                        style={{border:0, minHeight: '450px'}}
                        allowFullScreen={false}
                        loading="lazy"
                        title="Ujjain Help Centers Map"
                        referrerPolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
