import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockUsers } from '../../data/mockData';
import Spinner from '../Spinner';

// SVG Icons for form fields
const MailIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LockIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const UserIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EyeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064 7-9.542 7 .847 0 1.673.123 2.458.35M18.825 13.875A10.05 10.05 0 0119 12c-1.274-4.057-5.064 7-9.542 7a10.05 10.05 0 00-1.825.207M12 15a3 3 0 01-3-3m0 0l-6-6m12 12l-6-6" /></svg>;

const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (/\d/.test(password)) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length === 0) return 0;
    return score;
};

const PasswordStrengthMeter: React.FC<{ password?: string }> = ({ password = '' }) => {
    const { t } = useLanguage();
    const strength = getPasswordStrength(password);
    
    const strengthLevels = [
        { text: '', color: 'bg-slate-200', width: '0%' }, // score 0
        { text: t.passwordWeak, color: 'bg-red-500', width: '20%' }, // score 1
        { text: t.passwordWeak, color: 'bg-red-500', width: '40%' }, // score 2
        { text: t.passwordMedium, color: 'bg-yellow-500', width: '60%' }, // score 3
        { text: t.passwordStrong, color: 'bg-green-500', width: '80%' }, // score 4
        { text: t.passwordStrong, color: 'bg-green-500', width: '100%' }, // score 5
    ];

    const level = strengthLevels[strength];
    if (!password) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-slate-600">{t.passwordStrength}</span>
                <span className={`text-xs font-bold text-${level.color.split('-')[1]}-500`}>{level.text}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${level.color} transition-all duration-300`} style={{ width: level.width }}></div>
            </div>
        </div>
    );
};

interface AuthStepProps {
    onLoginSuccess: () => void;
}

const LoginForm: React.FC<AuthStepProps> = ({ onLoginSuccess }) => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
                <label htmlFor="email-login" className="block text-sm font-medium leading-6 text-slate-700">{t.loginEmail}</label>
                <div className="relative mt-2">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon /></span>
                    <input id="email-login" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"/>
                </div>
            </div>
            <div>
                <label htmlFor="password-login" className="block text-sm font-medium leading-6 text-slate-700">{t.loginPassword}</label>
                <div className="relative mt-2">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon /></span>
                    <input id="password-login" name="password" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"/>
                    <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700" aria-label={passwordVisible ? t.hidePassword : t.showPassword}>
                        {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
            </div>
            {error && (<p className="text-sm text-red-600 text-center">{error}</p>)}
            <div>
                <button type="submit" disabled={loading} className="flex w-full justify-center items-center rounded-md bg-brand-primary px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:bg-brand-primary/60 disabled:cursor-not-allowed">
                    {loading ? <><Spinner className="mr-3" /> {t.signingIn}</> : t.loginButton}
                </button>
            </div>
        </form>
    );
};

const RegisterForm: React.FC<AuthStepProps> = ({ onLoginSuccess }) => {
    const { register } = useAuth();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = t.formErrors.nameRequired;
        if (!formData.email) newErrors.email = t.formErrors.emailRequired;
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.formErrors.emailInvalid;
        if (!formData.password) newErrors.password = t.formErrors.passwordRequired;
        else if (formData.password.length < 8 || !/\d/.test(formData.password)) newErrors.password = t.formErrors.passwordLength;
        if (!formData.confirmPassword) newErrors.confirmPassword = t.formErrors.confirmPasswordRequired;
        else if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.formErrors.passwordMatch;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (validate()) {
            setLoading(true);
            try {
                await register(formData.name, formData.email, formData.password);
                onLoginSuccess();
            } catch (err: any) {
                setErrors({ form: err.message });
            } finally {
                setLoading(false);
            }
        }
    };
    
    const getInputClassName = (field: string) => `block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ${errors[field] ? 'ring-red-500' : 'ring-slate-300'} placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6`;

    return (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
                <label htmlFor="name-register" className="block text-sm font-medium leading-6 text-slate-700">{t.authRegisterName}</label>
                <div className="relative mt-2">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon /></span>
                    <input id="name-register" name="name" type="text" autoComplete="name" required value={formData.name} onChange={handleChange} className={getInputClassName('name')} />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
                <label htmlFor="email-register" className="block text-sm font-medium leading-6 text-slate-700">{t.loginEmail}</label>
                <div className="relative mt-2">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon /></span>
                    <input id="email-register" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={getInputClassName('email')} />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
                <label htmlFor="password-register" className="block text-sm font-medium leading-6 text-slate-700">{t.loginPassword}</label>
                <div className="relative mt-2">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon /></span>
                    <input id="password-register" name="password" type={passwordVisible ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className={getInputClassName('password')} />
                    <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700" aria-label={passwordVisible ? t.hidePassword : t.showPassword}>
                        {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                <div className="mt-2">
                   <PasswordStrengthMeter password={formData.password} />
                </div>
            </div>
            <div>
                <label htmlFor="confirm-password-register" className="block text-sm font-medium leading-6 text-slate-700">{t.authRegisterConfirmPassword}</label>
                <div className="relative mt-2">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon /></span>
                    <input id="confirm-password-register" name="confirmPassword" type={confirmPasswordVisible ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className={getInputClassName('confirmPassword')} />
                     <button type="button" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700" aria-label={confirmPasswordVisible ? t.hidePassword : t.showPassword}>
                        {confirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
            {errors.form && (<p className="text-sm text-red-600 text-center py-2">{errors.form}</p>)}
            <div>
                <button type="submit" disabled={loading} className="flex w-full justify-center items-center rounded-md bg-brand-secondary px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary disabled:bg-brand-secondary/60 disabled:cursor-not-allowed">
                     {loading ? <><Spinner className="mr-3" /> {t.registering}</> : t.authRegisterButton}
                </button>
            </div>
        </form>
    );
};

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


const DemoAccounts: React.FC<{ users: (typeof mockUsers[0] | undefined)[] }> = ({ users }) => {
    const { t } = useLanguage();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, fieldIdentifier: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldIdentifier);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };
    
    const roleTranslations: Record<string, string> = {
        user: t.demoRoleCitizen,
        admin: t.demoRoleAdmin,
        authority: t.demoRoleAuthority,
        volunteer: t.demoRoleVolunteer,
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg border">
            <h3 className="text-center text-md font-bold text-brand-dark mb-3">{t.demoAccountsTitle}</h3>
            <div className="space-y-3">
                {users.map(user => user && (
                    <div key={user.id} className="p-2 bg-white rounded-md border border-slate-200">
                        <p className="font-bold text-sm text-brand-primary">{roleTranslations[user.role] || user.role}</p>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-slate-600 truncate pr-2" title={user.email}>{user.email}</span>
                             <button onClick={() => handleCopy(user.email, `${user.id}-email`)} className="flex items-center text-xs text-slate-500 hover:text-brand-primary font-medium p-1 rounded-md transition-colors">
                                {copiedField === `${user.id}-email` ? <><CheckIcon className="text-green-500"/> <span className="ml-1 text-green-500">{t.copied}</span></> : <><ClipboardIcon className="mr-1"/> {t.copyEmail}</>}
                            </button>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">••••••••</span>
                            <button onClick={() => handleCopy(user.password, `${user.id}-password`)} className="flex items-center text-xs text-slate-500 hover:text-brand-primary font-medium p-1 rounded-md transition-colors">
                                {copiedField === `${user.id}-password` ? <><CheckIcon className="text-green-500"/> <span className="ml-1 text-green-500">{t.copied}</span></> : <><ClipboardIcon className="mr-1"/> {t.copyPassword}</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AuthStep: React.FC<AuthStepProps> = ({ onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const { t } = useLanguage();
    
    const demoUsers = [
        mockUsers.find(u => u.role === 'user'),
    ].filter(Boolean);

    return (
        <div className="w-full max-w-md mx-auto">
             <p className="text-slate-600 text-center mb-8">
                {t.authStepDescription}
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 mb-6">
                <button onClick={() => setActiveTab('login')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'login' ? 'bg-white text-brand-primary shadow' : 'text-slate-600 hover:bg-white/50'}`}>
                    {t.authStepLoginButton}
                </button>
                <button onClick={() => setActiveTab('register')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'register' ? 'bg-white text-brand-secondary shadow' : 'text-slate-600 hover:bg-white/50'}`}>
                    {t.authStepRegisterButton}
                </button>
            </div>
            
            <div className="pt-2">
                {activeTab === 'login' ? <LoginForm onLoginSuccess={onLoginSuccess} /> : <RegisterForm onLoginSuccess={onLoginSuccess} />}
            </div>

            <div className="mt-8 border-t pt-6">
                <DemoAccounts users={demoUsers} />
            </div>

             <p className="mt-8 text-center text-xs text-slate-500">
                {t.authStepNote}
            </p>
        </div>
    );
};

export default AuthStep;
