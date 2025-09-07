import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockUsers } from '../data/mockData';

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
        <div className="bg-white p-6 shadow-xl rounded-2xl">
            <h3 className="text-center text-lg font-bold text-brand-dark mb-4">{t.demoAccountsTitle}</h3>
            <div className="space-y-4">
                {users.map(user => user && (
                    <div key={user.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-bold text-brand-primary">{roleTranslations[user.role] || user.role}</p>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-slate-600 truncate pr-2" title={user.email}>{user.email}</span>
                             <button onClick={() => handleCopy(user.email, `${user.id}-email`)} className="flex items-center text-sm text-slate-500 hover:text-brand-primary font-medium p-1 rounded-md transition-colors">
                                {copiedField === `${user.id}-email` ? <><CheckIcon className="text-green-500"/> <span className="ml-1 text-green-500">{t.copied}</span></> : <><ClipboardIcon className="mr-1"/> {t.copyEmail}</>}
                            </button>
                        </div>
                         <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-slate-600">••••••••</span>
                            <button onClick={() => handleCopy(user.password, `${user.id}-password`)} className="flex items-center text-sm text-slate-500 hover:text-brand-primary font-medium p-1 rounded-md transition-colors">
                                {copiedField === `${user.id}-password` ? <><CheckIcon className="text-green-500"/> <span className="ml-1 text-green-500">{t.copied}</span></> : <><ClipboardIcon className="mr-1"/> {t.copyPassword}</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const LoginPage: React.FC = () => {
    const { login, user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

    useEffect(() => {
        if (user) {
            const dashboardMap = {
                admin: '/admin',
                authority: '/authority',
                volunteer: '/volunteer',
                user: '/profile'
            };
            const defaultRedirect = dashboardMap[user.role] || '/profile';
            navigate(redirectPath === '/' ? defaultRedirect : redirectPath, { replace: true });
        }
    }, [user, navigate, redirectPath]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = (role: 'user' | 'admin' | 'authority' | 'volunteer') => {
        setError('');
        setLoading(true);
        const userToLogin = mockUsers.find(u => u.role === role);
        if (userToLogin) {
            // Using a slight delay to allow UI to update to loading state
            setTimeout(async () => {
                try {
                    await login(userToLogin.email, userToLogin.password);
                } catch (err: any) {
                    setError(err.message);
                    setLoading(false);
                }
            }, 100);
        }
    }
    
    const demoUsers = [
        mockUsers.find(u => u.role === 'user'),
        mockUsers.find(u => u.role === 'admin'),
        mockUsers.find(u => u.role === 'authority'),
        mockUsers.find(u => u.role === 'volunteer'),
    ].filter(Boolean);

    return (
        <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-brand-dark">
                        {t.loginTitle}
                    </h2>
                     <p className="mt-2 text-center text-sm text-slate-600">
                        {t.loginNoAccount}{' '}
                        <a href="#" className="font-medium text-brand-primary hover:text-brand-primary/80">
                            {t.loginSignUp}
                        </a>
                    </p>
                </div>
                
                <div className="bg-white p-8 shadow-xl rounded-2xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                                {t.loginEmail}
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                                    {t.loginPassword}
                                </label>
                                 <div className="text-sm">
                                    <a href="#" className="font-semibold text-brand-primary hover:text-brand-primary/80">
                                        {t.loginForgotPassword}
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        
                        {error && (
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md bg-brand-secondary px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary disabled:opacity-50"
                            >
                                {loading ? t.signingIn : t.loginButton}
                            </button>
                        </div>
                    </form>

                     <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm font-medium leading-6">
                                <span className="bg-white px-6 text-gray-600">{t.quickLoginTitle}</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button onClick={() => handleQuickLogin('user')} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-md bg-blue-500 px-3 py-2 text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 hover:bg-blue-600 disabled:opacity-50">{t.quickLoginCitizen}</button>
                            <button onClick={() => handleQuickLogin('admin')} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-md bg-red-500 px-3 py-2 text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 hover:bg-red-600 disabled:opacity-50">{t.quickLoginAdmin}</button>
                            <button onClick={() => handleQuickLogin('authority')} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-md bg-purple-500 px-3 py-2 text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 hover:bg-purple-600 disabled:opacity-50">{t.quickLoginAuthority}</button>
                            <button onClick={() => handleQuickLogin('volunteer')} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-md bg-green-500 px-3 py-2 text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 hover:bg-green-600 disabled:opacity-50">{t.quickLoginVolunteer}</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="w-full max-w-md mt-8">
                <DemoAccounts users={demoUsers} />
            </div>
        </div>
    );
};

export default LoginPage;