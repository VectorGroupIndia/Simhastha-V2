import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, FullUser } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Report } from './ProfilePage';
import { SosRequest } from './volunteer/VolunteerDashboard';
import { mockReports, mockUsers, mockHelpCenters, mockSosRequests, mockGroups, Group } from '../data/mockData';

// --- TYPE DEFINITIONS ---
type HelpCenter = { id: string; name: string; location: { lat: number; lng: number } };
type MapItem =
    | (Report & { itemType: 'report' })
    | (FullUser & { itemType: 'user' | 'groupmember' })
    | (SosRequest & { itemType: 'sos' })
    | (HelpCenter & { itemType: 'helpcenter' });

type ClusterItem = {
    id: string;
    itemType: 'cluster';
    count: number;
    coords: { lat: number; lng: number };
    items: MapItem[];
};

type DisplayableItem = MapItem | ClusterItem;

type FilterState = {
    lost: boolean;
    found: boolean;
    sos: boolean;
    volunteers: boolean;
    helpCenters: boolean;
    group: boolean;
    heatmap: boolean;
};

// --- ICONS (as inline components) ---
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const LegendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75V17.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>;

// --- HELPER FUNCTIONS ---
const MAP_BOUNDS = { latMin: 23.15, latMax: 23.22, lngMin: 75.74, lngMax: 75.82 };
const convertCoordsToPosition = (lat?: number, lng?: number) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return { top: '50%', left: '50%' };
    const clampedLat = Math.max(MAP_BOUNDS.latMin, Math.min(MAP_BOUNDS.latMax, lat));
    const clampedLng = Math.max(MAP_BOUNDS.lngMin, Math.min(MAP_BOUNDS.lngMax, lng));
    const top = ((MAP_BOUNDS.latMax - clampedLat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * 100;
    const left = ((clampedLng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)) * 100;
    return { top: `${Math.max(0, Math.min(100, top))}%`, left: `${Math.max(0, Math.min(100, left))}%` };
};

const getItemCoords = (item: DisplayableItem) => {
    switch (item.itemType) {
        case 'cluster': return item.coords;
        case 'report': return item.coords;
        case 'user':
        case 'groupmember': return item.lastKnownLocation;
        case 'sos':
        case 'helpcenter': return item.location;
        default: return undefined;
    }
};

const getMarker = (item: DisplayableItem) => {
    const baseClasses = "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 p-1 rounded-full flex items-center justify-center shadow-lg";
    switch (item.itemType) {
        case 'cluster':
            const size = item.count < 10 ? 32 : item.count < 50 ? 40 : 48;
            return (
                <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-xl"
                    style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size / 2.5}px` }}
                    title={`${item.count} items`}
                >
                    {item.count}
                </div>
            );
        case 'report': return <div className={`${baseClasses} ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'} text-white w-5 h-5`} title={item.item}>!</div>;
        case 'sos': return <div className={`${baseClasses} bg-red-600 w-6 h-6 animate-pulse`}><div className="bg-white w-2 h-2 rounded-full"></div></div>;
        case 'user': return <div className={`${baseClasses} bg-blue-500 w-4 h-4 border-2 border-white`}></div>;
        case 'groupmember': return <img src={item.avatarUrl} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 w-8 h-8 rounded-full border-2 border-purple-500 shadow-lg" title={item.name} />;
        case 'helpcenter': return <div className={`${baseClasses} bg-orange-500 text-white w-6 h-6`} title={item.name}>H</div>;
        default: return null;
    }
};

const calculateDistance = (pos1: { top: number; left: number }, pos2: { top: number; left: number }): number => {
    return Math.sqrt(Math.pow(pos1.left - pos2.left, 2) + Math.pow(pos1.top - pos2.top, 2));
};

// --- CLUSTERING HOOK ---
const useClustering = (items: MapItem[], distanceThreshold: number): DisplayableItem[] => {
    return useMemo(() => {
        if (!items.length) return [];

        const points = items
            .map(item => {
                const coords = getItemCoords(item);
                if (!coords) return null;
                const pos = convertCoordsToPosition(coords.lat, coords.lng);
                return {
                    item,
                    x: parseFloat(pos.left),
                    y: parseFloat(pos.top),
                    clustered: false,
                };
            })
            .filter(Boolean) as { item: MapItem; x: number; y: number; clustered: boolean }[];
        
        const clusteredItems: DisplayableItem[] = [];

        for (let i = 0; i < points.length; i++) {
            if (points[i].clustered) continue;
            points[i].clustered = true;
            
            const clusterGroup: MapItem[] = [points[i].item];

            for (let j = i + 1; j < points.length; j++) {
                if (points[j].clustered) continue;
                
                const dist = calculateDistance({ left: points[i].x, top: points[i].y }, { left: points[j].x, top: points[j].y });
                
                if (dist < distanceThreshold) {
                    points[j].clustered = true;
                    clusterGroup.push(points[j].item);
                }
            }
            
            if (clusterGroup.length > 1) {
                const avgLat = clusterGroup.reduce((sum, item) => sum + (getItemCoords(item)?.lat || 0), 0) / clusterGroup.length;
                const avgLng = clusterGroup.reduce((sum, item) => sum + (getItemCoords(item)?.lng || 0), 0) / clusterGroup.length;
                clusteredItems.push({
                    id: `cluster-${points[i].item.id}`,
                    itemType: 'cluster',
                    count: clusterGroup.length,
                    coords: { lat: avgLat, lng: avgLng },
                    items: clusterGroup,
                });
            } else {
                clusteredItems.push(clusterGroup[0]);
            }
        }
        return clusteredItems;
    }, [items, distanceThreshold]);
};


const LiveMapPage: React.FC = () => {
    const { user } = useAuth();
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [allUsers, setAllUsers] = useState<FullUser[]>([]);
    const [allSos, setAllSos] = useState<SosRequest[]>([]);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [activeItem, setActiveItem] = useState<DisplayableItem | null>(null);
    const [filters, setFilters] = useState<FilterState>({ lost: true, found: true, sos: true, volunteers: true, helpCenters: true, group: true, heatmap: false });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        try {
            setAllReports(JSON.parse(localStorage.getItem('foundtastic-all-reports') || '[]') || mockReports);
            setAllUsers(JSON.parse(localStorage.getItem('foundtastic-all-users') || '[]') || mockUsers);
            setAllSos(JSON.parse(localStorage.getItem('foundtastic-sos-requests') || '[]') || mockSosRequests);
            setAllGroups(JSON.parse(localStorage.getItem('foundtastic-all-groups') || '[]') || mockGroups);
        } catch (e) {
            console.error("Failed to load map data", e);
        }
    }, []);

    const handleFilterChange = (filterName: keyof FilterState) => {
        setFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
    };

    const mapItems = useMemo((): MapItem[] => {
        if (!user) return [];
        let items: MapItem[] = [];

        if (filters.helpCenters) {
            items.push(...mockHelpCenters.map(hc => ({ ...hc, itemType: 'helpcenter' as const })));
        }

        if (user.role === 'user') {
            const userReports = allReports.filter(r => r.id.includes(`rep-${user.id}`));
            if (filters.lost) items.push(...userReports.filter(r => r.type === 'lost').map(r => ({ ...r, itemType: 'report' as const })));
            if (filters.found) items.push(...userReports.filter(r => r.type === 'found').map(r => ({ ...r, itemType: 'report' as const })));
            if (filters.group && user.activeGroupId) {
                const activeGroup = allGroups.find(g => g.id === user.activeGroupId);
                if (activeGroup) {
                    const groupMembers = allUsers.filter(u => activeGroup.memberIds.includes(u.id) && u.id !== user.id);
                    items.push(...groupMembers.map(m => ({ ...m, itemType: 'groupmember' as const })));
                }
            }
        }

        if (user.role === 'volunteer' || user.role === 'authority') {
            if (filters.lost) items.push(...allReports.filter(r => r.type === 'lost').map(r => ({ ...r, itemType: 'report' as const })));
            if (filters.found) items.push(...allReports.filter(r => r.type === 'found').map(r => ({ ...r, itemType: 'report' as const })));
            if (filters.sos) items.push(...allSos.filter(s => s.status !== 'resolved').map(s => ({ ...s, itemType: 'sos' as const })));
            if (filters.volunteers) {
                const volunteers = allUsers.filter(u => u.role === 'volunteer' && u.status === 'active');
                items.push(...volunteers.map(v => ({ ...v, itemType: 'user' as const })));
            }
        }
        return items;
    }, [user, filters, allReports, allUsers, allSos, allGroups]);
    
    const displayableItems = useClustering(mapItems, 5); // 5% distance threshold for clustering

    return (
        <div className="flex h-screen overflow-hidden bg-gray-200">
            {/* --- SIDEBAR --- */}
            <aside className={`absolute md:relative z-30 bg-white/10 backdrop-blur-md text-white w-80 h-full flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center border-b border-white/20">
                    <h1 className="text-2xl font-bold">Live <span className="text-brand-secondary">Map</span></h1>
                    <Link to="/" className="text-sm hover:underline text-slate-300 hover:text-white">Exit</Link>
                </div>
                {/* Filters */}
                <div className="p-4 border-b border-white/20">
                    <h2 className="font-semibold mb-2 flex items-center text-slate-100"><FilterIcon className="w-5 h-5 mr-2" /> Filters</h2>
                    <div className="space-y-2">
                        {user && ['authority', 'volunteer'].includes(user.role) && <>
                            <Checkbox label="Lost Reports" checked={filters.lost} onChange={() => handleFilterChange('lost')} />
                            <Checkbox label="Found Reports" checked={filters.found} onChange={() => handleFilterChange('found')} />
                            <Checkbox label="SOS Alerts" checked={filters.sos} onChange={() => handleFilterChange('sos')} />
                            <Checkbox label="Volunteers" checked={filters.volunteers} onChange={() => handleFilterChange('volunteers')} />
                        </>}
                        {user?.role === 'user' && <Checkbox label="My Group" checked={filters.group} onChange={() => handleFilterChange('group')} />}
                        <Checkbox label="Help Centers" checked={filters.helpCenters} onChange={() => handleFilterChange('helpCenters')} />
                         {user?.role === 'authority' && <Checkbox label="Heatmap" checked={filters.heatmap} onChange={() => handleFilterChange('heatmap')} />}
                    </div>
                </div>
                {/* Legend */}
                <div className="p-4 flex-grow overflow-y-auto">
                    <h2 className="font-semibold mb-2 flex items-center text-slate-100"><LegendIcon className="w-5 h-5 mr-2" /> Legend</h2>
                    <ul className="space-y-2 text-sm text-slate-200">
                        <LegendItem color="bg-purple-600" text="Clustered Items" />
                        <LegendItem color="bg-red-500" text="Lost Report" />
                        <LegendItem color="bg-green-500" text="Found Report" />
                        <LegendItem color="bg-red-600 animate-pulse" text="SOS Alert" />
                        <LegendItem color="bg-blue-500" text="Volunteer" />
                        <LegendItem color="border-purple-500 border-2" text="Group Member" />
                        <LegendItem color="bg-orange-500" text="Help Center" />
                    </ul>
                </div>
            </aside>

            {/* --- MAP AREA --- */}
            <main className="flex-1 relative">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute top-4 left-4 z-40 p-2 bg-white rounded-md shadow-lg md:hidden">
                    {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <FilterIcon className="w-6 h-6" />}
                </button>
                <div className="absolute inset-0">
                    <iframe className="w-full h-full border-0 grayscale-[50%]" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=Ujjain&t=&z=14&ie=UTF8&iwloc=&output=embed&styles=featureType:all|elementType:labels|visibility:off`}></iframe>
                    {user?.role === 'authority' && filters.heatmap && (
                        <>
                            <div className="absolute w-64 h-64 bg-red-500/30 rounded-full blur-3xl" style={{ top: '30%', left: '40%' }}></div>
                            <div className="absolute w-48 h-48 bg-orange-500/20 rounded-full blur-2xl" style={{ top: '60%', left: '60%' }}></div>
                        </>
                    )}
                </div>
                {displayableItems.map((item) => {
                    const coords = getItemCoords(item);
                    const position = convertCoordsToPosition(coords?.lat, coords?.lng);
                    return <button key={item.id} onClick={() => setActiveItem(item)} className="absolute" style={position}>{getMarker(item)}</button>;
                })}

                {activeItem && <InfoWindow item={activeItem} onClose={() => setActiveItem(null)} />}
            </main>
        </div>
    );
};

// --- SUB-COMPONENTS for LiveMapPage ---
const Checkbox: React.FC<{ label: string; checked: boolean; onChange: () => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-200">
        <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded text-brand-secondary bg-white/10 border-white/20 focus:ring-brand-secondary focus:ring-2" />
        <span>{label}</span>
    </label>
);

const LegendItem: React.FC<{ color: string; text: string; }> = ({ color, text }) => (
    <li className="flex items-center">
        <span className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${color}`}></span>
        <span>{text}</span>
    </li>
);

const InfoWindow: React.FC<{ item: DisplayableItem; onClose: () => void; }> = ({ item, onClose }) => {
    const coords = getItemCoords(item);
    const position = convertCoordsToPosition(coords?.lat, coords?.lng);

    const renderItemContent = (subItem: MapItem) => {
        switch (subItem.itemType) {
            case 'report': return <span className={subItem.type === 'lost' ? 'text-red-600' : 'text-green-600'}>{subItem.item}</span>;
            case 'user': case 'groupmember': return <span className="text-blue-600">{subItem.name}</span>;
            case 'sos': return <span className="text-red-600">{subItem.message}</span>;
            case 'helpcenter': return <span className="text-orange-600">{subItem.name}</span>;
            default: return 'Item';
        }
    }

    return (
        <div className="absolute bg-white rounded-lg shadow-2xl w-64 transform -translate-y-full -translate-x-1/2 z-30 border-2 border-brand-primary" style={{ ...position, top: `calc(${position.top} - 2rem)` }}>
            <button onClick={onClose} className="absolute top-1 right-1 text-gray-400 hover:text-gray-700"><CloseIcon className="w-5 h-5" /></button>
            <div className="p-3">
                {item.itemType === 'cluster' ? (
                    <div>
                        <h3 className="font-bold text-purple-800">{item.count} items clustered here</h3>
                        <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto text-xs list-disc list-inside">
                            {item.items.map((subItem, index) => <li key={index} className="p-1 rounded">{renderItemContent(subItem)}</li>)}
                        </ul>
                    </div>
                ) : item.itemType === 'report' ? (
                    <>
                        <p className={`font-bold text-sm ${item.type === 'lost' ? 'text-red-700' : 'text-green-700'}`}>{item.item}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.location}</p>
                    </>
                ) : item.itemType === 'sos' ? (
                    <>
                        <p className="font-bold text-sm text-red-700">{item.message}</p>
                        <p className="text-xs text-gray-500">By: {item.userName}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.location.name}</p>
                    </>
                ) : (item.itemType === 'user' || item.itemType === 'groupmember') ? (
                    <>
                        <p className="font-bold text-sm text-blue-700">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                    </>
                ) : item.itemType === 'helpcenter' ? (
                    <>
                        <p className="font-bold text-sm text-orange-700">{item.name}</p>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default LiveMapPage;