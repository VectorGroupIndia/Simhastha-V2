import React, { useState } from 'react';
import { useAuth, User } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from './Spinner';

interface ProfileSettingsProps {
    user: User;
    isModal?: boolean;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, isModal = false }) => {
    const { updateProfile, changePassword } = useAuth();
    const { t } = useLanguage();
    const [profileData, setProfileData] = useState({ name: user?.name || '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setErrors({});
        setSuccessMessage('');
        setIsSaving(true);
        let hasChanges = false;
        let formErrors: Record<string, string> = {};
        
        try {
            // Password validation first
            const { currentPassword, newPassword, confirmPassword } = passwordData;
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword) formErrors.currentPassword = t.formErrors.currentPasswordRequired;
                if (newPassword.length > 0 && newPassword.length < 8) formErrors.newPassword = t.formErrors.passwordLength;
                if (newPassword !== confirmPassword) formErrors.confirmPassword = t.formErrors.passwordMatch;
                
                if (Object.keys(formErrors).length === 0 && currentPassword && newPassword) {
                    await changePassword(user.email, currentPassword, newPassword);
                    hasChanges = true;
                }
            }
            
            // Name validation
            if (profileData.name.trim() !== user.name) {
                if (!profileData.name.trim()) {
                    formErrors.name = t.formErrors.nameRequired;
                } else {
                     await updateProfile(user.id, profileData.name.trim());
                     hasChanges = true;
                }
            }

            setErrors(formErrors);

            if (Object.keys(formErrors).length === 0 && hasChanges) {
                setSuccessMessage(t.profileUpdatedSuccess);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error: any) { 
            setErrors(prev => ({ ...prev, form: error.message }));
        } finally { 
            setIsSaving(false); 
        }
    };
    
    const getInputClassName = (field: string) => `block w-full rounded-md border-0 py-2 px-3 ${isModal ? 'bg-slate-100 text-gray-900 ring-slate-300 placeholder:text-slate-400 focus:ring-brand-primary' : 'bg-white/10 text-white ring-white/20 placeholder:text-slate-400 focus:ring-brand-secondary'} shadow-sm ring-1 ring-inset ${errors[field] ? (isModal ? 'ring-red-400' : 'ring-red-500/50') : ''}  focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`;
    const labelClassName = isModal ? 'text-slate-700' : 'text-slate-300';
    const textColor = isModal ? 'text-gray-800' : 'text-white';
    const errorColor = isModal ? 'text-red-600' : 'text-red-400';
    const successColor = isModal ? 'text-green-600' : 'text-green-400';
    const borderColor = isModal ? 'border-gray-200' : 'border-white/20';

    return (
        <form onSubmit={handleSaveProfile} className="space-y-8">
            {errors.form && <p className={`mb-4 text-sm ${errorColor} text-center`}>{errors.form}</p>}
            {successMessage && <p className={`mb-4 text-sm ${successColor} text-center`}>{successMessage}</p>}
            
            <div>
                <h3 className={`text-lg font-semibold ${textColor} mb-4`}>{t.profileEditTitle}</h3>
                <div>
                    <label htmlFor="name" className={`block text-sm font-medium leading-6 ${labelClassName}`}>{t.contactFormName}</label>
                    <div className="mt-2">
                        <input type="text" id="name" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} className={getInputClassName('name')} />
                    </div>
                    {errors.name && <p className={`mt-1 text-sm ${errorColor}`}>{errors.name}</p>}
                </div>
            </div>

            <div className={`border-t ${borderColor} pt-8`}>
                <h3 className={`text-lg font-semibold ${textColor} mb-4`}>{t.changePasswordTitle}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className={`block text-sm font-medium leading-6 ${labelClassName}`}>{t.currentPassword}</label>
                        <input type="password" id="currentPassword" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={getInputClassName('currentPassword')} />
                        {errors.currentPassword && <p className={`mt-1 text-sm ${errorColor}`}>{errors.currentPassword}</p>}
                    </div>
                     <div>
                        <label htmlFor="newPassword" className={`block text-sm font-medium leading-6 ${labelClassName}`}>{t.newPassword}</label>
                        <input type="password" id="newPassword" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={getInputClassName('newPassword')} />
                        {errors.newPassword && <p className={`mt-1 text-sm ${errorColor}`}>{errors.newPassword}</p>}
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className={`block text-sm font-medium leading-6 ${labelClassName}`}>{t.confirmNewPassword}</label>
                        <input type="password" id="confirmPassword" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={getInputClassName('confirmPassword')} />
                        {errors.confirmPassword && <p className={`mt-1 text-sm ${errorColor}`}>{errors.confirmPassword}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                 <button type="submit" disabled={isSaving} className="flex justify-center items-center rounded-md bg-brand-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50">
                    {isSaving && <Spinner size="sm" className="mr-2" />}
                    {t.saveChanges}
                </button>
            </div>
        </form>
    );
};

export default ProfileSettings;
