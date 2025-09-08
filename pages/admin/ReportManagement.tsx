import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { Report, ReportStatus } from '../ProfilePage';
import DashboardHeader from '../../components/DashboardHeader';
import ReportDetailsModal from '../../components/ReportDetailsModal';
import ConfirmationModal from '../../components/ConfirmationModal';

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
    const [statusFilter, setStatusFilter] = useState<ReportStatus[]>([]);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [sortOption, setSortOption] = useState<string>('date_desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [reportsPerPage] = useState(10);
    const [selectedReports, setSelectedReports] = useState<string[]>([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkStatusToApply, setBulkStatusToApply] = useState<ReportStatus | null>(null);
    
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredReports = useMemo(() => {
        let filtered = reports.filter(report => {
            const matchesSearch = report.item.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(report.status);
            const matchesType = typeFilter === 'all' || report.type === typeFilter;
            
            const reportDate = new Date(report.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
            const matchesDate = (!start || reportDate >= start) && (!end || reportDate <= end);

            return matchesSearch && matchesStatus && matchesType && matchesDate;
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
    }, [reports, searchTerm, statusFilter, typeFilter, startDate, endDate, sortOption]);

    const paginatedReports = useMemo(() => {
        const indexOfLastReport = currentPage * reportsPerPage;
        const indexOfFirstReport = indexOfLastReport - reportsPerPage;
        return filteredReports.slice(indexOfFirstReport, indexOfLastReport);
    }, [filteredReports, currentPage, reportsPerPage]);

    const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

    const handleStatusChange = (id: string, newStatus: ReportStatus) => {
        const updatedReports = reports.map(report =>
            report.id === id ? { ...report, status: newStatus } : report
        );
        setReports(updatedReports);
        localStorage.setItem('foundtastic-all-reports', JSON.stringify(updatedReports));
    };

    const handleStatusFilterChange = (status: ReportStatus) => {
        setStatusFilter(prev => {
            const isSelected = prev.includes(status);
            if (isSelected) {
                return prev.filter(s => s !== status);
            } else {
                return [...prev, status];
            }
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter([]);
        setTypeFilter('all');
        setSortOption('date_desc');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };
    
    const handleSelectReport = (id: string) => {
        setSelectedReports(prev => 
            prev.includes(id) ? prev.filter(reportId => reportId !== id) : [...prev, id]
        );
    };

    const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pageReportIds = paginatedReports.map(r => r.id);
        if (e.target.checked) {
            setSelectedReports(prev => [...new Set([...prev, ...pageReportIds])]);
        } else {
            setSelectedReports(prev => prev.filter(id => !pageReportIds.includes(id)));
        }
    };
    
    const isAllOnPageSelected = useMemo(() => {
        const pageReportIds = paginatedReports.map(r => r.id);
        return pageReportIds.length > 0 && pageReportIds.every(id => selectedReports.includes(id));
    }, [paginatedReports, selectedReports]);
    
    const isSomeOnPageSelected = useMemo(() => {
        const pageReportIds = paginatedReports.map(r => r.id);
        return pageReportIds.some(id => selectedReports.includes(id)) && !isAllOnPageSelected;
    }, [paginatedReports, selectedReports, isAllOnPageSelected]);

    const handleBulkStatusChangeRequest = (status: ReportStatus) => {
        if (!status) return;
        setBulkStatusToApply(status);
        setIsBulkModalOpen(true);
    };

    const handleConfirmBulkUpdate = () => {
        if (!bulkStatusToApply) return;

        const updatedReports = reports.map(report =>
            selectedReports.includes(report.id) ? { ...report, status: bulkStatusToApply } : report
        );
        setReports(updatedReports);
        localStorage.setItem('foundtastic-all-reports', JSON.stringify(updatedReports));

        setSelectedReports([]);
        setBulkStatusToApply(null);
        setIsBulkModalOpen(false);
    };

    const allStatuses: ReportStatus[] = ['pending', 'in_review', 'resolved', 'closed'];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.adminReportManagement} />

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4 items-end">
                        <div className="sm:col-span-2 lg:col-span-6">
                            <label htmlFor="search" className="sr-only">{t.adminSearchReports}</label>
                            <input
                                type="text"
                                id="search"
                                placeholder={t.adminSearchReports}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label htmlFor="typeFilter" className="block text-sm font-medium text-slate-700">{t.adminReportsTableHeadType}</label>
                            <select
                                id="typeFilter"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lost' | 'found')}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                            >
                                <option value="all">{t.adminAllTypes}</option>
                                <option value="lost">{t.adminReportTypeLost}</option>
                                <option value="found">{t.adminReportTypeFound}</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1" ref={statusDropdownRef}>
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700">{t.adminReportsTableHeadStatus}</label>
                            <div className="relative mt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                    className="relative w-full cursor-default rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm"
                                >
                                    <span className="block truncate">
                                        {statusFilter.length === 0 ? t.adminAllStatuses : statusFilter.map(s => t.status[s]).join(', ')}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l3.47-3.47a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </button>
                                {isStatusDropdownOpen && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        {allStatuses.map(status => (
                                            <label key={status} className="flex cursor-pointer items-center space-x-3 py-2 px-3 text-gray-900 hover:bg-gray-100">
                                                <input
                                                    type="checkbox"
                                                    checked={statusFilter.includes(status)}
                                                    onChange={() => handleStatusFilterChange(status)}
                                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                />
                                                <span>{t.status[status]}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">{t.dateFrom}</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">{t.dateTo}</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                        </div>
                        <div className="lg:col-span-1">
                            <label htmlFor="sortOption" className="block text-sm font-medium text-slate-700">{t.profileSortBy}</label>
                            <select
                                id="sortOption"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                            >
                                <option value="date_desc">{t.sortDateNewest}</option>
                                <option value="date_asc">{t.sortDateOldest}</option>
                                <option value="item_asc">{t.sortItemAZ}</option>
                                <option value="item_desc">{t.sortItemZA}</option>
                                <option value="status_asc">{t.sortStatusAZ}</option>
                                <option value="status_desc">{t.sortStatusZA}</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 invisible">Clear</label>
                            <button onClick={clearFilters} className="mt-1 w-full px-4 py-2 bg-slate-600 text-white font-semibold text-sm rounded-md hover:bg-slate-700 transition-colors">
                                {t.adminClearFilters}
                            </button>
                        </div>
                    </div>

                    {selectedReports.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-4">
                            <span className="text-sm font-semibold text-blue-800">
                                {t.bulkActionsWithCount.replace('{count}', selectedReports.length.toString())}
                            </span>
                            <select
                                onChange={(e) => handleBulkStatusChangeRequest(e.target.value as ReportStatus)}
                                className="block px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                value=""
                            >
                                <option value="" disabled>{t.changeStatus}...</option>
                                {allStatuses.map(status => (
                                    <option key={status} value={status}>{t.status[status]}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 w-4">
                                        <input 
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                            checked={isAllOnPageSelected}
                                            // FIX: The ref callback was implicitly returning a boolean, causing a type error. The arrow function's body is wrapped in curly braces to ensure it returns void.
                                            ref={el => {
                                                if (el) {
                                                    el.indeterminate = isSomeOnPageSelected;
                                                }
                                            }}
                                            onChange={handleSelectAllOnPage}
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadItem}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadType}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadMatches}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadStatus}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadDate}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminReportsTableHeadActions}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedReports.map((report) => (
                                    <tr key={report.id} className={selectedReports.includes(report.id) ? 'bg-blue-50' : ''}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <input 
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                checked={selectedReports.includes(report.id)}
                                                onChange={() => handleSelectReport(report.id)}
                                            />
                                        </td>
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => setViewingReport(report)} className="text-indigo-600 hover:text-indigo-900">{t.adminActionView}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="py-3 flex items-center justify-between border-t">
                        <div className="text-sm text-gray-700">
                            {t.paginationShowing.replace('{start}', ((currentPage-1)*reportsPerPage + 1).toString()).replace('{end}', (Math.min(currentPage*reportsPerPage, filteredReports.length)).toString()).replace('{total}', filteredReports.length.toString())}
                        </div>
                        <div className="flex-1 flex justify-between sm:justify-end">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                                {t.paginationPrevious}
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                                {t.paginationNext}
                            </button>
                        </div>
                    </div>
                </div>
                {viewingReport && <ReportDetailsModal report={viewingReport} onClose={() => setViewingReport(null)} />}
                 <ConfirmationModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    onConfirm={handleConfirmBulkUpdate}
                    title={t.bulkChangeStatusTitle}
                    message={<p>{t.bulkChangeStatusBody.replace('{count}', selectedReports.length.toString()).replace('{status}', bulkStatusToApply ? t.status[bulkStatusToApply] : '')}</p>}
                    confirmText={t.confirmButton}
                    variant="warning"
                />
            </main>
        </div>
    );
};

export default ReportManagement;