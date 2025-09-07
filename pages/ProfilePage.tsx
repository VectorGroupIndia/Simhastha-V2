import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ReportDetailsModal from '../components/ReportDetailsModal';
import Spinner from '../components/Spinner';

export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'closed';

export interface Report {
    id: string;
    reportCategory: 'item' | 'person';
    type: 'lost' | 'found';
    // Union for item name or person name
    item: string; // Name of item or person
    description: string;
    date: string;
    status: ReportStatus;
    location: string;
    coords?: { lat: number; lng: number };
    imageUrl: string;
    matches?: string[];
    resolvedDate?: string;
    // Optional fields for persons
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
}

export const statusStyles: { [key in ReportStatus]: string } = {
    pending: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
    in_review: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    resolved: 'bg-green-400/20 text-green-300 border-green-400/30',
    closed: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
};

const BackgroundBlobs: React.FC = () => (
    <>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/30 rounded-full filter blur-3xl opacity-50 animate-float"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/30 rounded-full filter blur-3xl opacity-50 animate-float2"></div>
    </>
);

const ProfilePage: React.FC = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const { t, translateStatus } = useLanguage();
    
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({ name: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [sortOption, setSortOption] = useState<string>('date_desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name });
            try {
                const allReportsStr = localStorage.getItem('foundtastic-all-reports');
                if (allReportsStr) {
                    const allReports: Report[] = JSON.parse(allReportsStr);
                    setReports(allReports); 
                }
            } catch (e) {
                console.error("Failed to load reports from local storage", e);
            }
        }
    }, [user]);
    
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setErrors({});
        setSuccessMessage('');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        if(user) setProfileData({ name: user.name });
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        
        setErrors({});
        setSuccessMessage('');
        setIsSaving(true);
        let hasChanges = false;
        
        try {
            // Update name if changed
            if (profileData.name.trim() !== user.name) {
                if (!profileData.name.trim()) {
                    setErrors(prev => ({ ...prev, name: t.formErrors.nameRequired }));
                    setIsSaving(false);
                    return;
                }
                await updateProfile(user.id, profileData.name.trim());
                hasChanges = true;
            }

            // Update password if fields are filled
            const { currentPassword, newPassword, confirmPassword } = passwordData;
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword) {
                    setErrors(prev => ({ ...prev, currentPassword: t.formErrors.currentPasswordRequired }));
                } else if (newPassword.length < 8) {
                    setErrors(prev => ({ ...prev, newPassword: t.formErrors.passwordLength }));
                } else if (newPassword !== confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: t.formErrors.passwordMatch }));
                } else {
                    await changePassword(user.email, currentPassword, newPassword);
                    hasChanges = true;
                }
            }

            if (Object.keys(errors).length === 0 && hasChanges) {
                setSuccessMessage(t.profileUpdatedSuccess);
                setIsEditing(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
            
        } catch (error: any) {
            setErrors(prev => ({ ...prev, form: error.message }));
        } finally {
            setIsSaving(false);
        }
    };

    const processedReports = useMemo(() => {
        let filtered = reports.filter(report => {
            const matchesType = filter === 'all' || report.type === filter;

            const reportDate = new Date(report.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
            const matchesDate = (!start || reportDate >= start) && (!end || reportDate <= end);

            return matchesType && matchesDate;
        });

        const [sortKey, sortOrder] = sortOption.split('_');
        
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortKey) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'item':
                    comparison = a.item.localeCompare(b.item);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [reports, filter, startDate, endDate, sortOption]);

    const clearSortAndFilters = () => {
        setSortOption('date_desc');
        setStartDate('');
        setEndDate('');
    };
    
    const getInputClassName = (field: string) => `block w-full rounded-md border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ${errors[field] ? 'ring-red-500/50' : 'ring-white/20'} placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-secondary sm:text-sm sm:leading-6`;


    if (!user) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <p>{t.profileLoading}</p>
            </div>
        );
    }

    return (
        <div className="relative isolate overflow-hidden min-h-screen py-16">
            <BackgroundBlobs />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl mb-8">
                        {isEditing ? (
                            // EDITING VIEW
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">{t.profileEditTitle}</h2>
                                {errors.form && <p className="mb-4 text-sm text-red-400 text-center">{errors.form}</p>}
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-300">{t.contactFormName}</label>
                                        <div className="mt-2">
                                            <input type="text" id="name" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} className={getInputClassName('name')} />
                                        </div>
                                        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                                    </div>
                                    <div className="border-t border-white/20 pt-6">
                                        <h3 className="text-lg font-semibold text-white">{t.changePasswordTitle}</h3>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label htmlFor="currentPassword" className="block text-sm font-medium leading-6 text-slate-300">{t.currentPassword}</label>
                                                <input type="password" id="currentPassword" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={getInputClassName('currentPassword')} />
                                                {errors.currentPassword && <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>}
                                            </div>
                                             <div>
                                                <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-slate-300">{t.newPassword}</label>
                                                <input type="password" id="newPassword" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={getInputClassName('newPassword')} />
                                                {errors.newPassword && <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>}
                                            </div>
                                             <div>
                                                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-slate-300">{t.confirmNewPassword}</label>
                                                <input type="password" id="confirmPassword" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={getInputClassName('confirmPassword')} />
                                                {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-x-4">
                                        <button type="button" onClick={handleEditToggle} className="text-sm font-semibold leading-6 text-slate-300 hover:text-white">{t.cancelButton}</button>
                                        <button onClick={handleSaveProfile} disabled={isSaving} className="flex justify-center items-center rounded-md bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50">
                                            {isSaving && <Spinner size="sm" className="mr-2" />}
                                            {t.saveChanges}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // DISPLAY VIEW
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 bg-brand-primary/50 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                                        <p className="text-slate-300">{user.email}</p>
                                        <p className="text-slate-400 text-sm mt-1">{t.profileMemberSince} {user.memberSince}</p>
                                    </div>
                                </div>
                                <button onClick={handleEditToggle} className="rounded-md bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/30">{t.editProfile}</button>
                            </div>
                        )}
                         {successMessage && !isEditing && <p className="mt-4 text-sm text-green-400 text-center">{successMessage}</p>}
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/20 pb-4 mb-4">
                            <h2 className="text-2xl font-bold text-white">{t.profileMyReports}</h2>
                             <div className="mt-3 sm:mt-0 flex space-x-2">
                                <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-brand-primary text-white' : 'bg-black/20 text-slate-300 hover:bg-black/30'}`}>{t.profileFilterAll}</button>
                                <button onClick={() => setFilter('lost')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'lost' ? 'bg-brand-primary text-white' : 'bg-black/20 text-slate-300 hover:bg-black/30'}`}>{t.profileFilterLost}</button>
                                <button onClick={() => setFilter('found')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'found' ? 'bg-brand-primary text-white' : 'bg-black/20 text-slate-300 hover:bg-black/30'}`}>{t.profileFilterFound}</button>
                            </div>
                        </div>

                        <div className="p-4 bg-black/20 rounded-lg border border-white/10 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label htmlFor="sortOption" className="block text-sm font-medium text-slate-300">{t.profileSortBy}</label>
                                    <select id="sortOption" value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary text-white">
                                        <option value="date_desc">{t.sortDateNewest}</option>
                                        <option value="date_asc">{t.sortDateOldest}</option>
                                        <option value="item_asc">{t.sortItemAZ}</option>
                                        <option value="item_desc">{t.sortItemZA}</option>
                                        <option value="status_asc">{t.sortStatusAZ}</option>
                                        <option value="status_desc">{t.sortStatusZA}</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-300">{t.dateFrom}</label>
                                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary text-slate-300"/>
                                    </div>
                                     <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-300">{t.dateTo}</label>
                                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary text-slate-300"/>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button onClick={clearSortAndFilters} className="text-sm font-medium text-brand-secondary hover:text-brand-secondary/80">{t.clearFilters}</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {processedReports.length > 0 ? (
                                processedReports.map(report => (
                                    <div key={report.id} className="p-4 bg-black/20 border border-white/10 rounded-lg hover:shadow-lg transition-shadow flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                        <img src={report.imageUrl} alt={report.item} className="w-24 h-24 object-cover rounded-md bg-slate-100 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className={`text-xs font-bold uppercase ${report.type === 'lost' ? 'text-red-400' : 'text-green-400'}`}>{report.type}</span>
                                                    <h3 className="text-lg font-semibold text-white">{report.item}</h3>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-xs px-2 py-1 font-medium rounded-full border ${statusStyles[report.status]}`}>
                                                        {translateStatus(report.status)}
                                                    </span>
                                                    {report.matches && report.matches.length > 0 && (
                                                        <span className="mt-2 text-xs px-2 py-1 font-bold rounded-full bg-brand-secondary text-white">
                                                            {t.matchesFound}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">{t.profileReportedOn} {report.date}</p>
                                        </div>
                                        <button onClick={() => setSelectedReport(report)} className="w-full sm:w-auto px-4 py-2 bg-brand-secondary text-white font-semibold text-sm rounded-md hover:opacity-90 transition-opacity">
                                            {t.profileViewDetails}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-8">{t.profileNoReports}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {selectedReport && <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
        </div>
    );
};

export default ProfilePage;