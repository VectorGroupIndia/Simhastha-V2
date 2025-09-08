import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Report } from '../ProfilePage';
import AuthoritySidebar from './components/AuthoritySidebar';
import DashboardHeader from '../../components/DashboardHeader';
import MissingPersonSelector from '../../components/cctv/MissingPersonSelector';
import LiveFeedPlayer from '../../components/cctv/LiveFeedPlayer';
import SightingsLog from '../../components/cctv/SightingsLog';
import { mockReports, mockSightings } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { SosRequest } from '../volunteer/VolunteerDashboard';
import ConfirmationModal from '../../components/ConfirmationModal';


export interface Sighting {
    id: string;
    reportId: string;
    timestamp: Date;
    cameraLocation: string;
    snapshotUrl: string; // base64 data URL
    confidence: number;
    status: 'unconfirmed' | 'confirmed' | 'dismissed';
    confirmedBy: string | null;
}

const CCTVMonitoringPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [missingPersonReports, setMissingPersonReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [sightings, setSightings] = useState<Sighting[]>([]);
    const [isFeedActive, setIsFeedActive] = useState(false);
    const [sightingToConfirm, setSightingToConfirm] = useState<Sighting | null>(null);

    const loadSightings = useCallback(() => {
        try {
            const storedSightings = localStorage.getItem('foundtastic-sightings');
            if (storedSightings) {
                const parsed = JSON.parse(storedSightings).map((s: any) => ({...s, timestamp: new Date(s.timestamp)}));
                setSightings(parsed);
            } else {
                 // Seed from mock data if local storage is empty
                const seededSightings = mockSightings.map(s => ({...s, timestamp: new Date(s.timestamp)}));
                localStorage.setItem('foundtastic-sightings', JSON.stringify(seededSightings));
                setSightings(seededSightings);
            }
        } catch (error) {
            console.error("Failed to load sightings:", error);
        }
    }, []);

    useEffect(() => {
        const allReports: Report[] = JSON.parse(localStorage.getItem('foundtastic-all-reports') || 'null') || mockReports;
        const personReports = allReports.filter(r => r.reportCategory === 'person' && r.type === 'lost');
        setMissingPersonReports(personReports);
        loadSightings();
    }, [loadSightings]);
    
    const handleSelectReport = (report: Report) => {
        setSelectedReport(report);
        setIsFeedActive(true);
    };
    
    const triggerSightingAlerts = (sighting: Sighting) => {
        const report = missingPersonReports.find(r => r.id === sighting.reportId);
        if (!report) return;

        // 1. Notify the user who filed the report
        addNotification({
            title: t.notificationSightingTitle.replace('{personName}', report.item),
            message: t.notificationSightingBody,
            link: '/profile'
        });

        // 2. Create an alert for volunteers
        const newSosRequest: SosRequest = {
            id: `sos-${Date.now()}`,
            type: 'sighting',
            userName: `Authority: ${user?.name || 'Control Room'}`,
            message: `Sighting of ${report.item}`,
            details: `A confirmed sighting of missing person ${report.item} was made. Please proceed to the location to assist.`,
            location: {
                name: sighting.cameraLocation,
                lat: 23.1815, // Mock coordinates for Ram Ghat
                lng: 75.7685,
            },
            timestamp: 'Just now',
            contact: 'N/A',
            status: 'new',
            sightingData: {
                report: report,
                snapshotUrl: sighting.snapshotUrl,
            }
        };

        try {
            const storedSos = localStorage.getItem('foundtastic-sos-requests');
            const currentSos = storedSos ? JSON.parse(storedSos) : [];
            const updatedSos = [newSosRequest, ...currentSos];
            localStorage.setItem('foundtastic-sos-requests', JSON.stringify(updatedSos));
        } catch (error) {
            console.error("Failed to create volunteer alert:", error);
        }
    };


    const handleUpdateSightingStatus = (sightingId: string, status: 'confirmed' | 'dismissed') => {
        const updatedSightings = sightings.map(s => {
            if (s.id === sightingId) {
                const updatedSighting = { ...s, status, confirmedBy: status === 'confirmed' ? user?.name || 'Authority' : null };
                if (status === 'confirmed') {
                    triggerSightingAlerts(updatedSighting);
                }
                return updatedSighting;
            }
            return s;
        });

        setSightings(updatedSightings);
        localStorage.setItem('foundtastic-sightings', JSON.stringify(updatedSightings));
        setSightingToConfirm(null);
    };

    const handleNewSighting = useCallback((sighting: Omit<Sighting, 'id'>) => {
        const newSighting: Sighting = {
            ...sighting,
            id: `sight-${Date.now()}`,
        };
        
        setSightings(prev => {
            const updatedSightings = [newSighting, ...prev];
            localStorage.setItem('foundtastic-sightings', JSON.stringify(updatedSightings));
            return updatedSightings;
        });

    }, []);

    const filteredSightings = sightings.filter(s => selectedReport ? s.reportId === selectedReport.id : true);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AuthoritySidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.cctvTitle} />

                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {/* Left Column: Selector */}
                    <div className="lg:col-span-1 xl:col-span-1">
                        <MissingPersonSelector
                            reports={missingPersonReports}
                            selectedReportId={selectedReport?.id || null}
                            onSelectReport={handleSelectReport}
                        />
                    </div>

                    {/* Center Column: Video Feed */}
                    <div className="lg:col-span-2 xl:col-span-2 bg-white p-4 rounded-lg shadow-md">
                         <LiveFeedPlayer
                            report={selectedReport}
                            onNewSighting={handleNewSighting}
                            isActive={isFeedActive}
                            onFeedStatusChange={setIsFeedActive}
                        />
                    </div>

                    {/* Right Column: Sightings Log */}
                    <div className="lg:col-span-3 xl:col-span-1">
                        <SightingsLog 
                            sightings={filteredSightings} 
                            reports={missingPersonReports}
                            onConfirmSighting={(sighting) => setSightingToConfirm(sighting)}
                            onDismissSighting={(id) => handleUpdateSightingStatus(id, 'dismissed')}
                        />
                    </div>
                </div>

                 <ConfirmationModal
                    isOpen={!!sightingToConfirm}
                    onClose={() => setSightingToConfirm(null)}
                    onConfirm={() => {
                        if (sightingToConfirm) {
                            handleUpdateSightingStatus(sightingToConfirm.id, 'confirmed');
                        }
                    }}
                    title={t.cctvConfirmSightingTitle}
                    message={<p>{t.cctvConfirmSightingMessage.replace('{personName}', selectedReport?.item || 'this person')}</p>}
                    confirmText={t.cctvConfirmSighting}
                    variant="info"
                />
            </main>
        </div>
    );
};

export default CCTVMonitoringPage;