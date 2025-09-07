import React, { useState, useEffect } from 'react';
import { Report } from '../pages/ProfilePage';
import { useLanguage } from '../contexts/LanguageContext';

interface SuggestedMatchesProps {
    matchIds: string[];
    currentReportId: string;
}

const SuggestedMatches: React.FC<SuggestedMatchesProps> = ({ matchIds, currentReportId }) => {
    const { t } = useLanguage();
    const [matchedReports, setMatchedReports] = useState<Report[]>([]);

    useEffect(() => {
        try {
            const allReportsStr = localStorage.getItem('foundtastic-all-reports');
            if (allReportsStr) {
                const allReports: Report[] = JSON.parse(allReportsStr);
                const matches = allReports.filter(report => matchIds.includes(report.id));
                setMatchedReports(matches);
            }
        } catch (e) {
            console.error("Failed to load matches from local storage", e);
        }
    }, [matchIds]);

    if (matchedReports.length === 0) {
        return null;
    }

    return (
        <div>
            <h3 className="text-xl font-bold text-brand-secondary mb-4">{t.suggestedMatches}</h3>
            <div className="space-y-4">
                {matchedReports.map(report => (
                    <div key={report.id} className="p-4 border rounded-lg bg-slate-50 flex items-start space-x-4">
                        <img src={report.imageUrl} alt={report.item} className="w-20 h-20 object-cover rounded-md bg-slate-100 flex-shrink-0" />
                        <div className="flex-grow">
                            <span className={`text-xs font-bold uppercase ${report.type === 'lost' ? 'text-red-600' : 'text-green-600'}`}>
                                {report.type}
                            </span>
                            <h4 className="font-semibold text-brand-dark">{report.item}</h4>
                            <p className="text-sm text-slate-500 mt-1">{t.profileReportedOn} {report.date}</p>
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{report.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedMatches;
