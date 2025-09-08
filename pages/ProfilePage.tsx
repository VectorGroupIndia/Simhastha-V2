import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, FullUser, User } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ReportDetailsModal from '../components/ReportDetailsModal';
import Spinner from '../components/Spinner';
import { Group } from '../data/mockData';
import GroupDashboard from '../components/group/GroupDashboard';
import CreateGroup from '../components/group/CreateGroup';
import { useNotification } from '../contexts/NotificationContext';


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

type ActiveTab = 'reports' | 'group' | 'settings';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    
    const [activeTab, setActiveTab] = useState<ActiveTab>('reports');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        try {
            const allReportsStr = localStorage.getItem('foundtastic-all-reports');
            if (allReportsStr) {
                setReports(JSON.parse(allReportsStr)); 
            }
        } catch (e) { console.error("Failed to load reports", e); }
    }, []);

    const reportSummary = useMemo(() => {
        const lostCount = reports.filter(r => r.type === 'lost').length;
        const foundCount = reports.filter(r => r.type === 'found').length;
        const resolvedCount = reports.filter(r => r.status === 'resolved').length;
        return { lostCount, foundCount, resolvedCount };
    }, [reports]);

    if (!user) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <p>{t.profileLoading}</p>
            </div>
        );
    }
    
    const TabButton: React.FC<{ tabName: ActiveTab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-brand-primary text-white' : 'bg-black/20 text-slate-300 hover:bg-black/30'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="relative isolate overflow-hidden min-h-screen py-16">
            <BackgroundBlobs />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div className="max-w-4xl mx-auto">
                    {/* User Header */}
                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-t-2xl border-x border-t border-white/20 shadow-2xl">
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
                        <div className="mt-6 border-t border-white/20 pt-4 flex justify-around text-center">
                            <div>
                                <p className="text-2xl font-bold text-white">{reportSummary.lostCount}</p>
                                <p className="text-sm text-slate-300">{t.profileFilterLost}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{reportSummary.foundCount}</p>
                                <p className="text-sm text-slate-300">{t.profileFilterFound}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-400">{reportSummary.resolvedCount}</p>
                                <p className="text-sm text-slate-300">{t.status.resolved}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tab Navigation */}
                    <div className="bg-black/20 backdrop-blur-lg p-2 flex space-x-2 border-x border-white/20">
                        <TabButton tabName="reports" label={t.profileMyReports} />
                        <TabButton tabName="group" label={t.myGroupTitle} />
                        <TabButton tabName="settings" label={t.adminSidebarSettings} />
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-b-2xl border-x border-b border-white/20 shadow-2xl">
                        {activeTab === 'reports' && <ReportsTab reports={reports} onSelectReport={setSelectedReport} />}
                        {activeTab === 'group' && <GroupTab />}
                        {activeTab === 'settings' && <SettingsTab />}
                    </div>
                </div>
            </div>
            {selectedReport && <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
        </div>
    );
};

// --- Reports Tab Component ---
const ReportsTab: React.FC<{ reports: Report[]; onSelectReport: (report: Report) => void }> = ({ reports, onSelectReport }) => {
    const { t, translateStatus } = useLanguage();
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [sortOption, setSortOption] = useState<string>('date_desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
            if (sortKey === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            else if (sortKey === 'item') comparison = a.item.localeCompare(b.item);
            else if (sortKey === 'status') comparison = a.status.localeCompare(b.status);
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [reports, filter, startDate, endDate, sortOption]);

    const clearSortAndFilters = () => {
        setSortOption('date_desc');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div>
            <div className="p-4 bg-black/20 rounded-lg border border-white/10 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">{t.profileFilterAll}</label>
                        <div className="mt-1 flex space-x-1 bg-black/20 p-1 rounded-md">
                            <button onClick={() => setFilter('all')} className={`w-full py-1 text-xs font-medium rounded ${filter === 'all' ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}>{t.profileFilterAll}</button>
                            <button onClick={() => setFilter('lost')} className={`w-full py-1 text-xs font-medium rounded ${filter === 'lost' ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}>{t.profileFilterLost}</button>
                            <button onClick={() => setFilter('found')} className={`w-full py-1 text-xs font-medium rounded ${filter === 'found' ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-white/10'}`}>{t.profileFilterFound}</button>
                        </div>
                    </div>
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
                            <button onClick={() => onSelectReport(report)} className="w-full sm:w-auto px-4 py-2 bg-brand-secondary text-white font-semibold text-sm rounded-md hover:opacity-90 transition-opacity">
                                {t.profileViewDetails}
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-400 py-8">{t.profileNoReports}</p>
                )}
            </div>
        </div>
    );
};


// --- Group Tab Component ---
const GroupTab: React.FC = () => {
    const { user, updateUserData } = useAuth();
    const { t } = useLanguage();
    const { addNotification } = useNotification();
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [allUsers, setAllUsers] = useState<FullUser[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    
    const activeGroup = useMemo(() => myGroups.find(g => g.id === user?.activeGroupId), [myGroups, user?.activeGroupId]);
    const activeGroupMembers = useMemo(() => {
        if (!activeGroup) return [];
        return allUsers.filter(u => activeGroup.memberIds.includes(u.id));
    }, [activeGroup, allUsers]);

    const loadGroupData = useCallback(() => {
        if (!user) return;
        try {
            const allUsersStr = localStorage.getItem('foundtastic-all-users');
            const allGroupsStr = localStorage.getItem('foundtastic-all-groups');
            const loadedUsers: FullUser[] = allUsersStr ? JSON.parse(allUsersStr) : [];
            const loadedGroups: Group[] = allGroupsStr ? JSON.parse(allGroupsStr) : [];
            setAllUsers(loadedUsers);
            const currentUserData = loadedUsers.find(u => u.id === user.id);
            setMyGroups(currentUserData ? loadedGroups.filter(g => currentUserData.groupIds.includes(g.id)) : []);
        } catch (error) { console.error("Failed to load group data:", error); }
    }, [user]);

    useEffect(() => { loadGroupData(); }, [loadGroupData]);

    const handleCreateGroup = (groupName: string) => {
        if (!user || groupName.trim() === '') return;
        try {
            let allGroups: Group[] = JSON.parse(localStorage.getItem('foundtastic-all-groups') || '[]');
            let allUsers: FullUser[] = JSON.parse(localStorage.getItem('foundtastic-all-users') || '[]');
            const newGroup: Group = { id: `g${Date.now()}`, name: groupName, adminId: user.id, memberIds: [user.id] };
            localStorage.setItem('foundtastic-all-groups', JSON.stringify([...allGroups, newGroup]));
            localStorage.setItem('foundtastic-all-users', JSON.stringify(allUsers.map(u => u.id === user.id ? { ...u, groupIds: [...u.groupIds, newGroup.id] } : u)));
            updateUserData({ groupIds: [...user.groupIds, newGroup.id], activeGroupId: newGroup.id });
            loadGroupData();
            setIsCreating(false);
        } catch (error) { console.error("Failed to create group:", error); }
    };
    
    if (isCreating) {
        return <div className="text-white"><CreateGroup onCreateGroup={handleCreateGroup} onCancel={() => setIsCreating(false)} /></div>;
    }
    
    if (activeGroup) {
        return <div className="text-white"><GroupDashboard group={activeGroup} members={activeGroupMembers} onGroupUpdate={loadGroupData} /></div>;
    }

    return (
        <div className="text-center text-white">
            <h2 className="text-xl font-semibold mb-4">{t.noActiveGroupTitle}</h2>
            <p className="text-slate-300 mb-6">{t.noActiveGroupCreate}</p>
            <button onClick={() => setIsCreating(true)} className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:opacity-90">
                {t.createFirstGroupButton}
            </button>
        </div>
    );
};


// --- Toggle Switch Component for Settings ---
const ToggleSwitch: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}> = ({ label, description, enabled, setEnabled }) => {
    return (
        <div className="flex items-center justify-between">
            <span className="flex flex-grow flex-col">
                <span className="text-sm font-medium text-slate-100">{label}</span>
                <span className="text-sm text-slate-400">{description}</span>
            </span>
            <button
                type="button"
                className={`${enabled ? 'bg-brand-secondary' : 'bg-slate-500/50'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-brand-glass-bg`}
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
            >
                <span className="sr-only">Use setting</span>
                <span
                    aria-hidden="true"
                    className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};


// --- Settings Tab Component ---
const SettingsTab: React.FC = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const { t } = useLanguage();
    const [profileData, setProfileData] = useState({ name: user?.name || '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [notificationPrefs, setNotificationPrefs] = useState({
        emailOnMatch: true,
        emailOnStatusUpdate: false,
    });
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
        
        try {
            if (profileData.name.trim() !== user.name) {
                if (!profileData.name.trim()) {
                    setErrors(prev => ({ ...prev, name: t.formErrors.nameRequired }));
                    setIsSaving(false); return;
                }
                await updateProfile(user.id, profileData.name.trim());
                hasChanges = true;
            }

            const { currentPassword, newPassword, confirmPassword } = passwordData;
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword) setErrors(prev => ({ ...prev, currentPassword: t.formErrors.currentPasswordRequired }));
                else if (newPassword.length < 8) setErrors(prev => ({ ...prev, newPassword: t.formErrors.passwordLength }));
                else if (newPassword !== confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: t.formErrors.passwordMatch }));
                else {
                    await changePassword(user.email, currentPassword, newPassword);
                    hasChanges = true;
                }
            }
            
            // In a real app, notificationPrefs would also be saved to a backend here.
            // For this demo, we assume hasChanges should also cover notification preference changes.
            // A simple way is to just assume they might have changed and show success.
            hasChanges = true; // Simplified for demo purposes.


            if (Object.keys(errors).length === 0 && hasChanges) {
                setSuccessMessage(t.profileUpdatedSuccess);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                 setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
            }
        } catch (error: any) { setErrors(prev => ({ ...prev, form: error.message }));
        } finally { setIsSaving(false); }
    };
    
    const getInputClassName = (field: string) => `block w-full rounded-md border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ${errors[field] ? 'ring-red-500/50' : 'ring-white/20'} placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-secondary sm:text-sm sm:leading-6`;

    return (
        <form onSubmit={handleSaveProfile} className="space-y-8">
            {errors.form && <p className="mb-4 text-sm text-red-400 text-center">{errors.form}</p>}
            {successMessage && <p className="mb-4 text-sm text-green-400 text-center">{successMessage}</p>}
            
            {/* Basic Info */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">{t.profileEditTitle}</h3>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-300">{t.contactFormName}</label>
                    <div className="mt-2">
                        <input type="text" id="name" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} className={getInputClassName('name')} />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>
            </div>

            {/* Change Password */}
            <div className="border-t border-white/20 pt-8">
                <h3 className="text-lg font-semibold text-white mb-4">{t.changePasswordTitle}</h3>
                <div className="space-y-4">
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

             {/* Notification Settings */}
            <div className="border-t border-white/20 pt-8">
                <h3 className="text-lg font-semibold text-white mb-4">{t.notificationSettingsTitle}</h3>
                <div className="space-y-6">
                    <ToggleSwitch
                        label={t.emailOnMatchLabel}
                        description={t.emailOnMatchDesc}
                        enabled={notificationPrefs.emailOnMatch}
                        setEnabled={(enabled) => setNotificationPrefs(p => ({ ...p, emailOnMatch: enabled }))}
                    />
                    <ToggleSwitch
                        label={t.emailOnStatusUpdateLabel}
                        description={t.emailOnStatusUpdateDesc}
                        enabled={notificationPrefs.emailOnStatusUpdate}
                        setEnabled={(enabled) => setNotificationPrefs(p => ({ ...p, emailOnStatusUpdate: enabled }))}
                    />
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


export default ProfilePage;