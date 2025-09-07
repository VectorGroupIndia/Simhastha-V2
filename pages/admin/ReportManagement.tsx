
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { Report, ReportStatus } from '../ProfilePage';
import DashboardHeader from '../../components/DashboardHeader';

// Styles for the status dropdown, providing better visual feedback.
const selectStatusStyles: { [key in ReportStatus]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_review: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
};

const ReportManagement: React.FC = () => {
    const { t } = useLanguage();
    const [reports, setReports] = useState<Report[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
    const [sortOption, setSortOption] = useState<string>('date_desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
     useEffect(() => {
        try {
            const storedReports = localStorage.getItem('foundtastic-all-reports');
            if (storedReports) {
                setReports(JSON.parse(storedReports));
            }
        } catch (error) {
            console.error("Failed to load reports from localStorage", error);
        }
    }, []);

    const filteredReports = useMemo(() => {
        let filtered = reports.filter(report => {
            const matchesSearch = report.item.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
            
            const reportDate = new Date(report.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
            const matchesDate = (!start || reportDate >= start) && (!end || reportDate <= end);

            return matchesSearch && matchesStatus && matchesDate;
        });

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
    }, [reports, searchTerm, statusFilter, startDate, endDate, sortOption]);

    const handleStatusChange = (id: string, newStatus: ReportStatus) => {
        const updatedReports = reports.map(report =>
            report.id === id ? { ...report, status: newStatus } : report
        );
        setReports(updatedReports);
        localStorage.setItem('foundtastic-all-reports', JSON.stringify(updatedReports));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setSortOption('date_desc');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.adminReportManagement} />

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder={t.adminSearchReports}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="lg:col-span-3 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                         <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="all">{t.adminAllStatuses}</option>
                            <option value="pending">{t.status.pending}</option>
                            <option value="in_review">{t.status.in_review}</option>
                            <option value="resolved">{t.status.resolved}</option>
                            <option value="closed">{t.status.closed}</option>
                        </select>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="date_desc">{t.sortDateNewest}</option>
                            <option value="date_asc">{t.sortDateOldest}</option>
                            <option value="item_asc">{t.sortItemAZ}</option>
                            <option value="item_desc">{t.sortItemZA}</option>
                            <option value="status_asc">{t.sortStatusAZ}</option>
                            <option value="status_desc">{t.sortStatusZA}</option>
                        </select>
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">{t.dateFrom}</label>
                                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">{t.dateTo}</label>
                                    <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                </div>
                            </div>
                            <button onClick={clearFilters} className="w-full px-4 py-2 bg-slate-600 text-white font-semibold text-sm rounded-md hover:bg-slate-700 transition-colors">
                                {t.adminClearFilters}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadItem}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadType}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadMatches}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadStatus}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadDate}</th>
                                    {/* FIX: Corrected the invalid translation key `t.adminReports` to `t.adminReportsTableHeadActions` */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadActions}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-md object-cover" src={report.imageUrl} alt={report.item} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{report.item}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {report.type === 'lost' ? t.adminReportTypeLost : t.adminReportTypeFound}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                            {report.matches?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative inline-block text-left">
                                                <select
                                                    value={report.status}
                                                    onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                                                    className={`appearance-none w-full px-3 pr-8 py-1 text-xs leading-5 font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary cursor-pointer ${selectStatusStyles[report.status]}`}
                                                >
                                                    <option value="pending" className="font-medium text-black bg-white">{t.status.pending}</option>
                                                    <option value="in_review" className="font-medium text-black bg-white">{t.status.in_review}</option>
                                                    <option value="resolved" className="font-medium text-black bg-white">{t.status.resolved}</option>
                                                    <option value="closed" className="font-medium text-black bg-white">{t.status.closed}</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-inherit">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900">{t.adminActionView}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportManagement;
