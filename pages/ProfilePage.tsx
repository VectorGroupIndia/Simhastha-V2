
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ReportDetailsModal from '../components/ReportDetailsModal';

export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'closed';

export interface Report {
    id: string;
    type: 'lost' | 'found';
    item: string;
    description: string;
    date: string;
    status: ReportStatus;
    location: string;
    imageUrl: string;
    matches?: string[];
    resolvedDate?: string;
}

export const statusStyles: { [key in ReportStatus]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_review: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-800',
};

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { t, translateStatus } = useLanguage();
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');

    // New states for advanced filtering and sorting
    const [sortOption, setSortOption] = useState<string>('date_desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (user) {
            try {
                const allReportsStr = localStorage.getItem('foundtastic-all-reports');
                if (allReportsStr) {
                    const allReports: Report[] = JSON.parse(allReportsStr);
                    // This is a simplified check. In a real app, user ID would be on the report.
                    // Here we'll just show some reports for demo.
                    setReports(allReports.slice(0, 6)); 
                }
            } catch (e) {
                console.error("Failed to load reports from local storage", e);
            }
        }
    }, [user]);
    
    const processedReports = useMemo(() => {
        let filtered = reports.filter(report => {
            // Type filter
            const matchesType = filter === 'all' || report.type === filter;

            // Date range filter
            const reportDate = new Date(report.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
            const matchesDate = (!start || reportDate >= start) && (!end || reportDate <= end);

            return matchesType && matchesDate;
        });

        // Sorting logic
        const [sortKey, sortOrder] = sortOption.split('_');
        
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortKey) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'item':
                    comparison = a.item.localeCompare(b.item);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [reports, filter, startDate, endDate, sortOption]);

    const clearSortAndFilters = () => {
        setSortOption('date_desc');
        setStartDate('');
        setEndDate('');
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <p>{t.profileLoading}</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* User Profile Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center space-x-6">
                        <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-brand-dark">{user.name}</h1>
                            <p className="text-slate-600">{user.email}</p>
                            <p className="text-slate-500 text-sm mt-1">{t.profileMemberSince} {user.memberSince}</p>
                        </div>
                    </div>

                    {/* Reports Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 mb-4">
                            <h2 className="text-2xl font-bold text-brand-dark">{t.profileMyReports}</h2>
                             <div className="mt-3 sm:mt-0 flex space-x-2">
                                <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{t.profileFilterAll}</button>
                                <button onClick={() => setFilter('lost')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'lost' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{t.profileFilterLost}</button>
                                <button onClick={() => setFilter('found')} className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'found' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{t.profileFilterFound}</button>
                            </div>
                        </div>

                        {/* Sort and Filter Controls */}
                        <div className="p-4 bg-slate-50 rounded-lg border mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label htmlFor="sortOption" className="block text-sm font-medium text-slate-700">{t.profileSortBy}</label>
                                    <select id="sortOption" value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
                                        <option value="date_desc">{t.sortDateNewest}</option>
                                        <option value="date_asc">{t.sortDateOldest}</option>
                                        <option value="item_asc">{t.sortItemAZ}</option>
                                        <option value="item_desc">{t.sortItemZA}</option>
                                        <option value="status_asc">{t.sortStatusAZ}</option>
                                        <option value="status_desc">{t.sortStatusZA}</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">{t.dateFrom}</label>
                                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                    </div>
                                     <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">{t.dateTo}</label>
                                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button onClick={clearSortAndFilters} className="text-sm font-medium text-brand-primary hover:text-brand-primary/80">{t.clearFilters}</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {processedReports.length > 0 ? (
                                processedReports.map(report => (
                                    <div key={report.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                        <img src={report.imageUrl} alt={report.item} className="w-24 h-24 object-cover rounded-md bg-slate-100 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className={`text-xs font-bold uppercase ${report.type === 'lost' ? 'text-red-600' : 'text-green-600'}`}>{report.type}</span>
                                                    <h3 className="text-lg font-semibold text-brand-dark">{report.item}</h3>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-xs px-2 py-1 font-medium rounded-full ${statusStyles[report.status]}`}>
                                                        {translateStatus(report.status)}
                                                    </span>
                                                    {report.matches && report.matches.length > 0 && (
                                                        <span className="mt-2 text-xs px-2 py-1 font-bold rounded-full bg-brand-secondary text-white">
                                                            {t.matchesFound}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{t.profileReportedOn} {report.date}</p>
                                        </div>
                                        <button onClick={() => setSelectedReport(report)} className="w-full sm:w-auto px-4 py-2 bg-brand-secondary text-white font-semibold text-sm rounded-md hover:opacity-90 transition-opacity">
                                            {t.profileViewDetails}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-8">{t.profileNoReports}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {selectedReport && <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
        </div>
    );
};

export default ProfilePage;
