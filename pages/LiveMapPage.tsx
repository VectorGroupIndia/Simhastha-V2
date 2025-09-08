import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth, FullUser } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
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
const LayersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-6-6v-1.5a6 6 0 00-6 6v1.5a6 6 0 006 6v1.5z" /></svg>;
const MyLocationIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v.008M12 12.75h.008v.008H12v-.008zm0 5.25h.008v.008H12v-.008zm-5.25-.008h.008v.008H6.75v-.008zm10.5 0h.008v.008h-.008v-.008z" /></svg>;
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const GeofenceIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.37-1.716-.998L9.75 7.5l-4.875-2.437c-.381-.19-.622-.58-.622-1.006V19.18c0 .836.88 1.37 1.716.998l4.875-2.437a1.5 1.5 0 011.022 0l4.122 2.061a1.5 1.5 0 001.022 0z" /></svg>;


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
const convertPositionToCoords = (topPercent: number, leftPercent: number) => {
    const lat = MAP_BOUNDS.latMax - (topPercent / 100) * (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);
    const lng = MAP_BOUNDS.lngMin + (leftPercent / 100) * (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
    return { lat, lng };
};

const getItemCoords = (item: DisplayableItem) => {
    switch (item.itemType) {
        case 'cluster': return item.coords;
        case 'report': return item.coords;
        case 'user': case 'groupmember': return item.lastKnownLocation;
        case 'sos': case 'helpcenter': return item.location;
        default: return undefined;
    }
};

const getItemName = (item: DisplayableItem): string => {
    switch (item.itemType) {
        case 'cluster': return `${item.count} items`;
        case 'report': return item.item;
        case 'user': case 'groupmember': return item.name;
        case 'sos': return item.message;
        case 'helpcenter': return item.name;
        default: return 'Unknown';
    }
}

const getMarker = (item: DisplayableItem, isFaded: boolean, isActive: boolean) => {
    const activeClasses = isActive ? 'ring-4 ring-yellow-400 z-20 scale-125' : '';
    const baseClasses = `absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 p-1 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isFaded ? 'opacity-20' : 'opacity-100'} ${activeClasses}`;
    switch (item.itemType) {
        case 'cluster':
            const size = item.count < 10 ? 32 : item.count < 50 ? 40 : 48;
            return (
                <div
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-xl transition-all duration-300 ${isFaded ? 'opacity-20' : 'opacity-100'} ${activeClasses}`}
                    style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size / 2.5}px` }}
                    title={`${item.count} items`}
                >
                    {item.count}
                </div>
            );
        case 'report': return <div className={`${baseClasses} ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'} text-white w-5 h-5`} title={item.item}>!</div>;
        case 'sos': return <div className={`${baseClasses} bg-red-600 w-6 h-6 animate-pulse`}><div className="bg-white w-2 h-2 rounded-full"></div></div>;
        case 'user': return <div className={`${baseClasses} bg-blue-500 w-4 h-4 border-2 border-white`}></div>;
        case 'groupmember': return <img src={item.avatarUrl} className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 w-8 h-8 rounded-full border-2 border-purple-500 shadow-lg transition-all duration-300 ${isFaded ? 'opacity-20' : 'opacity-100'} ${activeClasses}`} title={item.name} />;
        case 'helpcenter': return <div className={`${baseClasses} bg-orange-500 text-white w-6 h-6`} title={item.name}>H</div>;
        default: return null;
    }
};

const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
};

// --- ENHANCED CLUSTERING HOOK ---
const useClustering = (items: MapItem[], zoom: number): DisplayableItem[] => {
    const CLUSTER_THRESHOLD_BASE = 15; // in percent of map width/height
    const distanceThreshold = useMemo(() => CLUSTER_THRESHOLD_BASE / zoom, [zoom]);

    return useMemo(() => {
        if (!items.length) return [];

        const points = items.map(item => {
            const coords = getItemCoords(item);
            if (!coords || !coords.lat || !coords.lng) return null;
            const pos = convertCoordsToPosition(coords.lat, coords.lng);
            return { item, x: parseFloat(pos.left), y: parseFloat(pos.top) };
        }).filter(Boolean) as { item: MapItem; x: number; y: number }[];

        const gridSize = distanceThreshold;
        const grid: Map<string, { item: MapItem; x: number; y: number }[]> = new Map();
        points.forEach(point => {
            const cellX = Math.floor(point.x / gridSize);
            const cellY = Math.floor(point.y / gridSize);
            const key = `${cellX}_${cellY}`;
            if (!grid.has(key)) grid.set(key, []);
            grid.get(key)!.push(point);
        });

        const clusteredItems: DisplayableItem[] = [];
        const visited = new Set<string>();

        points.forEach(point => {
            if (visited.has(point.item.id)) return;
            const cluster: MapItem[] = [];
            const queue = [point];
            visited.add(point.item.id);

            while (queue.length > 0) {
                const currentPoint = queue.shift()!;
                cluster.push(currentPoint.item);
                const cellX = Math.floor(currentPoint.x / gridSize);
                const cellY = Math.floor(currentPoint.y / gridSize);

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const key = `${cellX + dx}_${cellY + dy}`;
                        if (grid.has(key)) {
                            grid.get(key)!.forEach(neighborPoint => {
                                if (!visited.has(neighborPoint.item.id) && calculateDistance(currentPoint, neighborPoint) < distanceThreshold) {
                                    visited.add(neighborPoint.item.id);
                                    queue.push(neighborPoint);
                                }
                            });
                        }
                    }
                }
            }

            if (cluster.length > 1) {
                const avgLat = cluster.reduce((sum, item) => sum + (getItemCoords(item)?.lat || 0), 0) / cluster.length;
                const avgLng = cluster.reduce((sum, item) => sum + (getItemCoords(item)?.lng || 0), 0) / cluster.length;
                clusteredItems.push({
                    id: `cluster-${point.item.id}`,
                    itemType: 'cluster',
                    count: cluster.length,
                    coords: { lat: avgLat, lng: avgLng },
                    items: cluster,
                });
            } else {
                clusteredItems.push(cluster[0]);
            }
        });

        return clusteredItems;
    }, [items, distanceThreshold]);
};

// --- SUB-COMPONENTS for LiveMapModal ---
const Checkbox: React.FC<{ label: string; checked: boolean; onChange: () => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-200">
        <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded text-brand-secondary bg-white/10 border-white/20 focus:ring-brand-secondary focus:ring-2" />
        <span>{label}</span>
    </label>
);

const LayerControls: React.FC<{ filters: FilterState; onFilterChange: (filterName: keyof FilterState) => void; userRole: string | undefined }> = ({ filters, onFilterChange, userRole }) => (
    <div className="absolute top-16 left-4 z-20 bg-black/50 backdrop-blur-md text-white p-4 rounded-lg shadow-2xl w-60">
        <h2 className="font-semibold mb-2 flex items-center text-slate-100"><LayersIcon className="w-5 h-5 mr-2" /> Layers</h2>
        <div className="space-y-2">
            {userRole && ['authority', 'volunteer'].includes(userRole) && <>
                <Checkbox label="Lost Reports" checked={filters.lost} onChange={() => onFilterChange('lost')} />
                <Checkbox label="Found Reports" checked={filters.found} onChange={() => onFilterChange('found')} />
                <Checkbox label="SOS Alerts" checked={filters.sos} onChange={() => onFilterChange('sos')} />
                <Checkbox label="Volunteers" checked={filters.volunteers} onChange={() => onFilterChange('volunteers')} />
            </>}
            {userRole === 'user' && <Checkbox label="My Group" checked={filters.group} onChange={() => onFilterChange('group')} />}
            <Checkbox label="Help Centers" checked={filters.helpCenters} onChange={() => onFilterChange('helpCenters')} />
            {userRole === 'authority' && <Checkbox label="Heatmap" checked={filters.heatmap} onChange={() => onFilterChange('heatmap')} />}
        </div>
    </div>
);

const GeofenceControls: React.FC<{ onSet: () => void; onClear: () => void; isDrawing: boolean; hasGeofence: boolean; }> = ({ onSet, onClear, isDrawing, hasGeofence }) => (
    <div className="absolute top-16 right-4 z-20 bg-black/50 backdrop-blur-md text-white p-4 rounded-lg shadow-2xl w-60">
        <h2 className="font-semibold mb-2 flex items-center text-slate-100"><GeofenceIcon className="w-5 h-5 mr-2" /> Geofence</h2>
        <div className="space-y-2">
            <button onClick={onSet} disabled={isDrawing} className="w-full text-sm py-2 px-3 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-slate-500">{isDrawing ? 'Drawing...' : 'Set Safe Area'}</button>
            {hasGeofence && <button onClick={onClear} className="w-full text-sm py-2 px-3 bg-red-600 rounded hover:bg-red-700">Clear Area</button>}
            <p className="text-xs text-slate-300 mt-1">Click 'Set Area', then click and drag on the map to create a safe zone for your group.</p>
        </div>
    </div>
);

const SearchBar: React.FC<{ query: string; onQueryChange: (q: string) => void }> = ({ query, onQueryChange }) => (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm">
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search items or people..."
                className="block w-full rounded-full border-0 bg-white/80 py-2.5 pl-10 pr-3 text-gray-900 shadow-lg ring-1 ring-inset ring-gray-300 backdrop-blur-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary"
            />
        </div>
    </div>
);

const HeatmapLayer: React.FC<{ reports: Report[] }> = ({ reports }) => (
    <div className="absolute inset-0 pointer-events-none">
        {reports.map(report => {
            if(!report.coords) return null;
            const position = convertCoordsToPosition(report.coords.lat, report.coords.lng);
            return (
                <div
                    key={report.id}
                    className="absolute rounded-full"
                    style={{
                        ...position,
                        width: '100px',
                        height: '100px',
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, rgba(255,80,0,0.4) 0%, rgba(255,80,0,0) 60%)',
                    }}
                />
            );
        })}
    </div>
);

const UserLocationMarker: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
    const position = convertCoordsToPosition(lat, lng);
    return (
        <div className="absolute z-30" style={position}>
            <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-sky-500 border-2 border-white"></span>
            </span>
        </div>
    );
};

const InfoWindow: React.FC<{ item: DisplayableItem; onClose: () => void; }> = ({ item, onClose }) => {
    const coords = getItemCoords(item);
    if (!coords) return null;
    const position = convertCoordsToPosition(coords.lat, coords.lng);
    
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
                    <>
                        <h3 className="font-bold text-purple-800">{item.count} items clustered here</h3>
                        <p className="text-xs text-slate-500">Click cluster or zoom in to see more.</p>
                        <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto text-xs list-disc list-inside">
                            {item.items.map((subItem, index) => <li key={index} className="p-1 rounded">{renderItemContent(subItem)}</li>)}
                        </ul>
                    </>
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
                    <p className="font-bold text-sm text-orange-700">{item.name}</p>
                ) : null}
            </div>
        </div>
    );
};

const Tooltip: React.FC<{ item: DisplayableItem }> = ({ item }) => {
    const coords = getItemCoords(item);
    if (!coords) return null;
    const position = convertCoordsToPosition(coords.lat, coords.lng);
    return (
        <div className="absolute bg-black/70 text-white text-xs px-2 py-1 rounded-md shadow-lg transform -translate-y-full -translate-x-1/2 z-40 pointer-events-none" style={{ ...position, top: `calc(${position.top} - 2.5rem)` }}>
            {getItemName(item)}
        </div>
    );
};

const GeofenceCircle: React.FC<{ center: { x: number, y: number } | null; radius: number }> = ({ center, radius }) => {
    if (!center || radius <= 0) return null;
    return (
        <div className="absolute border-2 border-dashed border-blue-400 bg-blue-500/20 rounded-full pointer-events-none"
            style={{
                top: `${center.y}%`,
                left: `${center.x}%`,
                width: `${radius * 2}%`,
                height: `${radius * 2}%`,
                transform: 'translate(-50%, -50%)',
            }}
        />
    );
};

interface LiveMapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LiveMapModal: React.FC<LiveMapModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const mapRef = useRef<HTMLDivElement>(null);

    // Data State
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [allUsers, setAllUsers] = useState<FullUser[]>([]);
    const [allSos, setAllSos] = useState<SosRequest[]>([]);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    
    // UI State
    const [activeItem, setActiveItem] = useState<DisplayableItem | null>(null);
    const [hoveredItem, setHoveredItem] = useState<DisplayableItem | null>(null);
    const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true);
    const [isGeofencePanelOpen, setIsGeofencePanelOpen] = useState(user?.role === 'user');
    const [zoom, setZoom] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const MAX_ZOOM = 5;

    // Filters State
    const [filters, setFilters] = useState<FilterState>(() => {
        const defaultFilters = { lost: true, found: true, sos: true, volunteers: true, helpCenters: true, group: true, heatmap: false };
        if (!user) return defaultFilters;
        try {
            const savedFilters = localStorage.getItem(`foundtastic-map-filters-${user.id}`);
            return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
        } catch {
            return defaultFilters;
        }
    });

    // Geofence State
    const [geofence, setGeofence] = useState<{ center: { x: number, y: number }, radius: number } | null>(null); // Stored in %
    const [isDrawingGeofence, setIsDrawingGeofence] = useState(false);
    const [drawingGeofence, setDrawingGeofence] = useState<{ center: { x: number, y: number } | null; radius: number }>({ center: null, radius: 0 });
    const [alertedMembers, setAlertedMembers] = useState<string[]>([]);

    // --- DATA LOADING & PERSISTENCE ---
    useEffect(() => {
        if (isOpen) {
            try {
                setAllReports(JSON.parse(localStorage.getItem('foundtastic-all-reports') || 'null') || mockReports);
                setAllUsers(JSON.parse(localStorage.getItem('foundtastic-all-users') || 'null') || mockUsers);
                setAllSos(JSON.parse(localStorage.getItem('foundtastic-sos-requests') || 'null') || mockSosRequests);
                setAllGroups(JSON.parse(localStorage.getItem('foundtastic-all-groups') || 'null') || mockGroups);
            } catch (e) { console.error("Failed to load map data", e); }
        }
    }, [isOpen]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(`foundtastic-map-filters-${user.id}`, JSON.stringify(filters));
        }
    }, [filters, user]);

    // --- DATA COMPUTATION ---
    const groupMembers = useMemo(() => {
        if (!user?.activeGroupId) return [];
        const activeGroup = allGroups.find(g => g.id === user.activeGroupId);
        if (!activeGroup) return [];
        return allUsers.filter(u => activeGroup.memberIds.includes(u.id));
    }, [user, allGroups, allUsers]);

    const mapItems = useMemo((): MapItem[] => {
        if (!user) return [];
        let items: MapItem[] = [];

        if (filters.helpCenters) items.push(...mockHelpCenters.map(hc => ({ ...hc, itemType: 'helpcenter' as const })));
        if (filters.lost) items.push(...allReports.filter(r => r.type === 'lost').map(r => ({ ...r, itemType: 'report' as const })));
        if (filters.found) items.push(...allReports.filter(r => r.type === 'found').map(r => ({ ...r, itemType: 'report' as const })));
        if (filters.sos) items.push(...allSos.filter(s => s.status !== 'resolved').map(s => ({ ...s, itemType: 'sos' as const })));
        if (filters.volunteers) items.push(...allUsers.filter(u => u.role === 'volunteer' && u.status === 'active').map(v => ({ ...v, itemType: 'user' as const })));
        if (filters.group) items.push(...groupMembers.map(m => ({ ...m, itemType: 'groupmember' as const })));
        
        if(searchQuery.trim()){
            const lowerCaseQuery = searchQuery.toLowerCase();
            return items.filter(item => {
                const name = getItemName(item).toLowerCase();
                return name.includes(lowerCaseQuery);
            });
        }
        return items;
    }, [user, filters, allReports, allUsers, allSos, groupMembers, searchQuery]);
    
    const displayableItems = useClustering(mapItems, zoom);

    // --- GEOFENCING LOGIC ---
    useEffect(() => {
        if (!geofence) return;
        const interval = setInterval(() => {
            groupMembers.forEach(member => {
                const memberCoords = member.lastKnownLocation;
                if (!memberCoords || alertedMembers.includes(member.id)) return;
                const pos = convertCoordsToPosition(memberCoords.lat, memberCoords.lng);
                const memberPos = { x: parseFloat(pos.left), y: parseFloat(pos.top) };
                const distance = calculateDistance(geofence.center, memberPos);
                if (distance > geofence.radius) {
                    addNotification({ title: 'Geofence Alert!', message: `${member.name} has left the designated safe area.` });
                    setAlertedMembers(prev => [...prev, member.id]);
                }
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [geofence, groupMembers, addNotification, alertedMembers]);
    
    const clearGeofence = () => {
        setGeofence(null);
        setAlertedMembers([]);
    };

    // --- EVENT HANDLERS ---
    const handleFilterChange = (filterName: keyof FilterState) => setFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
                (error) => console.error("Geolocation error:", error)
            );
        }
    };
    
    const handleMarkerClick = (item: DisplayableItem) => {
        if (item.itemType === 'cluster') {
            setZoom(prev => Math.min(MAX_ZOOM, prev + 1));
            setActiveItem(null); 
        } else {
            setActiveItem(item);
        }
    };

    const getMapRelativeCoords = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = mapRef.current!.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        return { x, y };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingGeofence) return;
        const center = getMapRelativeCoords(e);
        setDrawingGeofence({ center, radius: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingGeofence || !drawingGeofence.center) return;
        const currentPos = getMapRelativeCoords(e);
        const radius = calculateDistance(drawingGeofence.center, currentPos);
        setDrawingGeofence(prev => ({ ...prev, radius }));
    };

    const handleMouseUp = () => {
        if (!isDrawingGeofence || !drawingGeofence.center) return;
        setGeofence({ center: drawingGeofence.center, radius: drawingGeofence.radius });
        setIsDrawingGeofence(false);
        setDrawingGeofence({ center: null, radius: 0 });
    };

    if (!isOpen) {
        return null;
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative h-full w-full bg-gray-200 rounded-lg overflow-hidden shadow-2xl">
                <header className="absolute top-4 left-4 z-20">
                     <h1 className="text-2xl font-bold text-brand-dark bg-white/70 backdrop-blur-sm p-2 rounded-lg shadow-lg">found<span className="text-brand-secondary">tastic</span> Live Map</h1>
                </header>
                <button onClick={onClose} className="absolute top-4 right-4 z-30 bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-lg text-brand-dark hover:bg-white transition-colors" aria-label="Close map">
                    <CloseIcon className="w-6 h-6" />
                </button>
                
                <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />

                {isLayerPanelOpen && <LayerControls filters={filters} onFilterChange={handleFilterChange} userRole={user?.role} />}
                {user?.role === 'user' && isGeofencePanelOpen && (
                    <GeofenceControls
                        onSet={() => setIsDrawingGeofence(true)}
                        onClear={clearGeofence}
                        isDrawing={isDrawingGeofence}
                        hasGeofence={!!geofence}
                    />
                )}
                
                <div className="absolute bottom-4 right-4 z-20 flex flex-col space-y-2">
                    <button onClick={() => setIsLayerPanelOpen(p => !p)} title="Toggle Layers" className="w-12 h-12 bg-white/80 rounded-full shadow-lg text-brand-dark backdrop-blur-sm hover:bg-white transition-colors flex items-center justify-center"><LayersIcon className="w-6 h-6" /></button>
                    {user?.role === 'user' && <button onClick={() => setIsGeofencePanelOpen(p => !p)} title="Toggle Geofence" className="w-12 h-12 bg-white/80 rounded-full shadow-lg text-brand-dark backdrop-blur-sm hover:bg-white transition-colors flex items-center justify-center"><GeofenceIcon className="w-6 h-6" /></button>}
                    <button onClick={handleLocateMe} title="Find My Location" className="w-12 h-12 bg-white/80 rounded-full shadow-lg text-brand-dark backdrop-blur-sm hover:bg-white transition-colors flex items-center justify-center"><MyLocationIcon className="w-6 h-6" /></button>
                    <button onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + 1))} title="Zoom In" className="w-12 h-12 bg-white/80 rounded-full shadow-lg font-bold text-2xl text-brand-dark backdrop-blur-sm hover:bg-white transition-colors disabled:opacity-50" disabled={zoom === MAX_ZOOM}>+</button>
                    <button onClick={() => setZoom(z => Math.max(1, z - 1))} title="Zoom Out" className="w-12 h-12 bg-white/80 rounded-full shadow-lg font-bold text-2xl text-brand-dark backdrop-blur-sm hover:bg-white transition-colors disabled:opacity-50" disabled={zoom === 1}>-</button>
                </div>

                <main ref={mapRef} className="w-full h-full relative" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                    <div className="absolute inset-0">
                        <iframe className="w-full h-full border-0 grayscale-[50%]" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=Ujjain&t=&z=14&ie=UTF8&iwloc=&output=embed&styles=featureType:all|elementType:labels|visibility:off`}></iframe>
                        {user?.role === 'authority' && filters.heatmap && <HeatmapLayer reports={allReports} />}
                    </div>

                    {displayableItems.map((item) => {
                        const coords = getItemCoords(item);
                        if (!coords) return null;
                        const position = convertCoordsToPosition(coords.lat, coords.lng);
                        const isActive = activeItem?.id === item.id;
                        const isFaded = searchQuery.trim() && !mapItems.some(i => i.id === item.id);
                        return (
                            <button key={item.id}
                                onClick={() => handleMarkerClick(item)}
                                onMouseEnter={() => setHoveredItem(item)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="absolute" style={position}>
                                {getMarker(item, isFaded, isActive)}
                            </button>
                        );
                    })}
                    
                    {userLocation && <UserLocationMarker lat={userLocation.lat} lng={userLocation.lng} />}
                    <GeofenceCircle {...geofence} />
                    <GeofenceCircle {...drawingGeofence} />
                    
                    {activeItem && <InfoWindow item={activeItem} onClose={() => setActiveItem(null)} />}
                    {hoveredItem && (!activeItem || activeItem.id !== hoveredItem.id) && <Tooltip item={hoveredItem} />}
                </main>
            </div>
        </div>
    );
};

export default LiveMapModal;
