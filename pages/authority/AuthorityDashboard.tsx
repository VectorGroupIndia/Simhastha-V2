
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockReports, mockUsers, mockAnnouncements } from '../../data/mockData';
import { Report, ReportStatus } from '../ProfilePage';
import DashboardHeader from '../../components/DashboardHeader';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-blue-100 text-brand-primary p-3 rounded-full mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AuthorityDashboard: React.FC = () => {
    const { t, translateStatus } = useLanguage();
    const [pendingReports, setPendingReports] = useState<Report[]>([]);
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastSuccess, setBroadcastSuccess] = useState(false);
    const volunteers = mockUsers.filter(u => u.role === 'volunteer');

    useEffect(() => {
        try {
            const storedReports = localStorage.getItem('foundtastic-all-reports');
            if (storedReports) {
                const reports: Report[] = JSON.parse(storedReports);
                setAllReports(reports);
                setPendingReports(reports.filter(r => r.status === 'pending'));
            } else {
                 setAllReports(mockReports);
                 setPendingReports(mockReports.filter(r => r.status === 'pending'));
            }
        } catch (error) {
            console.error("Failed to load reports from localStorage", error);
        }
    }, []);

    const reportTypeData = useMemo(() => {
        const lostCount = allReports.filter(r => r.type === 'lost').length;
        const foundCount = allReports.filter(r => r.type === 'found').length;
        return [
            { label: t.profileFilterLost, value: lostCount, color: '#dc2626' },
            { label: t.profileFilterFound, value: foundCount, color: '#16a34a' },
        ];
    }, [allReports, t]);

    const reportStatusData = useMemo(() => {
        const statusCounts = allReports.reduce((acc, report) => {
            acc[report.status] = (acc[report.status] || 0) + 1;
            return acc;
        }, {} as Record<ReportStatus, number>);

        const statusOrder: ReportStatus[] = ['pending', 'in_review', 'resolved', 'closed'];
        const colors: Record<ReportStatus, string> = {
            pending: '#f59e0b',
            in_review: '#3b82f6',
            resolved: '#22c55e',
            closed: '#64748b',
        };

        return statusOrder.map(status => ({
            label: translateStatus(status),
            value: statusCounts[status] || 0,
            color: colors[status],
        }));
    }, [allReports, translateStatus]);


    const handleReportAction = (id: string, action: 'verify' | 'reject') => {
        // In a real app, this would update the backend. Here we just remove it from the queue.
        setPendingReports(pendingReports.filter(r => r.id !== id));
        alert(`Report ${id} has been ${action}ed.`);
    };

    const handleBroadcastSend = () => {
        if (!broadcastMessage.trim()) {
            return;
        }

        try {
            const storedAnnouncements = localStorage.getItem('foundtastic-announcements');
            const announcements = storedAnnouncements ? JSON.parse(storedAnnouncements) : mockAnnouncements;
            
            const newAnnouncement = {
                id: `an_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                message: broadcastMessage.trim(),
            };

            const updatedAnnouncements = [newAnnouncement, ...announcements];
            localStorage.setItem('foundtastic-announcements', JSON.stringify(updatedAnnouncements));
            
            setBroadcastMessage('');
            setBroadcastSuccess(true);
            setTimeout(() => setBroadcastSuccess(false), 3000);

        } catch (error) {
            console.error("Failed to send broadcast:", error);
        }
    };
    
    const handleExportCSV = () => {
        const headers = ['ID', 'Type', 'Item', 'Date', 'Status', 'Location', 'Description'];
        const rows = allReports.map(report => [
            report.id,
            report.type,
            `"${report.item.replace(/"/g, '""')}"`,
            report.date,
            report.status,
            `"${report.location.replace(/"/g, '""')}"`,
            `"${report.description.replace(/"/g, '""')}"`,
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "foundtastic_reports.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <DashboardHeader title={t.authorityDashboardTitle} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title={t.authorityPendingVerification} value={pendingReports.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title={t.authorityActiveVolunteers} value={volunteers.filter(v => v.status === 'active').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <StatCard title={t.authorityResolvedToday} value={7} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </div>
                
                {/* Analytics Section */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                         <h2 className="text-xl font-bold text-gray-800">{t.authorityReportsAnalytics}</h2>
                         <button onClick={handleExportCSV} className="px-4 py-2 bg-brand-primary text-white font-semibold text-sm rounded-md hover:bg-brand-primary/90 transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            {t.authorityExportCSV}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg border">
                             <h3 className="text-lg font-semibold text-center text-gray-700 mb-4">{t.authorityReportsByType}</h3>
                             <PieChart data={reportTypeData} />
                        </div>
                        <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg border">
                             <h3 className="text-lg font-semibold text-center text-gray-700 mb-4">{t.authorityReportsByStatus}</h3>
                             <BarChart data={reportStatusData} />
                        </div>
                        <div className="lg:col-span-3 bg-gray-50 p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]">
                             <h3 className="text-lg font-semibold text-gray-700">{t.authorityLocationHeatmap}</h3>
                             <p className="text-gray-500 mt-2">{t.comingSoon}</p>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mt-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                        </div>
                    </div>
                </div>


                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Reports Queue */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.authorityReportsQueue}</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {pendingReports.length > 0 ? pendingReports.map(report => (
                                <div key={report.id} className="p-4 border rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img src={report.imageUrl} alt={report.item} className="w-12 h-12 object-cover rounded-md mr-4"/>
                                        <div>
                                            <p className="font-semibold text-gray-900">{report.item}</p>
                                            <p className="text-sm text-gray-500">{report.date} - {report.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleReportAction(report.id, 'verify')} className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">{t.authorityActionVerify}</button>
                                        <button onClick={() => handleReportAction(report.id, 'reject')} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">{t.authorityActionReject}</button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-8">{t.authorityNoPendingReports}</p>}
                        </div>
                    </div>
                    {/* Volunteer & Broadcast */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">{t.authorityVolunteerManagement}</h2>
                            <ul className="space-y-3">
                                {volunteers.length > 0 ? volunteers.map(v => (
                                    <li key={v.id} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-800">{v.name}</span>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${v.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{v.status}</span>
                                    </li>
                                )) : <p className="text-gray-500">{t.authorityNoVolunteers}</p>}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold text-gray-800 mb-4">{t.authorityBroadcast}</h2>
                             <textarea 
                                rows={3} 
                                placeholder={t.authorityBroadcastPlaceholder} 
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-brand-primary focus:border-brand-primary"
                             ></textarea>
                             <button 
                                onClick={handleBroadcastSend}
                                className="mt-2 w-full bg-brand-secondary text-white font-semibold py-2 rounded-md hover:opacity-90"
                            >
                                {t.authorityBroadcastButton}
                            </button>
                            {broadcastSuccess && (
                                <div className="mt-3 p-3 bg-green-100 text-green-800 text-sm font-medium rounded-md border border-green-200 transition-opacity duration-300">
                                    Announcement sent successfully to all volunteers!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorityDashboard;
