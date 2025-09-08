import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Report } from '../../pages/ProfilePage';

interface MissingPersonSelectorProps {
    reports: Report[];
    selectedReportId: string | null;
    onSelectReport: (report: Report) => void;
}

const MissingPersonSelector: React.FC<MissingPersonSelectorProps> = ({ reports, selectedReportId, onSelectReport }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-full">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-3">{t.cctvSelectPerson}</h2>
            <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {reports.length > 0 ? (
                    reports.map(report => (
                        <button
                            key={report.id}
                            onClick={() => onSelectReport(report)}
                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-4 ${
                                selectedReportId === report.id
                                    ? 'bg-brand-primary text-white shadow-lg'
                                    : 'bg-gray-50 hover:bg-brand-light'
                            }`}
                        >
                            <img
                                src={report.imageUrls[0]}
                                alt={report.item}
                                className="w-16 h-16 object-cover rounded-full border-2 border-white flex-shrink-0"
                            />
                            <div>
                                <p className="font-bold">{report.item}</p>
                                <p className={`text-sm ${selectedReportId === report.id ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {`Age: ${report.age}, ${report.gender}`}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">{t.cctvNoMissingReports}</p>
                )}
            </div>
        </div>
    );
};

export default MissingPersonSelector;