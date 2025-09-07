import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { mockReports, mockAnnouncements, mockVolunteerTasks, mockSosRequests } from '../../data/mockData';
import DashboardHeader from '../../components/DashboardHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Link } from 'react-router-dom';
import { Report } from '../ProfilePage';

interface Announcement {
    id: string;
    date: string;
    message: string;
}

export interface SosRequest {
    id: string;
    type: 'emergency' | 'sighting';
    userName: string; // Name of person who triggered SOS or "Confirmed by Authority"
    message: string; // "Emergency assistance..." or "Sighting of [Person]"
    details: string; // Emergency details or link to report
    location: {
        name: string; // Camera location or user's last known location
        lat: number;
        lng: number;
    };
    timestamp: string;
    contact: string; // contact number or "N/A"
    status: 'new' | 'acknowledged' | 'resolved';
    acknowledgedBy?: string;
    sightingData?: {
        report: Report;
        snapshotUrl: string;
    }
}


// Icons
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SosIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M11.636 8.364a5 5 0 010 7.072M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SightingIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg>;
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const MapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.37-1.716-.998L9.75 7.5l-4.875-2.437c-.381-.19-.622-.58-.622-1.006V19.18c0 .836.88 1.37 1.716.998l4.875-2.437a1.5 1.5 0 011.022 0l4.122 2.061a1.5 1.5 0 001.022 0z" /></svg>;


const VolunteerDashboard: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
    const [tasks, setTasks] = React.useState(mockVolunteerTasks);
    const [sosRequests, setSosRequests] = React.useState<SosRequest[]>([]);
    const [isSosModalOpen, setIsSosModalOpen] = useState(false);
    const [selectedSos, setSelectedSos] = useState<SosRequest | null>(null);
    const [sosMessage, setSosMessage] = useState('');
    const [sosToAcknowledge, setSosToAcknowledge] = useState<SosRequest | null>(null);
    const newFoundItems = mockReports.filter(r => r.type === 'found').slice(0, 5);

    const loadSosData = () => {
        try {
            const storedSos = localStorage.getItem('foundtastic-sos-requests');
            setSosRequests(storedSos ? JSON.parse(storedSos) : mockSosRequests);
        } catch (error) {
            console.error("Failed to load SOS requests from localStorage", error);
            setSosRequests(mockSosRequests);
        }
    };

    useEffect(() => {
        const loadInitialData = () => {
            try {
                // Load Announcements
                const storedAnnouncements = localStorage.getItem('foundtastic-announcements');
                setAnnouncements(storedAnnouncements ? JSON.parse(storedAnnouncements) : mockAnnouncements);
                // Load SOS Requests
                loadSosData();
            } catch (error) {
                console.error("Failed to load data from localStorage", error);
                // Fallback to mock data if parsing fails
                setAnnouncements(mockAnnouncements);
                setSosRequests(mockSosRequests);
            }
        };

        loadInitialData();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'foundtastic-announcements') {
                const storedData = localStorage.getItem('foundtastic-announcements');
                setAnnouncements(storedData ? JSON.parse(storedData) : []);
            }
            if (event.key === 'foundtastic-sos-requests') {
                loadSosData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleTaskStatusChange = (taskId: string, newStatus: 'in_progress' | 'completed') => {
        setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
    };
    
    const handleSendSos = () => {
        if (!user) return;

        const newSos: SosRequest = {
            id: `sos-${Date.now()}`,
            type: 'emergency',
            userName: user.name,
            message: 'Emergency assistance required!',
            details: sosMessage || 'No additional details provided.',
            location: { name: 'Last known: Near Volunteer Post 5', lat: 23.18, lng: 75.77 }, // Placeholder location
            timestamp: 'Just now',
            contact: user.email,
            status: 'new',
        };

        try {
            const updatedSos = [newSos, ...sosRequests];
            localStorage.setItem('foundtastic-sos-requests', JSON.stringify(updatedSos));
            setSosRequests(updatedSos);
        } catch (error) {
            console.error("Failed to save SOS request", error);
        }

        setSosMessage('');
        setIsSosModalOpen(false);
        alert('SOS Sent! Authorities have been notified.');
    };
    
    const handleAcknowledgeClick = (sos: SosRequest) => {
        setSosToAcknowledge(sos);
    };

    const handleConfirmAcknowledge = () => {
        if (!sosToAcknowledge || !user) return;
        
        const updatedSosRequests = sosRequests.map(sos => 
            sos.id === sosToAcknowledge.id 
                ? { ...sos, status: 'acknowledged' as const, acknowledgedBy: user.name } 
                : sos
        );

        setSosRequests(updatedSosRequests);
        localStorage.setItem('foundtastic-sos-requests', JSON.stringify(updatedSosRequests));
        setSosToAcknowledge(null);
    };

    const getTaskStatusClass = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
     const getTaskStatusText = (status: 'pending' | 'in_progress' | 'completed') => {
        const statusMap = {
            pending: t.taskStatus.pending,
            in_progress: t.taskStatus.in_progress,
            completed: t.taskStatus.completed,
        };
        return statusMap[status];
    };


    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <DashboardHeader title={t.volunteerDashboardTitle} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main operational column - REORDERED FOR UX */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* SOS Card - MOST IMPORTANT ACTION, MOVED TO TOP */}
                         <div className="bg-red-50 border-2 border-red-300 border-dashed p-6 rounded-lg shadow-lg text-center">
                            <h2 className="text-xl font-bold text-red-800 mb-2">{t.volunteerSosCardTitle}</h2>
                            <p className="text-sm text-red-700 mb-4">{t.volunteerSosCardDescription}</p>
                            <button 
                                onClick={() => setIsSosModalOpen(true)}
                                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 animate-pulse"
                            >
                                <SosIcon className="h-6 w-6 mr-2 text-white" />
                                {t.volunteerSosButton}
                            </button>
                        </div>
                        
                        {/* SOS & Sighting Alerts - HIGH PRIORITY INFO */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <SosIcon className="h-6 w-6 text-brand-primary mr-3" />
                                {t.volunteerSosAlerts}
                            </h2>
                            <div className="space-y-4">
                                {sosRequests.length > 0 ? sosRequests.map(req => {
                                    const isSighting = req.type === 'sighting';
                                    const color = isSighting ? 'blue' : 'red';
                                    const icon = isSighting ? <SightingIcon className={`h-5 w-5 text-${color}-600`} /> : <SosIcon className={`h-5 w-5 text-${color}-600`} />;

                                    return (
                                        <div key={req.id} className={`p-4 bg-${color}-50 border-l-4 border-${color}-500 rounded-r-lg`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center">
                                                    {icon}
                                                    <p className={`font-bold text-${color}-900 ml-2`}>{req.message}</p>
                                                </div>
                                                <span className={`text-xs text-${color}-700 font-semibold flex-shrink-0 ml-2`}>{req.timestamp}</span>
                                            </div>
                                            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                                <p className={`text-xs text-${color}-700 flex items-center`}><MapPinIcon/> {req.location.name}</p>
                                                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                                    <button onClick={() => setSelectedSos(req)} className="px-4 py-2 text-xs font-bold text-brand-primary border border-brand-primary rounded-md hover:bg-brand-light">{t.volunteerActionViewDetails}</button>
                                                    {req.status === 'new' && 
                                                        <button onClick={() => handleAcknowledgeClick(req)} className="px-4 py-2 text-xs font-bold text-white bg-brand-secondary rounded-md hover:opacity-90">{t.volunteerAcknowledge}</button>
                                                    }
                                                    {req.status === 'acknowledged' &&
                                                        <span className="px-4 py-2 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-md">Acknowledged by {req.acknowledgedBy === user?.name ? 'You' : req.acknowledgedBy}</span>
                                                    }
                                                    {req.status === 'resolved' &&
                                                        <span className="px-4 py-2 text-xs font-semibold text-green-800 bg-green-100 rounded-md">{t.authoritySosStatusResolved}</span>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : <p className="text-center text-gray-500 py-8">{t.volunteerNoSosAlerts}</p>}
                            </div>
                        </div>


                        {/* Assigned Tasks */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold text-gray-800 mb-4">{t.volunteerAssignedTasks}</h2>
                             <div className="space-y-4">
                                {tasks.length > 0 ? tasks.map(task => (
                                    <div key={task.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTaskStatusClass(task.status)}`}>{getTaskStatusText(task.status as any)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center"><MapPinIcon/> {task.location}</p>
                                        <div className="mt-3 border-t pt-3 flex items-center justify-between">
                                            <button onClick={() => window.open(`https://www.google.com/maps?q=${encodeURIComponent(task.location)}`, '_blank')} className="px-3 py-1 text-xs font-medium text-brand-primary border border-brand-primary rounded-md hover:bg-brand-light">{t.volunteerViewOnMap}</button>
                                            {task.status !== 'completed' && (
                                                <div className="flex space-x-2">
                                                    {task.status === 'pending' && <button onClick={() => handleTaskStatusChange(task.id, 'in_progress')} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">{t.volunteerTaskMarkInProgress}</button>}
                                                    {task.status === 'in_progress' && <button onClick={() => handleTaskStatusChange(task.id, 'completed')} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">{t.volunteerTaskMarkComplete}</button>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-8">{t.volunteerNoTasks}</p>}
                             </div>
                        </div>

                         {/* Live Map Link Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <MapIcon className="h-6 w-6 text-brand-primary mr-3" />
                                {t.volunteerSosMapViewTitle}
                            </h2>
                            <p className="text-slate-600 mb-4">View a live map of all active SOS alerts, recent reports, and volunteer locations.</p>
                            <Link to="/live-map" className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90">
                                Open Live Map
                            </Link>
                        </div>
                    </div>

                    {/* Side column */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">{t.volunteerMyStatus}</h2>
                            <div className="flex items-center justify-between">
                                <p className="text-gray-900 font-semibold">{user?.name}</p>
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">{t.volunteerStatusActive}</span>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <Link to="/report" className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:bg-brand-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary mb-4">
                                <ReportIcon />
                                {t.volunteerFileNewReport}
                            </Link>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">{t.volunteerAnnouncements}</h2>
                            <div className="space-y-4 max-h-[24rem] overflow-y-auto">
                                {announcements.length > 0 ? announcements.map(an => (
                                    <div key={an.id} className="p-3 bg-blue-50 border-l-4 border-blue-400">
                                        <p className="text-sm text-blue-800">{an.message}</p>
                                        <p className="text-xs text-blue-600 text-right mt-1">{new Date(an.date).toLocaleDateString()}</p>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-8">{t.volunteerNoAnnouncements}</p>}
                            </div>
                        </div>
                        
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">{t.volunteerNewFoundItems}</h2>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {newFoundItems.length > 0 ? newFoundItems.map(report => (
                                    <div key={report.id} className="flex items-start space-x-4 p-3 border-b">
                                        <img src={report.imageUrl} alt={report.item} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{report.item}</p>
                                            <p className="text-xs text-gray-500">{report.location}</p>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 py-8">{t.volunteerNoNewItems}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
             {/* Acknowledge SOS Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!sosToAcknowledge}
                onClose={() => setSosToAcknowledge(null)}
                onConfirm={handleConfirmAcknowledge}
                title={t.volunteerAcknowledgeModalTitle}
                message={<p>{t.volunteerAcknowledgeModalMessage.replace('{message}', sosToAcknowledge?.message || '')}</p>}
                confirmText={t.volunteerAcknowledgeModalConfirm}
                variant="warning"
            />

            {/* Alert Details Modal */}
            {selectedSos && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedSos(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full transform transition-all" onClick={e => e.stopPropagation()}>
                        <div className="p-6 relative max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setSelectedSos(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                           
                            {selectedSos.type === 'sighting' ? (
                                <>
                                 <div className="flex items-center mb-4">
                                    <SightingIcon className="h-8 w-8 text-blue-500 mr-3" />
                                    <h2 className="text-2xl font-bold text-blue-800">{t.volunteerSightingDetailsTitle}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg border">
                                        <h3 className="font-semibold text-slate-800 mb-2">{t.volunteerMissingPerson}</h3>
                                        <div className="flex items-center gap-4">
                                            <img src={selectedSos.sightingData?.report.imageUrl} alt={selectedSos.sightingData?.report.item} className="w-20 h-20 object-cover rounded-full border-2 border-white"/>
                                            <div>
                                                <p className="font-bold text-slate-900">{selectedSos.sightingData?.report.item}</p>
                                                <p className="text-sm text-slate-600">{`Age: ${selectedSos.sightingData?.report.age}, ${selectedSos.sightingData?.report.gender}`}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border">
                                        <h3 className="font-semibold text-slate-800 mb-2">{t.volunteerSightingSnapshot}</h3>
                                        <img src={selectedSos.sightingData?.snapshotUrl} alt="Sighting snapshot" className="w-full h-auto rounded-md border"/>
                                    </div>
                                    <div className="md:col-span-2 p-4 bg-slate-50 rounded-lg border">
                                        <h3 className="font-semibold text-slate-800 mb-2">{t.volunteerSosLocationMap}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{selectedSos.location.name}</p>
                                        <div className="h-48 rounded-md overflow-hidden border">
                                            <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://maps.google.com/maps?q=${selectedSos.location.lat},${selectedSos.location.lng}&z=15&output=embed`}>
                                            </iframe>
                                        </div>
                                    </div>
                                </div>
                                </>
                            ) : (
                                <>
                                 <div className="flex items-center mb-4">
                                    <SosIcon className="h-8 w-8 text-red-500 mr-3" />
                                    <h2 className="text-2xl font-bold text-red-800">{t.volunteerSosDetailsTitle}</h2>
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
                                                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                                                    src={`https://maps.google.com/maps?q=${selectedSos.location.lat},${selectedSos.location.lng}&z=15&output=embed`}>
                                                </iframe>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </>
                            )}

                             <div className="mt-6 flex justify-end items-center gap-x-4">
                                <button onClick={() => setSelectedSos(null)} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300">
                                    {t.modalClose}
                                </button>
                                {selectedSos.status === 'new' && (
                                    <button onClick={() => { handleAcknowledgeClick(selectedSos); setSelectedSos(null); }} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:opacity-90">
                                        {t.volunteerAcknowledge}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
            )}

            {/* SOS Confirmation Modal */}
            {isSosModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsSosModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{t.volunteerSosModalTitle}</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">{t.volunteerSosModalWarning}</p>
                                            <textarea
                                                rows={3}
                                                className="w-full mt-4 p-2 border rounded-md focus:ring-brand-primary focus:border-brand-primary text-sm"
                                                placeholder={t.volunteerSosModalMessagePlaceholder}
                                                value={sosMessage}
                                                onChange={(e) => setSosMessage(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleSendSos}
                                >
                                    {t.volunteerSosModalSendButton}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={() => setIsSosModalOpen(false)}
                                >
                                    {t.volunteerSosModalCancelButton}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteerDashboard;