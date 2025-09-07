import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockReports, mockUsers } from '../../data/mockData';
import { Report } from '../ProfilePage';
import DashboardHeader from '../../components/DashboardHeader';
import { PlatformSettings } from './SettingsPage';

interface SuspiciousReport extends Report {
    reporterName: string;
    reporterEmail: string;
    reason: string;
}

const HIGH_FREQUENCY_THRESHOLD = 3; // reports

const FraudDetection: React.FC = () => {
    const { t } = useLanguage();
    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<typeof mockUsers>([]);
    const [settings, setSettings] = useState<PlatformSettings | null>(null);

    useEffect(() => {
        try {
            const storedReports = localStorage.getItem('foundtastic-all-reports');
            setReports(storedReports ? JSON.parse(storedReports) : mockReports);
            const storedUsers = localStorage.getItem('foundtastic-all-users');
            setUsers(storedUsers ? JSON.parse(storedUsers) : mockUsers);
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
        
        const reportCountsByUser: { [email: string]: number } = {};
        reports.forEach((_, index) => {
            const user = users[index % users.length];
            if (user) {
                reportCountsByUser[user.email] = (reportCountsByUser[user.email] || 0) + 1;
            }
        });

        const flaggedReports: { [id: string]: SuspiciousReport } = {};

        reports.forEach((report, index) => {
            const reporter = users[index % users.length];
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
            if (reportCountsByUser[reporter.email] > HIGH_FREQUENCY_THRESHOLD) {
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
                                            <button className="text-indigo-600 hover:text-indigo-900">{t.fraudActionViewReport}</button>
                                            <button className="ml-4 text-indigo-600 hover:text-indigo-900">{t.fraudActionViewUser}</button>
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
            </main>
        </div>
    );
};

export default FraudDetection;