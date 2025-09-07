
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from '../../components/DashboardHeader';
import { useLanguage } from '../../contexts/LanguageContext';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import { mockReports } from '../../data/mockData';
import { ReportStatus } from '../ProfilePage';

const StatCard: React.FC<{ title: string; value: string | number; change?: string; }> = ({ title, value, change }) => (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {change && <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>}
    </div>
);


const AnalyticsPage: React.FC = () => {
    const { t, translateStatus } = useLanguage();
    const [eventFilter, setEventFilter] = useState('simhastha2028');

    const lineChartData = useMemo(() => {
        const dateCounts: { [key: string]: { lost: number, found: number } } = {};
        // Use a wider date range from the mock data for the chart
        const sortedReports = [...mockReports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sortedReports.length === 0) {
            return { labels: [], datasets: [] };
        }
        
        const firstDate = new Date(sortedReports[0].date);
        const lastDate = new Date(sortedReports[sortedReports.length-1].date);
        
        for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 1)) {
            dateCounts[d.toISOString().split('T')[0]] = { lost: 0, found: 0 };
        }

        mockReports.forEach(report => {
            const date = report.date;
            if (dateCounts[date]) {
                dateCounts[date][report.type]++;
            }
        });

        const sortedDates = Object.keys(dateCounts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        return {
            labels: sortedDates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
                { label: 'Lost', data: sortedDates.map(d => dateCounts[d].lost), color: '#dc2626' },
                { label: 'Found', data: sortedDates.map(d => dateCounts[d].found), color: '#16a34a' },
            ]
        };
    }, []);

    const { avgResolutionTimeDays, busiestDay, resolutionRate } = useMemo(() => {
        const resolved = mockReports.filter(r => r.status === 'resolved' && r.resolvedDate);
        let totalDays = 0;
        if (resolved.length > 0) {
            totalDays = resolved.reduce((sum, r) => {
                const reportedDate = new Date(r.date);
                const resolvedDate = new Date(r.resolvedDate!);
                const diffTime = Math.abs(resolvedDate.getTime() - reportedDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return sum + diffDays;
            }, 0);
        }
        const avgDays = resolved.length > 0 ? (totalDays / resolved.length).toFixed(1) : 'N/A';
        const rate = mockReports.length > 0 ? ((resolved.length / mockReports.length) * 100).toFixed(1) + '%' : 'N/A';
        
        const dayCounts = mockReports.reduce((acc, report) => {
            const day = new Date(report.date).toLocaleDateString('en-US', { weekday: 'long' });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const busiest = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return { avgResolutionTimeDays: avgDays, busiestDay: busiest, resolutionRate: rate };
    }, []);


    const categoryPieData = useMemo(() => {
        const categoryCounts = mockReports.reduce((acc, report) => {
            if (report.item.toLowerCase().includes('phone') || report.item.toLowerCase().includes('camera') || report.item.toLowerCase().includes('airpods')) {
                acc['Electronics'] = (acc['Electronics'] || 0) + 1;
            } else if (report.item.toLowerCase().includes('wallet') || report.item.toLowerCase().includes('keys') || report.item.toLowerCase().includes('card')) {
                 acc['Documents/Keys'] = (acc['Documents/Keys'] || 0) + 1;
            } else if (report.item.toLowerCase().includes('bag') || report.item.toLowerCase().includes('suitcase')) {
                 acc['Bags'] = (acc['Bags'] || 0) + 1;
            } else {
                 acc['Other'] = (acc['Other'] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const colors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#64748b'];
        return Object.entries(categoryCounts).map(([label, value], index) => ({
            label, value, color: colors[index % colors.length]
        }));
    }, []);

    const statusChartData = useMemo(() => {
        const statusCounts = mockReports.reduce((acc, report) => {
            acc[report.status] = (acc[report.status] || 0) + 1;
            return acc;
        }, {} as Record<ReportStatus, number>);

        const statusOrder: ReportStatus[] = ['pending', 'in_review', 'resolved', 'closed'];
        const colors: Record<ReportStatus, string> = { pending: '#f59e0b', in_review: '#3b82f6', resolved: '#22c55e', closed: '#64748b' };

        return statusOrder.map(status => ({
            label: translateStatus(status), value: statusCounts[status] || 0, color: colors[status]
        }));
    }, [translateStatus]);

    const riskZoneData = useMemo(() => {
        const locationCounts = mockReports.reduce((acc, report) => {
            acc[report.location] = (acc[report.location] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(locationCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
    }, []);
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.analyticsDashboardTitle} />
                
                <div className="mb-6 flex items-center">
                    <label htmlFor="eventFilter" className="text-sm font-medium text-gray-700 mr-2">{t.analyticsEvent}:</label>
                    <select id="eventFilter" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
                        <option value="all">{t.analyticsEventAll}</option>
                        <option value="simhastha2028">{t.analyticsEventSimhastha}</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title={t.analyticsTotalReports} value={mockReports.length} />
                    <StatCard title={t.analyticsResolvedRate} value={resolutionRate} />
                    <StatCard title={t.analyticsAvgResolutionTime} value={`${avgResolutionTimeDays} Days`} />
                    <StatCard title={t.analyticsBusiestDay} value={busiestDay} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-5 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">{t.analyticsReportsOverTime}</h3>
                        <LineChart data={lineChartData} />
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">{t.analyticsCategoryBreakdown}</h3>
                        <PieChart data={categoryPieData} />
                    </div>
                     <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">{t.analyticsStatusDistribution}</h3>
                        <BarChart data={statusChartData} />
                    </div>

                    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">{t.analyticsRiskZones}</h3>
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t.analyticsLocation}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t.analyticsReports}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riskZoneData.map(([location, count]) => (
                                    <tr key={location} className="bg-white border-b">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{location}</th>
                                        <td className="px-6 py-4 text-right font-bold">{count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg font-semibold text-gray-700">{t.analyticsHeatmapTitle}</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500">{t.analyticsHeatmapComingSoon}</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsPage;
