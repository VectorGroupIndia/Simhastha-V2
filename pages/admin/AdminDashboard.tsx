

import React from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockUsers, mockReports } from '../../data/mockData';
import DashboardHeader from '../../components/DashboardHeader';

// Icons for Stat Cards
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197z" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ResolvedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SuspendedUserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// Icons for Activity Feed
const UserMinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zm12-2h-6" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const UserCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zm4-3l2 2 4-4" /></svg>;

type ActivityAction = 'suspended' | 'updated_status' | 'activated';

const mockActivities: {
    id: string;
    user: string;
    action: ActivityAction;
    target: string;
    details?: string;
    timestamp: string;
}[] = [
    { id: 'act1', user: 'Admin User', action: 'suspended', target: 'Anjali Gupta', timestamp: '2 hours ago' },
    { id: 'act2', user: 'Admin User', action: 'updated_status', target: 'iPhone 14 Pro', details: 'In Review', timestamp: '5 hours ago' },
    { id: 'act3', user: 'Admin User', action: 'updated_status', target: 'Child\'s Blue Backpack', details: 'Resolved', timestamp: '1 day ago' },
    { id: 'act4', user: 'Admin User', action: 'activated', target: 'Anjali Gupta', timestamp: '2 days ago' },
];

const activityConfig: Record<ActivityAction, { icon: JSX.Element; color: string }> = {
    suspended: { icon: <UserMinusIcon />, color: 'bg-red-100 text-red-600' },
    updated_status: { icon: <DocumentTextIcon />, color: 'bg-blue-100 text-blue-600' },
    activated: { icon: <UserCheckIcon />, color: 'bg-green-100 text-green-600' },
};


const AdminDashboard: React.FC = () => {
    const { t } = useLanguage();

    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.status === 'active').length;
    const suspendedUsers = mockUsers.filter(u => u.status === 'suspended').length;
    const totalReports = mockReports.length;
    const resolvedReports = mockReports.filter(r => r.status === 'resolved').length;
    
    const renderActivityText = (activity: typeof mockActivities[0]) => {
        const { action, target, details } = activity;
        const targetElement = <strong className="font-semibold text-gray-900">{target}</strong>;
        
        switch(action) {
            case 'suspended': {
                const parts = t.adminActivity.suspendedUser.split('{target}');
                return <>{parts[0]}{targetElement}{parts[1]}</>;
            }
            case 'updated_status': {
                const detailsElement = <strong className="font-semibold text-gray-900">{details}</strong>;
                const parts = t.adminActivity.updatedStatus.split('{target}');
                const remainingParts = parts[1].split('{details}');
                return <>{parts[0]}{targetElement}{remainingParts[0]}{detailsElement}{remainingParts[1]}</>
            }
            case 'activated': {
                const parts = t.adminActivity.activatedUser.split('{target}');
                return <>{parts[0]}{targetElement}{parts[1]}</>;
            }
            default: return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.adminDashboard} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <StatCard title={t.adminTotalUsers} value={totalUsers} icon={<UsersIcon />} />
                    <StatCard title={t.adminActiveUsers} value={activeUsers} icon={<ResolvedIcon />} />
                    <StatCard title={t.adminSuspendedUsers} value={suspendedUsers} icon={<SuspendedUserIcon />} />
                    <StatCard title={t.adminTotalReports} value={totalReports} icon={<ReportsIcon />} />
                    <StatCard title={t.adminResolvedReports} value={resolvedReports} icon={<ResolvedIcon />} />
                </div>
                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-2">{t.adminRecentActivity}</h2>
                     <ul className="divide-y divide-gray-200">
                        {mockActivities.map(activity => (
                            <li key={activity.id} className="py-4 flex items-start">
                                <div className={`p-2 rounded-full mr-4 ${activityConfig[activity.action].color}`}>
                                    {activityConfig[activity.action].icon}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-600">
                                        <strong className="font-semibold text-gray-900">{activity.user}</strong>{' '}
                                        {renderActivityText(activity)}
                                    </p>
                                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;