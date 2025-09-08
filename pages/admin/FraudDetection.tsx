import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockReports, mockUsers } from '../../data/mockData';
import { Report } from '../ProfilePage';
import DashboardHeader from '../../components/DashboardHeader';
import { PlatformSettings } from './SettingsPage';
import ReportDetailsModal from '../../components/ReportDetailsModal';
import { FullUser } from '../../contexts/AuthContext';

interface SuspiciousReport extends Report {
    reporterName: string;
    reporterEmail: string;
    reason: string;
}

const HIGH_FREQUENCY_THRESHOLD = 3; // reports

const UserDetailsModal: React.FC<{ user: FullUser; onClose: () => void; }> = ({ user, onClose }) => {
    const { t } = useLanguage();
    const [userReports, setUserReports] = useState<Report[]>([]);

    useEffect(() => {
        try {
            const allReportsStr = localStorage.getItem('foundtastic-all-reports');
            if (allReportsStr) {
                const allReports: Report[] = JSON.parse(allReportsStr);
                const assignedReports = allReports.filter(r => r.reporterId === user.id);
                setUserReports(assignedReports);
            }
        } catch (e) {
            console.error("Failed to load reports for user", e);
        }
    }, [user.id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 relative max-h-[90vh] overflow-y-auto">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="flex items-center space-x-4 border-b pb-4 mb-4">
                        <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500">Role: {user.role}</p>
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Reporting History ({userReports.length} reports)</h3>
                    <div className="space-y-2">
                        {userReports.length > 0 ? userReports.map(report => (
                            <div key={report.id} className="p-2 border rounded-md bg-gray-50 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm text-gray-800">{report.item}</p>
                                    <p className="text-xs text-gray-500">{report.date} - {report.status}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${report.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {report.type}
                                </span>
                            </div>
                        )) : <p className="text-sm text-gray-500">No reporting history found for this user.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};


const FraudDetection: React.FC = () => {
    const { t } = useLanguage();
    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<FullUser[]>([]);
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    const [viewingUser, setViewingUser] = useState<FullUser | null>(null);

    useEffect(() => {
        try {
            const storedReports = localStorage.getItem('foundtastic-all-reports');
            setReports(storedReports ? JSON.parse(storedReports) : mockReports);
            const storedUsers = localStorage.getItem('foundtastic-all-users');
            setUsers(storedUsers ? JSON.parse(storedUsers) : mockUsers as FullUser[]);
            const storedSettings = localStorage.getItem('foundtastic-settings');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    const suspiciousReports = useMemo((): SuspiciousReport[] => {
        if (!reports.length || !users.length) return [];

        const highValueKeywords = settings?.highValueKeywords
            ? settings.highValueKeywords.split(',').map(k => k.trim().toLowerCase())
            : ['iphone', 'laptop', 'camera', 'jewelry', 'macbook', 'dslr', 'drone'];
        const shortDescThreshold = 50;
        
        const reportCountsByUserId: { [id: string]: number } = {};
        reports.forEach(report => {
            reportCountsByUserId[report.reporterId] = (reportCountsByUserId[report.reporterId] || 0) + 1;
        });

        const flaggedReports: { [id: string]: SuspiciousReport } = {};

        reports.forEach(report => {
            const reporter = users.find(u => u.id === report.reporterId);
            if (!reporter) return;

            // Rule 1: High-value item with a short description
            const isHighValue = highValueKeywords.some(keyword => report.item.toLowerCase().includes(keyword));
            if (isHighValue && report.description.length < shortDescThreshold) {
                flaggedReports[report.id] = {
                    ...report,
                    reporterName: reporter.name,
                    reporterEmail: reporter.email,
                    reason: t.fraudReasonHighValue
                };
            }

            // Rule 2: User with high frequency of reports
            if (reportCountsByUserId[reporter.id] > HIGH_FREQUENCY_THRESHOLD) {
                flaggedReports[report.id] = {
                    ...report,
                    reporterName: reporter.name,
                    reporterEmail: reporter.email,
                    reason: flaggedReports[report.id] ? `${flaggedReports[report.id].reason}, ${t.fraudReasonHighFrequency}` : t.fraudReasonHighFrequency,
                };
            }
        });

        return Object.values(flaggedReports);
    }, [reports, users, t, settings]);
    
    const handleViewUser = (email: string) => {
        const userToView = users.find(u => u.email === email);
        if (userToView) {
            setViewingUser(userToView);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.fraudDashboardTitle} />
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-8">
                    <h3 className="font-bold text-yellow-800">How this works</h3>
                    <p className="text-sm text-yellow-700">{t.fraudDashboardDesc}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadItem}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.fraudTableHeadUser}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.fraudTableHeadReason}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadDate}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminUsersTableHeadActions}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {suspiciousReports.length > 0 ? suspiciousReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-red-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{report.item}</div>
                                            <div className="text-xs text-gray-500">ID: {report.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{report.reporterName}</div>
                                            <div className="text-xs text-gray-500">{report.reporterEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700 font-semibold">{report.reason}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => setViewingReport(report)} className="text-indigo-600 hover:text-indigo-900">{t.fraudActionViewReport}</button>
                                            <button onClick={() => handleViewUser(report.reporterEmail)} className="ml-4 text-indigo-600 hover:text-indigo-900">{t.fraudActionViewUser}</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t.fraudNoSuspiciousReports}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {viewingReport && <ReportDetailsModal report={viewingReport} onClose={() => setViewingReport(null)} />}
                {viewingUser && <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />}
            </main>
        </div>
    );
};

export default FraudDetection;