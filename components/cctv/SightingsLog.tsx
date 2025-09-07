import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sighting } from '../../pages/authority/CCTVMonitoringPage';
import { Report } from '../../pages/ProfilePage';

interface SightingsLogProps {
    sightings: Sighting[];
    reports: Report[];
    onConfirmSighting: (sighting: Sighting) => void;
    onDismissSighting: (sightingId: string) => void;
}

const statusStyles = {
    unconfirmed: 'border-yellow-400 bg-yellow-50',
    confirmed: 'border-green-400 bg-green-50',
    dismissed: 'border-gray-300 bg-gray-50 opacity-70',
};

const statusTextStyles = {
    unconfirmed: 'text-yellow-900',
    confirmed: 'text-green-900',
    dismissed: 'text-gray-700',
};

const SightingsLog: React.FC<SightingsLogProps> = ({ sightings, reports, onConfirmSighting, onDismissSighting }) => {
    const { t } = useLanguage();

    const getReportForItem = (reportId: string) => {
        return reports.find(r => r.id === reportId);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-full">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-3">{t.cctvSightingsLog}</h2>
            <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {sightings.length > 0 ? (
                    sightings.map(sighting => {
                        const report = getReportForItem(sighting.reportId);
                        const statusStyle = statusStyles[sighting.status];
                        const textStyle = statusTextStyles[sighting.status];
                        
                        return (
                            <div key={sighting.id} className={`p-3 border-l-4 rounded-r-lg ${statusStyle}`}>
                                <div className="flex justify-between items-start">
                                    <p className={`text-sm font-bold ${textStyle}`}>
                                        {sighting.status === 'unconfirmed' ? t.cctvMatchFound :
                                         sighting.status === 'confirmed' ? t.cctvSightingConfirmed : t.cctvSightingDismissed}
                                    </p>
                                    {sighting.status === 'confirmed' && sighting.confirmedBy && (
                                        <p className="text-xs text-green-700">by {sighting.confirmedBy}</p>
                                    )}
                                </div>
                                {report && (
                                    <p className={`text-xs font-semibold ${textStyle} mb-2`}>
                                        Target: {report.item}
                                    </p>
                                )}
                                <img
                                    src={sighting.snapshotUrl}
                                    alt={`Sighting at ${sighting.cameraLocation}`}
                                    className="w-full h-auto rounded-md my-2 border-2 border-yellow-300"
                                />
                                <div className={`text-xs ${textStyle} space-y-1`}>
                                    <p><strong>{t.cctvCamera}:</strong> {sighting.cameraLocation}</p>
                                    <p><strong>{t.cctvTime}:</strong> {sighting.timestamp.toLocaleTimeString()}</p>
                                    <p><strong>{t.cctvConfidence}:</strong> {(sighting.confidence * 100).toFixed(1)}%</p>
                                </div>

                                {sighting.status === 'unconfirmed' && (
                                    <div className="mt-3 pt-3 border-t flex justify-end space-x-2">
                                        <button 
                                            onClick={() => onDismissSighting(sighting.id)}
                                            className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                            {t.cctvDismiss}
                                        </button>
                                        <button 
                                            onClick={() => onConfirmSighting(sighting)}
                                            className="px-3 py-1 text-xs font-medium text-white bg-brand-secondary rounded-md hover:opacity-90">
                                            {t.cctvConfirmSighting}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 py-8">{t.cctvNoSightings}</p>
                )}
            </div>
        </div>
    );
};

export default SightingsLog;