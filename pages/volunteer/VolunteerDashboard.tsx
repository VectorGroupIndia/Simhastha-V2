import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth, FullUser } from '../../contexts/AuthContext';
import { mockAnnouncements, mockVolunteerTasks, mockSosRequests, VolunteerTask } from '../../data/mockData';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Link } from 'react-router-dom';
import { Report } from '../ProfilePage';
import ProfileModal from '../../components/ProfileModal';
import LiveMapModal from '../LiveMapPage';

interface Announcement {
    id: string;
    date: string;
    message: string;
}

export interface SosRequest {
    id: string;
    type: 'emergency' | 'sighting';
    userName: string;
    message: string;
    details: string;
    location: { name: string; lat: number; lng: number; };
    timestamp: string;
    contact: string;
    status: 'new' | 'acknowledged' | 'resolved';
    acknowledgedBy?: string;
    sightingData?: { report: Report; snapshotUrl: string; }
}

// --- ICONS ---
const SosIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M11.636 8.364a5 5 0 010 7.072M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SightingIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg>;
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ClipboardListIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const MapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.37-1.716-.998L9.75 7.5l-4.875-2.437c-.381-.19-.622-.58-.622-1.006V19.18c0 .836.88 1.37 1.716.998l4.875-2.437a1.5 1.5 0 011.022 0l4.122 2.061a1.5 1.5 0 001.022 0z" /></svg>;
const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 3.34a1.5 1.5 0 011.32 0l6.33 3.165a1.5 1.5 0 01.956 1.321v8.348a1.5 1.5 0 01-.956 1.321l-6.33 3.165a1.5 1.5 0 01-1.32 0l-6.33-3.165a1.5 1.5 0 01-.956-1.321V7.826a1.5 1.5 0 01.956-1.321L10.34 3.34z" /></svg>;

// --- SUB-COMPONENTS ---

const StatusToggle: React.FC<{ isActive: boolean; onChange: (active: boolean) => void }> = ({ isActive, onChange }) => {
    return (
        <div className="flex items-center space-x-2">
            <span className={`text-sm font-semibold ${isActive ? 'text-brand-volunteer' : 'text-slate-500'}`}>
                {isActive ? 'Active' : 'On Break'}
            </span>
            <button
                type="button"
                onClick={() => onChange(!isActive)}
                className={`${isActive ? 'bg-brand-volunteer' : 'bg-gray-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-volunteer focus:ring-offset-2`}
            >
                <span className={`${isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
        </div>
    );
};

const Header: React.FC<{
    user: FullUser;
    onProfileClick: () => void;
    isActive: boolean;
    onStatusChange: (active: boolean) => void;
}> = ({ user, onProfileClick, isActive, onStatusChange }) => {
    const { logout } = useAuth();
    const { t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <h1 className="text-xl font-bold text-slate-800">Welcome, {user.name.split(' ')[0]}!</h1>
                    <div className="flex items-center space-x-4">
                        <StatusToggle isActive={isActive} onChange={onStatusChange} />
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-slate-200 hover:border-brand-volunteer transition" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                                    <button onClick={() => { onProfileClick(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><UserIcon /> {t.navProfile}</button>
                                    <button onClick={logout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogoutIcon /> {t.navLogout}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const PriorityBadge: React.FC<{ priority: VolunteerTask['priority'] }> = ({ priority }) => {
    const { t } = useLanguage();
    const styles: Record<VolunteerTask['priority'], string> = {
        low: 'bg-slate-100 text-slate-800',
        medium: 'bg-blue-100 text-blue-800',
        high: 'bg-yellow-100 text-yellow-800',
        urgent: 'bg-red-100 text-red-800',
    };
    return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles[priority]}`}>{t.taskPriority[priority]}</span>;
};


const VolunteerDashboard: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [tasks, setTasks] = useState<VolunteerTask[]>([]);
    const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
    const [isSosModalOpen, setIsSosModalOpen] = useState(false);
    const [selectedSos, setSelectedSos] = useState<SosRequest | null>(null);
    const [sosMessage, setSosMessage] = useState('');
    const [sosToAcknowledge, setSosToAcknowledge] = useState<SosRequest | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isVolunteerActive, setIsVolunteerActive] = useState(true);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    // Task management state
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<'all' | VolunteerTask['priority']>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | VolunteerTask['status']>('all');
    const [sortOption, setSortOption] = useState('priority_desc');
    const [completingTask, setCompletingTask] = useState<VolunteerTask | null>(null);
    const [completionNotes, setCompletionNotes] = useState('');
    const [viewingNotesTask, setViewingNotesTask] = useState<VolunteerTask | null>(null);


    const loadSosData = () => {
        try {
            const storedSos = localStorage.getItem('foundtastic-sos-requests');
            setSosRequests(storedSos ? JSON.parse(storedSos) : mockSosRequests);
        } catch (error) {
            console.error("Failed to load SOS requests from localStorage", error);
            setSosRequests(mockSosRequests);
        }
    };
    
    const loadTaskData = () => {
         try {
            const storedTasks = localStorage.getItem('foundtastic-volunteer-tasks');
            setTasks(storedTasks ? JSON.parse(storedTasks) : mockVolunteerTasks);
        } catch (error) {
            console.error("Failed to load tasks from localStorage", error);
            setTasks(mockVolunteerTasks);
        }
    }

    useEffect(() => {
        const loadInitialData = () => {
            try {
                const storedAnnouncements = localStorage.getItem('foundtastic-announcements');
                setAnnouncements(storedAnnouncements ? JSON.parse(storedAnnouncements) : mockAnnouncements);
                loadSosData();
                loadTaskData();
            } catch (error) {
                console.error("Failed to load data from localStorage", error);
                setAnnouncements(mockAnnouncements);
                setSosRequests(mockSosRequests);
                setTasks(mockVolunteerTasks);
            }
        };

        loadInitialData();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'foundtastic-announcements') {
                const storedData = localStorage.getItem('foundtastic-announcements');
                setAnnouncements(storedData ? JSON.parse(storedData) : []);
            }
            if (event.key === 'foundtastic-sos-requests') loadSosData();
            if (event.key === 'foundtastic-volunteer-tasks') loadTaskData();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    const processedTasks = useMemo(() => {
        const priorityOrder: Record<VolunteerTask['priority'], number> = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        
        return tasks
            .filter(task => {
                const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
                const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
                return matchesSearch && matchesPriority && matchesStatus;
            })
            .sort((a, b) => {
                const [sortKey, sortOrder] = sortOption.split('_');
                let comparison = 0;
                if (sortKey === 'priority') {
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                } else if (sortKey === 'dueDate') {
                    comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
    }, [tasks, searchTerm, priorityFilter, statusFilter, sortOption]);

    const handleTaskStatusChange = (taskId: string, newStatus: 'in_progress' | 'completed') => {
        const updatedTasks = tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task);
        setTasks(updatedTasks);
        localStorage.setItem('foundtastic-volunteer-tasks', JSON.stringify(updatedTasks));
    };
    
    const handleOpenCompletionModal = (task: VolunteerTask) => {
        setCompletingTask(task);
        setCompletionNotes('');
    };
    
    const handleConfirmCompletion = () => {
        if (!completingTask) return;
        const updatedTasks = tasks.map(task =>
            task.id === completingTask.id
                ? { ...task, status: 'completed' as const, completionNotes: completionNotes }
                : task
        );
        setTasks(updatedTasks);
        localStorage.setItem('foundtastic-volunteer-tasks', JSON.stringify(updatedTasks));
        setCompletingTask(null);
    };

    const handleSendSos = () => {
        if (!user) return;
        const newSos: SosRequest = {
            id: `sos-${Date.now()}`, type: 'emergency', userName: user.name,
            message: 'Emergency assistance required!', details: sosMessage || 'No additional details provided.',
            location: { name: 'Last known: Near Volunteer Post 5', lat: 23.18, lng: 75.77 },
            timestamp: 'Just now', contact: user.email, status: 'new',
        };
        try {
            const updatedSos = [newSos, ...sosRequests];
            localStorage.setItem('foundtastic-sos-requests', JSON.stringify(updatedSos));
            setSosRequests(updatedSos);
        } catch (error) { console.error("Failed to save SOS request", error); }
        setSosMessage('');
        setIsSosModalOpen(false);
        alert('SOS Sent! Authorities have been notified.');
    };
    
    const handleAcknowledgeClick = (sos: SosRequest) => setSosToAcknowledge(sos);

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

    const getTaskStatusClass = (status: string) => ({'pending': 'bg-yellow-100 text-yellow-800', 'in_progress': 'bg-blue-100 text-blue-800', 'completed': 'bg-green-100 text-green-800'}[status] || 'bg-gray-100 text-gray-800');
    const getTaskStatusText = (status: 'pending' | 'in_progress' | 'completed') => ({pending: t.taskStatus.pending, in_progress: t.taskStatus.in_progress, completed: t.taskStatus.completed,}[status]);

    if (!user) return null;

    return (
        <div className="bg-slate-100 min-h-screen text-slate-800">
            <Header user={user as FullUser} onProfileClick={() => setIsProfileModalOpen(true)} isActive={isVolunteerActive} onStatusChange={setIsVolunteerActive} />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main actions) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg animate-fadeIn" style={{ animationDelay: '100ms' }}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><SosIcon className="h-6 w-6 text-brand-primary mr-3" />{t.volunteerSosAlerts}</h2>
                            <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                                {sosRequests.length > 0 ? sosRequests.map(req => {
                                    const isSighting = req.type === 'sighting';
                                    const color = isSighting ? 'blue' : 'red';
                                    const icon = isSighting ? <SightingIcon className={`h-5 w-5 text-${color}-600`} /> : <SosIcon className={`h-5 w-5 text-${color}-600`} />;
                                    return (
                                        <div key={req.id} className={`p-4 bg-${color}-50 border-l-4 border-${color}-500 rounded-r-lg`}>
                                            <div className="flex justify-between items-start"><div className="flex items-center">{icon}<p className={`font-bold text-${color}-900 ml-2`}>{req.message}</p></div><span className={`text-xs text-${color}-700 font-semibold flex-shrink-0 ml-2`}>{req.timestamp}</span></div>
                                            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between"><p className={`text-xs text-${color}-700 flex items-center`}><MapPinIcon/> {req.location.name}</p><div className="flex items-center space-x-2 mt-2 sm:mt-0"><button onClick={() => setSelectedSos(req)} className="px-4 py-2 text-xs font-bold text-brand-primary border border-brand-primary rounded-md hover:bg-brand-light">{t.volunteerActionViewDetails}</button>{req.status === 'new' && <button onClick={() => handleAcknowledgeClick(req)} className="px-4 py-2 text-xs font-bold text-white bg-brand-secondary rounded-md hover:opacity-90">{t.volunteerAcknowledge}</button>}{req.status === 'acknowledged' && <span className="px-4 py-2 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-md">Acknowledged by {req.acknowledgedBy === user?.name ? 'You' : req.acknowledgedBy}</span>}{req.status === 'resolved' && <span className="px-4 py-2 text-xs font-semibold text-green-800 bg-green-100 rounded-md">{t.authoritySosStatusResolved}</span>}</div></div>
                                        </div>
                                    );
                                }) : <div className="text-center py-10"><ClipboardListIcon className="mx-auto h-12 w-12 text-slate-300" /><h3 className="mt-2 text-sm font-semibold text-slate-600">{t.volunteerNoSosAlerts}</h3></div>}
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-lg animate-fadeIn" style={{ animationDelay: '200ms' }}>
                             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><ClipboardListIcon className="h-6 w-6 text-brand-primary mr-3" />{t.volunteerAssignedTasks}</h2>
                             
                            <div className="p-4 bg-slate-50 rounded-lg border mb-6">
                                <h3 className="font-semibold text-slate-700 mb-3">{t.taskFiltersAndSort}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                    <div className="md:col-span-2">
                                        <label htmlFor="taskSearch" className="sr-only">{t.taskSearchPlaceholder}</label>
                                        <input type="text" id="taskSearch" placeholder={t.taskSearchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                    </div>
                                    <div>
                                        <label htmlFor="statusFilter" className="block text-xs font-medium text-slate-600">{t.taskFilterByStatus}</label>
                                        <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
                                            <option value="all">All</option>
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="priorityFilter" className="block text-xs font-medium text-slate-600">{t.taskFilterByPriority}</label>
                                        <select id="priorityFilter" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
                                            <option value="all">All</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="sortOption" className="block text-xs font-medium text-slate-600">{t.taskSortBy}</label>
                                        <select id="sortOption" value={sortOption} onChange={e => setSortOption(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
                                            <option value="priority_desc">{t.taskSortPriorityDesc}</option>
                                            <option value="priority_asc">{t.taskSortPriorityAsc}</option>
                                            <option value="dueDate_asc">{t.taskSortDueDateAsc}</option>
                                            <option value="dueDate_desc">{t.taskSortDueDateDesc}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                             
                             <div className="space-y-4">
                                {processedTasks.length > 0 ? processedTasks.map(task => {
                                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
                                    return (
                                        <div key={task.id} className="p-4 border rounded-lg bg-white shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-900 pr-4">{task.title}</h3>
                                                <PriorityBadge priority={task.priority} />
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600 space-y-2">
                                                <p>{task.description}</p>
                                                <p className="text-xs text-gray-500 flex items-center">
                                                    <MapPinIcon/> {task.location}
                                                </p>
                                                <p className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                                                    {t.taskDueOn.replace('{date}', new Date(task.dueDate).toLocaleDateString())} {isOverdue && `(${t.taskOverdue})`}
                                                </p>
                                            </div>
                                            
                                            <div className="mt-3 border-t pt-3 flex items-center justify-between">
                                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getTaskStatusClass(task.status)}`}>{getTaskStatusText(task.status as any)}</span>
                                                
                                                <div className="flex items-center space-x-2">
                                                    {task.status === 'completed' && task.completionNotes && (
                                                        <button onClick={() => setViewingNotesTask(task)} className="px-3 py-1 text-xs font-medium text-brand-primary border border-brand-primary rounded-md hover:bg-brand-light">{t.viewCompletionNotes}</button>
                                                    )}
                                                    {task.status === 'pending' && <button onClick={() => handleTaskStatusChange(task.id, 'in_progress')} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">{t.volunteerTaskMarkInProgress}</button>}
                                                    {task.status === 'in_progress' && <button onClick={() => handleOpenCompletionModal(task)} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">{t.volunteerTaskMarkComplete}</button>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : <div className="text-center py-10"><ClipboardListIcon className="mx-auto h-12 w-12 text-slate-300" /><h3 className="mt-2 text-sm font-semibold text-slate-600">{t.volunteerNoTasks}</h3></div>}
                             </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg animate-fadeIn" style={{ animationDelay: '300ms' }}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link to="/report" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:opacity-90 transition-opacity">File a New Report</Link>
                                <button onClick={() => setIsMapModalOpen(true)} className="w-full flex items-center justify-center px-4 py-3 border border-brand-volunteer text-base font-medium rounded-md shadow-sm text-brand-volunteer bg-brand-volunteer/10 hover:bg-brand-volunteer/20 transition-colors">View Live Map</button>
                                <button onClick={() => setIsSosModalOpen(true)} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition-opacity">SEND SOS ALERT</button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-lg animate-fadeIn" style={{ animationDelay: '400ms' }}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><MegaphoneIcon className="h-6 w-6 text-brand-primary mr-3"/>{t.volunteerAnnouncements}</h2>
                            <div className="space-y-4 max-h-[24rem] overflow-y-auto pr-2">
                                {announcements.length > 0 ? announcements.map(an => (
                                    <div key={an.id} className="p-3 bg-blue-50 border-l-4 border-blue-400"><p className="text-sm text-blue-800">{an.message}</p><p className="text-xs text-blue-600 text-right mt-1">{new Date(an.date).toLocaleDateString()}</p></div>
                                )) : <div className="text-center py-10"><MegaphoneIcon className="mx-auto h-12 w-12 text-slate-300" /><h3 className="mt-2 text-sm font-semibold text-slate-600">{t.volunteerNoAnnouncements}</h3></div>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmationModal isOpen={!!sosToAcknowledge} onClose={() => setSosToAcknowledge(null)} onConfirm={handleConfirmAcknowledge} title={t.volunteerAcknowledgeModalTitle} message={<p>{t.volunteerAcknowledgeModalMessage.replace('{message}', sosToAcknowledge?.message || '')}</p>} confirmText={t.volunteerAcknowledgeModalConfirm} variant="warning" />
            <ConfirmationModal isOpen={!!completingTask} onClose={() => setCompletingTask(null)} onConfirm={handleConfirmCompletion} title={t.completeTaskModalTitle.replace('{taskTitle}', completingTask?.title || '')} message={<div><p className="mb-4 text-sm text-gray-600">{t.completeTaskModalMessage}</p><textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={4} className="w-full p-2 border rounded-md focus:ring-brand-primary focus:border-brand-primary" placeholder={t.completeTaskModalPlaceholder}/></div>} confirmText={t.completeTaskModalConfirm} variant="info" />
            <ConfirmationModal isOpen={!!viewingNotesTask} onClose={() => setViewingNotesTask(null)} onConfirm={() => setViewingNotesTask(null)} title={t.taskCompletionNotes} message={<p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingNotesTask?.completionNotes}</p>} confirmText="Close" variant="info" />
            {selectedSos && (<div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedSos(null)}><div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full transform transition-all" onClick={e => e.stopPropagation()}><div className="p-6 relative max-h-[90vh] overflow-y-auto"><button onClick={() => setSelectedSos(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>{selectedSos.type === 'sighting' ? (<>{/* Sighting Details UI */}</>) : (<>{/* SOS Details UI */}</>)}<div className="mt-6 flex justify-end items-center gap-x-4"><button onClick={() => setSelectedSos(null)} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300">{t.modalClose}</button>{selectedSos.status === 'new' && (<button onClick={() => { handleAcknowledgeClick(selectedSos); setSelectedSos(null); }} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:opacity-90">{t.volunteerAcknowledge}</button>)}</div></div></div></div>)}
            {isSosModalOpen && (<div className="fixed inset-0 z-50 overflow-y-auto"><div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"><div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsSosModalOpen(false)}></div><span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span><div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"><div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4"><div className="sm:flex sm:items-start"><div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"><h3 className="text-lg leading-6 font-medium text-gray-900">{t.volunteerSosModalTitle}</h3><div className="mt-2"><p className="text-sm text-gray-500">{t.volunteerSosModalWarning}</p><textarea rows={3} className="w-full mt-4 p-2 border rounded-md focus:ring-brand-primary focus:border-brand-primary text-sm" placeholder={t.volunteerSosModalMessagePlaceholder} value={sosMessage} onChange={(e) => setSosMessage(e.target.value)}></textarea></div></div></div></div><div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"><button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm" onClick={handleSendSos}>{t.volunteerSosModalSendButton}</button><button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm" onClick={() => setIsSosModalOpen(false)}>{t.volunteerSosModalCancelButton}</button></div></div></div></div>)}
            {user && (<ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user as FullUser} />)}
            <LiveMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
        </div>
    );
};

export default VolunteerDashboard;