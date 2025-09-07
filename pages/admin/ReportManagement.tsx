
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { Report, ReportStatus, statusStyles } from '../ProfilePage';
import DashboardHeader from '../../components/DashboardHeader';

const ReportManagement: React.FC = () => {
    const { t, translateStatus } = useLanguage();
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadActions}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.item}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`font-semibold ${report.type === 'lost' ? 'text-red-600' : 'text-green-600'}`}>
                                                {report.type === 'lost' ? t.adminReportTypeLost : t.adminReportTypeFound}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-brand-dark">
                                            {report.matches?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[report.status]}`}>
                                                {translateStatus(report.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <select 
                                                value={report.status} 
                                                onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-transparent border-none"
                                            >
                                                <option value="pending">{t.status.pending}</option>
                                                <option value="in_review">{t.status.in_review}</option>
                                                <option value="resolved">{t.status.resolved}</option>
                                                <option value="closed">{t.status.closed}</option>
                                            </select>
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