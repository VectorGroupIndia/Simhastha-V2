import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockReports, mockUsers, mockAnnouncements, mockSosRequests } from '../../data/mockData';
import { Report, ReportStatus } from '../ProfilePage';
import DashboardHeader from '../../components/DashboardHeader';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import ConfirmationModal from '../../components/ConfirmationModal';
import { SosRequest } from '../volunteer/VolunteerDashboard';
import AuthoritySidebar from './components/AuthoritySidebar';
import { Link } from 'react-router-dom';
import { useAuth, FullUser } from '../../contexts/AuthContext';
import ProfileModal from '../../components/ProfileModal';
import LiveMapModal from '../LiveMapPage';

// Icons
const SosIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M11.636 8.364a5 5 0 010 7.072M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg>;
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;


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
    const { user } = useAuth();
    const [pendingReports, setPendingReports] = useState<Report[]>([]);
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
    const [selectedSos, setSelectedSos] = useState<SosRequest | null>(null);
    const [sosToResolve, setSosToResolve] = useState<SosRequest | null>(null);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastSuccess, setBroadcastSuccess] = useState(false);
    const [reportToAction, setReportToAction] = useState<{ report: Report; action: 'verify' | 'reject' } | null>(null);
    const volunteers = mockUsers.filter(u => u.role === 'volunteer');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const loadSosData = () => {
        try {
            const storedSos = localStorage.getItem('foundtastic-sos-requests');
            const sosData = storedSos ? JSON.parse(storedSos) : mockSosRequests;
            // Sort by recency, but keep resolved at the bottom
            sosData.sort((a: SosRequest, b: SosRequest) => {
                if (a.status === 'resolved' && b.status !== 'resolved') return 1;
                if (b.status === 'resolved' && a.status !== 'resolved') return -1;
                // crude recency sort for demo
                if (a.timestamp.includes('Just now')) return -1;
                if (b.timestamp.includes('Just now')) return 1;
                return 0; 
            });
            setSosRequests(sosData);
        } catch (error) {
            console.error("Failed to load SOS requests from localStorage", error);
            setSosRequests(mockSosRequests);
        }
    };

    useEffect(() => {
        const loadInitialData = () => {
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
            loadSosData();
        };

        loadInitialData();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'foundtastic-sos-requests') {
                loadSosData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

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


    const handleReportAction = (report: Report, action: 'verify' | 'reject') => {
        setReportToAction({ report, action });
    };

    const handleConfirmReportAction = () => {
        if (!reportToAction) return;
        const { report, action } = reportToAction;
        const newStatus: ReportStatus = action === 'verify' ? 'in_review' : 'closed';
        
        const updatedReports = allReports.map(r => r.id === report.id ? { ...r, status: newStatus } : r);
        
        localStorage.setItem('foundtastic-all-reports', JSON.stringify(updatedReports));
        setAllReports(updatedReports);
        setPendingReports(prev => prev.filter(r => r.id !== report.id));
        setReportToAction(null);
    };

    const handleConfirmResolveSos = () => {
        if (!sosToResolve) return;
        const updatedSosRequests = sosRequests.map(sos => 
            sos.id === sosToResolve.id ? { ...sos, status: 'resolved' as const } : sos
        );
        setSosRequests(updatedSosRequests);
        localStorage.setItem('foundtastic-sos-requests', JSON.stringify(updatedSosRequests));
        setSosToResolve(null);
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

    const getSosStatusBadge = (sos: SosRequest) => {
        switch(sos.status) {
            case 'new':
                return <span className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">{t.authoritySosStatusNew}</span>;
            case 'acknowledged':
                return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">{t.authoritySosStatusAcknowledged.replace('{name}', sos.acknowledgedBy || 'Volunteer')}</span>;
            case 'resolved':
                return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">{t.authoritySosStatusResolved}</span>;
            default:
                return null;
        }
    };
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <AuthoritySidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.authorityDashboardTitle} onProfileClick={() => setIsProfileModalOpen(true)} />
                
                 <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <SosIcon className="h-6 w-6 text-red-500 mr-3 animate-pulse" />
                        {t.authorityLiveSosMonitor}
                    </h2>
                     <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                        {sosRequests.length > 0 ? sosRequests.map(sos => (
                            <div key={sos.id} className={`p-4 border-l-4 rounded-r-lg flex flex-col sm:flex-row sm:items-center sm:justify-between ${sos.status === 'new' ? 'border-red-500 bg-red-50' : sos.status === 'acknowledged' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                                <div>
                                    <p className="font-semibold text-gray-900">{sos.message}</p>
                                    <p className="text-sm text-gray-600">From: {sos.userName} | {sos.timestamp}</p>
                                </div>
                                <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                                    {getSosStatusBadge(sos)}
                                    <button onClick={() => setSelectedSos(sos)} className="px-3 py-1 text-sm font-medium text-brand-primary border border-brand-primary rounded-md hover:bg-brand-light">{t.authorityActionViewDetails}</button>
                                    {sos.status !== 'resolved' && (
                                        <button onClick={() => setSosToResolve(sos)} className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">{t.authorityActionMarkResolved}</button>
                                    )}
                                </div>
                            </div>
                        )) : <p className="text-center text-gray-500 py-8">{t.authorityNoSosAlerts}</p>}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Assigned Zone" value={user?.assignedZone || 'N/A'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                    <StatCard title={t.authorityPendingVerification} value={pendingReports.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title={t.authorityActiveVolunteers} value={volunteers.filter(v => v.status === 'active').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <StatCard title={t.authorityResolvedToday} value={7} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </div>
                
                {/* Analytics Section */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                         <h2 className="text-xl font-bold text-gray-800">{t.authorityReportsAnalytics}</h2>
                         <button onClick={handleExportCSV} className="px-4 py-2 bg-brand-primary text-white font-semibold text-sm rounded-md hover:bg-brand-primary/90 transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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
                        <div className="lg:col-span-3 bg-white p-4 rounded-lg border flex flex-col items-center justify-center min-h-[200px]">
                             <h3 className="text-lg font-semibold text-gray-700">{t.authorityLocationHeatmap}</h3>
                             <p className="text-gray-500 mt-2 text-center">View a live map of all reports, SOS alerts, and personnel locations to get a complete operational overview.</p>
                             <button onClick={() => setIsMapModalOpen(true)} className="mt-4 px-6 py-2 bg-brand-primary text-white font-semibold text-sm rounded-md hover:bg-brand-primary/90 transition-colors">
                                 Open Live Map
                             </button>
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
                                        <img src={report.imageUrls[0]} alt={report.item} className="w-12 h-12 object-cover rounded-md mr-4"/>
                                        <div>
                                            <p className="font-semibold text-gray-900">{report.item}</p>
                                            <p className="text-sm text-gray-500">{report.date} - {report.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleReportAction(report, 'verify')} className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">{t.authorityActionVerify}</button>
                                        <button onClick={() => handleReportAction(report, 'reject')} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">{t.authorityActionReject}</button>
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
            </main>

            {/* Resolve SOS Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!sosToResolve}
                onClose={() => setSosToResolve(null)}
                onConfirm={handleConfirmResolveSos}
                title={t.authorityActionMarkResolved}
                message={<p>Are you sure you want to mark this SOS alert for "<strong>{sosToResolve?.message}</strong>" as resolved?</p>}
                confirmText="Yes, mark as resolved"
                variant="info"
            />
            
            {/* Report Action Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!reportToAction}
                onClose={() => setReportToAction(null)}
                onConfirm={handleConfirmReportAction}
                title={`Confirm Report ${reportToAction?.action}`}
                message={<p>Are you sure you want to {reportToAction?.action} the report for <strong>{reportToAction?.report.item}</strong>?</p>}
                confirmText={`Yes, ${reportToAction?.action}`}
                variant={reportToAction?.action === 'reject' ? 'danger' : 'info'}
            />

            {/* SOS Details Modal */}
            {selectedSos && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedSos(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all" onClick={e => e.stopPropagation()}>
                        <div className="p-6 relative">
                            <button onClick={() => setSelectedSos(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="flex items-center mb-4">
                                <SosIcon className="h-8 w-8 text-red-500 mr-3" />
                                <h2 className="text-2xl font-bold text-red-800">{t.authoritySosDetailsTitle}</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg border">
                                    <h3 className="font-semibold text-slate-800 flex items-center mb-2"><InfoIcon className="w-5 h-5 mr-2 text-brand-primary" />{t.volunteerSosEmergencyDetails}</h3>
                                    <p className="text-slate-700">{selectedSos.details}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg border">
                                        <h3 className="font-semibold text-slate-800 mb-2">{t.volunteerSosContactPerson}</h3>
                                        <p className="text-slate-900 font-medium">{selectedSos.userName}</p>
                                        <p className="text-slate-600 text-sm mt-2">{t.volunteerSosContactNumber}</p>
                                        <p className="text-slate-900 font-medium">{selectedSos.contact}</p>
                                        <a href={`tel:${selectedSos.contact}`} className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                                            <PhoneIcon className="w-5 h-5 mr-2" />
                                            {t.volunteerSosCallNow}
                                        </a>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border">
                                        <h3 className="font-semibold text-slate-800 mb-2">{t.volunteerSosLocationMap}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{selectedSos.location.name}</p>
                                        <div className="h-40 rounded-md overflow-hidden border">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://maps.google.com/maps?q=${selectedSos.location.lat},${selectedSos.location.lng}&z=15&output=embed`}>
                                            </iframe>
                                        </div>
                                    </div>
                                </div>
                                 {selectedSos.acknowledgedBy && (
                                    <div className="p-3 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-md border border-yellow-200">
                                        This alert has been acknowledged by volunteer: <strong>{selectedSos.acknowledgedBy}</strong>.
                                    </div>
                                )}
                            </div>
                             <div className="mt-6 flex justify-end items-center gap-x-4">
                                <button onClick={() => setSelectedSos(null)} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300">
                                    {t.modalClose}
                                </button>
                                <button title="This feature requires backend integration" disabled className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md opacity-50 cursor-not-allowed">
                                    {t.authorityActionAssignVolunteer}
                                </button>
                            </div>
                        </div>
                    </div>
                 </div>
            )}

            {user && (
                <ProfileModal 
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={user as FullUser}
                />
            )}

            <LiveMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
        </div>
    );
};

export default AuthorityDashboard;