import { Report } from '../pages/ProfilePage';
import { SosRequest } from '../pages/volunteer/VolunteerDashboard';
import { FullUser } from '../contexts/AuthContext';
import { Sighting } from '../pages/authority/CCTVMonitoringPage';

export interface Group {
    id: string;
    name: string;
    adminId: string;
    memberIds: string[];
}

export interface VolunteerTask {
    id: string;
    title: string;
    description: string;
    location: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string; // YYYY-MM-DD
    completionNotes?: string;
}

export const mockUsers: (Omit<FullUser, 'status'> & { password?: string, status: 'active' | 'suspended' })[] = [
    // --- Citizens ---
    { id: 'u1', name: 'Rohan Sharma', email: 'citizen@foundtastic.com', password: 'password', role: 'user', title: 'Pilgrim', phone: '+91 98765 43210', memberSince: '2024-07-15', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=citizen@foundtastic.com', groupIds: ['g1', 'g2'], activeGroupId: 'g1', lastKnownLocation: { lat: 23.1795, lng: 75.7831, timestamp: '2024-07-26T10:30:00Z' } },
    { id: 'u5', name: 'Anjali Gupta', email: 'anjali@example.com', password: 'password', role: 'user', title: 'Pilgrim', phone: '+91 98765 11223', memberSince: '2024-07-20', status: 'suspended', avatarUrl: 'https://i.pravatar.cc/150?u=anjali@example.com', groupIds: ['g1'], activeGroupId: 'g1', lastKnownLocation: { lat: 23.1765, lng: 75.7885, timestamp: '2024-07-26T10:32:00Z' } },
    { id: 'u7', name: 'Prakash Mehra', email: 'prakash@example.com', password: 'password', role: 'user', title: 'Pilgrim', phone: '+91 90011 22334', memberSince: '2024-07-22', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=prakash@example.com', groupIds: ['g2'], activeGroupId: 'g2', lastKnownLocation: { lat: 23.1973, lng: 75.7944, timestamp: '2024-07-26T09:45:00Z' } },
    { id: 'u8', name: 'Sunita Devi', email: 'sunita@example.com', password: 'password', role: 'user', title: 'Pilgrim', phone: '+91 91122 55667', memberSince: '2024-07-23', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=sunita@example.com', groupIds: [], activeGroupId: null, lastKnownLocation: { lat: 23.1815, lng: 75.7685, timestamp: '2024-07-26T11:00:00Z' } },
     { id: 'u9', name: 'Kavita Joshi', email: 'kavita@example.com', password: 'password', role: 'user', title: 'Pilgrim', phone: '+91 92233 66778', memberSince: '2024-07-24', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=kavita@example.com', groupIds: ['g1'], activeGroupId: 'g1', lastKnownLocation: { lat: 23.1855, lng: 75.7695, timestamp: '2024-07-26T11:02:00Z' } },


    // --- Admin & Authority ---
    { id: 'u2', name: 'Admin User', email: 'admin@foundtastic.com', password: 'password', role: 'admin', title: 'Platform Administrator', phone: '+91 91122 33445', memberSince: '2024-07-10', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=admin@foundtastic.com', groupIds: [], activeGroupId: null },
    { id: 'u3', name: 'Priya Singh', email: 'authority@foundtastic.com', password: 'password', role: 'authority', title: 'Senior Officer', phone: '+91 91234 56789', assignedZone: 'Ram Ghat Sector', memberSince: '2024-07-12', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=authority@foundtastic.com', groupIds: [], activeGroupId: null, lastKnownLocation: { lat: 23.18, lng: 75.77, timestamp: '2024-07-26T11:15:00Z' } },

    // --- Volunteers ---
    { id: 'u4', name: 'Amit Kumar', email: 'volunteer@foundtastic.com', password: 'password', role: 'volunteer', title: 'Field Volunteer', phone: '+91 99887 76655', skills: ['First Aid Certified', 'Hindi', 'English', 'Marathi'], memberSince: '2024-07-18', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=volunteer@foundtastic.com', groupIds: [], activeGroupId: null, lastKnownLocation: { lat: 23.1821, lng: 75.7695, timestamp: '2024-07-26T11:05:00Z' } },
    { id: 'u6', name: 'Sandeep Verma', email: 'sandeep@example.com', password: 'password', role: 'volunteer', title: 'Help Desk Staff', phone: '+91 95566 77889', skills: ['Hindi', 'English', 'Gujarati'], memberSince: '2024-07-22', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=sandeep@example.com', groupIds: [], activeGroupId: null, lastKnownLocation: { lat: 23.1865, lng: 75.7665, timestamp: '2024-07-26T11:10:00Z' } },
    { id: 'u10', name: 'Meena Patel', email: 'meena@example.com', password: 'password', role: 'volunteer', title: 'Field Volunteer', phone: '+91 93344 88990', skills: ['Crowd Management', 'Hindi'], memberSince: '2024-07-25', status: 'active', avatarUrl: 'https://i.pravatar.cc/150?u=meena@example.com', groupIds: [], activeGroupId: null, lastKnownLocation: { lat: 23.1788, lng: 75.7844, timestamp: '2024-07-26T11:12:00Z' } },
];

export const mockGroups: Group[] = [
    { id: 'g1', name: 'Sharma Family', adminId: 'u1', memberIds: ['u1', 'u5', 'u9'], },
    { id: 'g2', name: 'Kumbh Friends Trip', adminId: 'u1', memberIds: ['u1', 'u7'], }
];

// @ts-ignore (reporterId is added to the Report interface)
export const mockReports: Report[] = [
    // --- Missing Person Reports ---
    { id: 'rep-p1', reporterId: 'u8', reportCategory: 'person', type: 'lost', item: 'Mahesh Kumar', description: 'Elderly man, wearing a white kurta and dhoti. He is about 5\'6" and has a walking stick. He might be disoriented.', date: '2024-07-23', status: 'in_review', location: 'Ram Ghat area', coords: { lat: 23.1815, lng: 75.7685 }, imageUrls: ['https://images.unsplash.com/photo-1582233479533-2a9f6a42a420?q=80&w=400'], age: 72, gender: 'Male' },
    { id: 'rep-p2', reporterId: 'u9', reportCategory: 'person', type: 'lost', item: 'Priya', description: 'Young girl, wearing a bright yellow frock and has two ponytails. She was holding a small doll.', date: '2024-07-25', status: 'pending', location: 'Near Mahakaleshwar Temple entrance', coords: { lat: 23.1865, lng: 75.7665 }, imageUrls: ['https://images.unsplash.com/photo-1519241345512-a63dd2134516?q=80&w=400'], age: 6, gender: 'Female' },
    
    // --- Lost & Found Item Reports ---
    { id: 'rep1', reporterId: 'u1', reportCategory: 'item', type: 'lost', item: 'iPhone 14 Pro', description: 'Black iPhone 14 Pro with a small crack on the top left corner. Has a blue Spigen case.', date: '2024-07-25', status: 'in_review', location: 'Ram Ghat, Ujjain', coords: { lat: 23.1818, lng: 75.7688 }, imageUrls: ['https://images.unsplash.com/photo-1677353952934-6e53f47c3e58?q=80&w=400'], matches: ['rep2'] },
    { id: 'rep2', reporterId: 'u4', reportCategory: 'item', type: 'found', item: 'Apple iPhone', description: 'Found a black iPhone near the river. It has a cracked screen and a blue case. It is locked. Handed over to Help Desk 2.', date: '2024-07-25', status: 'pending', location: 'Ram Ghat, Ujjain', coords: { lat: 23.1816, lng: 75.7686 }, imageUrls: ['https://images.unsplash.com/photo-1677353952934-6e53f47c3e58?q=80&w=400'], matches: ['rep1'] },
    { id: 'rep3', reporterId: 'u7', reportCategory: 'item', type: 'lost', item: 'Child\'s Blue Backpack', description: 'Small blue backpack with a Spider-Man keychain. Contains a water bottle and a lunchbox.', date: '2024-07-24', status: 'resolved', resolvedDate: '2024-07-25', location: 'Mahakaleshwar Temple', coords: { lat: 23.1860, lng: 75.7660 }, imageUrls: ['https://images.unsplash.com/photo-1553062407-98e365097524?q=80&w=400'] },
    { id: 'rep4', reporterId: 'u6', reportCategory: 'item', type: 'found', item: 'Leather Wallet', description: 'Brown leather wallet containing some cash and an ID card for Suresh Kumar.', date: '2024-07-24', status: 'resolved', resolvedDate: '2024-07-25', location: 'Food court area', coords: { lat: 23.1765, lng: 75.7885 }, imageUrls: ['https://images.unsplash.com/photo-1613093902319-5b7541b4a370?q=80&w=400'] },
    { id: 'rep5', reporterId: 'u5', reportCategory: 'item', type: 'lost', item: 'Silver Watch', description: 'Titan silver watch with a metal strap. Has a small scratch on the glass.', date: '2024-07-23', status: 'closed', location: 'Harsiddhi Temple', coords: { lat: 23.1837, lng: 75.7661 }, imageUrls: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=400'] },
    { id: 'rep6', reporterId: 'u10', reportCategory: 'item', type: 'found', item: 'Set of Keys', description: 'A bunch of keys with a red Maruti car key and a few house keys.', date: '2024-07-23', status: 'in_review', location: 'Parking Lot B', coords: { lat: 23.1750, lng: 75.7850 }, imageUrls: ['https://images.unsplash.com/photo-1564282864384-35c2763d333b?q=80&w=400'] },
    { id: 'rep7', reporterId: 'u1', reportCategory: 'item', type: 'lost', item: 'Black DSLR Camera', description: 'Nikon D5600 camera in a black bag with one extra lens.', date: '2024-07-22', status: 'pending', location: 'Near Shipra River bridge', coords: { lat: 23.1800, lng: 75.7720 }, imageUrls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400'] },
    { id: 'rep8', reporterId: 'u4', reportCategory: 'item', type: 'found', item: 'Prescription Glasses', description: 'Black framed prescription glasses in a blue case.', date: '2024-07-22', status: 'pending', location: 'Help Desk 3', coords: { lat: 23.1830, lng: 75.7650 }, imageUrls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400'] },
    { id: 'rep9', reporterId: 'u5', reportCategory: 'item', type: 'lost', item: 'Red Scarf', description: 'A plain red woolen scarf.', date: '2024-07-15', status: 'closed', location: 'Ujjain Railway Station', coords: { lat: 23.1754, lng: 75.7733 }, imageUrls: ['https://images.unsplash.com/photo-1600361099105-779c45038f32?q=80&w=400'] },
    { id: 'rep10', reporterId: 'u6', reportCategory: 'item', type: 'found', item: 'Samsonite Suitcase', description: 'A large blue hard-shell suitcase.', date: '2024-07-20', status: 'resolved', resolvedDate: '2024-07-22', location: 'Nanakheda Bus Stand', coords: { lat: 23.1973, lng: 75.7944 }, imageUrls: ['https://images.unsplash.com/photo-1581553983792-c138b254d036?q=80&w=400'] },
    { id: 'rep11', reporterId: 'u7', reportCategory: 'item', type: 'lost', item: 'Airpods Pro', description: 'Apple Airpods Pro in a white case.', date: '2024-07-21', status: 'pending', location: 'Mahakaleshwar Temple', coords: { lat: 23.1863, lng: 75.7663 }, imageUrls: ['https://images.unsplash.com/photo-1608043148419-916576624328?q=80&w=400'] },
    { id: 'rep12', reporterId: 'u10', reportCategory: 'item', type: 'found', item: 'Toddler\'s Shoe', description: 'A single small pink shoe for a toddler.', date: '2024-07-20', status: 'closed', location: 'Ram Ghat, Ujjain', coords: { lat: 23.1812, lng: 75.7682 }, imageUrls: ['https://images.unsplash.com/photo-1515757393165-8b38072a2e37?q=80&w=400'] },
    { id: 'rep13', reporterId: 'u1', reportCategory: 'item', type: 'lost', item: 'College ID Card', description: 'ID card for Avantika University for a student named Neha Sharma.', date: '2024-07-18', status: 'resolved', resolvedDate: '2024-07-19', location: 'Food court area', coords: { lat: 23.1768, lng: 75.7888 }, imageUrls: ['https://images.unsplash.com/photo-1620336234384-f772a510a751?q=80&w=400'] },
    { id: 'rep14', reporterId: 'u4', reportCategory: 'item', type: 'found', item: 'Water Bottle', description: 'A steel water bottle with "Stay Hydrated" written on it.', date: '2024-07-18', status: 'in_review', location: 'Parking Lot B', coords: { lat: 23.1752, lng: 75.7852 }, imageUrls: ['https://images.unsplash.com/photo-1602143407151-2474f4b6d760?q=80&w=400'] },
    { id: 'rep15', reporterId: 'u5', reportCategory: 'item', type: 'lost', item: 'Small Gold Earring', description: 'A single small gold earring with a floral design. Very sentimental value.', date: '2024-07-25', status: 'pending', location: 'Harsiddhi Temple', coords: { lat: 23.1839, lng: 75.7663 }, imageUrls: ['https://images.unsplash.com/photo-1611652033933-8c2328582103?q=80&w=400'] },
    { id: 'rep16', reporterId: 'u7', reportCategory: 'item', type: 'lost', item: 'Aadhar Card', description: 'My Aadhar card, name is Prakash Mehra. It was in a plastic sleeve.', date: '2024-07-26', status: 'pending', location: 'Ujjain Railway Station', coords: { lat: 23.1758, lng: 75.7738 }, imageUrls: ['https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=400'] }
];

export const mockAnnouncements = [
    { id: 'an1', date: '2024-07-26', message: 'High alert: An important procession is scheduled from Mahakal Temple to Ram Ghat at 4 PM. Please guide pilgrims accordingly and report any suspicious activity.' },
    { id: 'an2', date: '2024-07-25', message: 'Reminder: All volunteers assigned to Sector 5, please report to the main help desk for a briefing on today\'s duties.' },
    { id: 'an3', date: '2024-07-24', message: 'Weather alert: Heavy rainfall expected post 6 PM. Please guide pilgrims to nearby shelters.' },
    { id: 'an4', date: '2024-07-23', message: 'A child has been found near Ram Ghat. Description: Boy, approx 5 years old, wearing a red t-shirt. Please be on the lookout for his parents.' },
];

export const mockVolunteerTasks: VolunteerTask[] = [
    { id: 'task1', title: 'Assist at Help Desk 3', description: 'Help pilgrims file reports and answer queries at the help desk near Mahakal Temple.', location: 'Help Desk 3, Mahakaleshwar Temple', status: 'in_progress', priority: 'high', dueDate: '2024-07-28' },
    { id: 'task2', title: 'Patrol Ram Ghat Area', description: 'Conduct a patrol of the Ram Ghat area and look for a lost elderly person as per the latest SOS.', location: 'Ram Ghat', status: 'pending', priority: 'urgent', dueDate: '2024-07-27' },
    { id: 'task3', title: 'Deliver Found Item', description: 'Deliver a found wallet (Report #rep4) to the central evidence room.', location: 'Central Evidence Room', status: 'completed', priority: 'low', dueDate: '2024-07-26', completionNotes: 'Wallet delivered and signed for by Officer Sharma.' },
    { id: 'task4', title: 'Investigate Sighting', description: 'Proceed to CAM 04 - Ram Ghat to verify a potential sighting of missing person Mahesh Kumar (Report #rep-p1).', location: 'CAM 04 - Ram Ghat', status: 'pending', priority: 'high', dueDate: '2024-07-27' },
    { id: 'task5', title: 'Distribute Water Bottles', description: 'Distribute water bottles to pilgrims in the queue near Harsiddhi Temple.', location: 'Harsiddhi Temple', status: 'pending', priority: 'medium', dueDate: '2024-07-29' }
];

// @ts-ignore
// FIX: The original type definition for mockSightings was missing parentheses, causing TypeScript to misinterpret it.
// It was parsed as `(Omit<...>) & ({...}[])` instead of the intended array type `(...)[]`.
// Adding parentheses corrects the type to be an array of sighting objects with string timestamps.
export const mockSightings: (Omit<Sighting, 'timestamp'> & { timestamp: string })[] = [
    { id: 'sight1', reportId: 'rep-p1', timestamp: '2024-07-26T10:15:00Z', cameraLocation: 'CAM 04 - Ram Ghat', snapshotUrl: 'https://images.unsplash.com/photo-1610652886675-9278385e0542?q=80&w=400', confidence: 0.91, status: 'confirmed', confirmedBy: 'Priya Singh' },
    { id: 'sight2', reportId: 'rep-p1', timestamp: '2024-07-26T09:45:00Z', cameraLocation: 'CAM 02 - Mahakal Exit', snapshotUrl: 'https://images.unsplash.com/photo-1580252183389-9b6f3549e548?q=80&w=400', confidence: 0.82, status: 'unconfirmed', confirmedBy: null },
    { id: 'sight3', reportId: 'rep-p2', timestamp: '2024-07-25T14:20:00Z', cameraLocation: 'CAM 07 - Food Court', snapshotUrl: 'https://images.unsplash.com/photo-1502086228521-7b38b1a79878?q=80&w=400', confidence: 0.88, status: 'unconfirmed', confirmedBy: null },
    { id: 'sight4', reportId: 'rep-p1', timestamp: '2024-07-26T08:30:00Z', cameraLocation: 'CAM 01 - Mahakal Entrance', snapshotUrl: 'https://images.unsplash.com/photo-1542319418-9851aba2b3e8?q=80&w=400', confidence: 0.75, status: 'dismissed', confirmedBy: null },
];

export const mockSosRequests: SosRequest[] = [
    { 
        id: 'sos3',
        type: 'sighting',
        userName: 'Authority: Priya Singh',
        message: 'Sighting of Mahesh Kumar',
        details: 'A confirmed sighting of missing person Mahesh Kumar was made near CAM 04. Please proceed to the location to assist.',
        location: { name: 'CAM 04 - Ram Ghat', lat: 23.1815, lng: 75.7685 },
        timestamp: '5 mins ago',
        contact: 'N/A',
        status: 'new',
        sightingData: {
            report: mockReports.find(r => r.id === 'rep-p1')!,
            snapshotUrl: mockSightings.find(s => s.id === 'sight1')!.snapshotUrl,
        }
    },
    { 
        id: 'sos1', 
        type: 'emergency',
        userName: 'Emergency Control', 
        message: 'Elderly woman separated from family', 
        details: 'An elderly woman, approximately 70 years old, is separated from her family. She was last seen wearing a yellow saree and has difficulty hearing. Her family is waiting at Help Desk 2.',
        location: { name: 'Near Kal Bhairav Temple', lat: 23.1889, lng: 75.7601 },
        timestamp: '15 mins ago',
        contact: '+919876543210',
        status: 'acknowledged',
        acknowledgedBy: 'Amit Kumar'
    },
    { 
        id: 'sos2', 
        type: 'emergency',
        userName: 'Police Control', 
        message: 'Suspicious unattended bag found', 
        details: 'A large, black, unattended backpack has been found near the main food court in Sector 2. Please assist in cordoning off the area and wait for the bomb disposal squad. Do not approach.',
        location: { name: 'Food Court, Sector 2', lat: 23.1765, lng: 75.7885 },
        timestamp: '35 mins ago',
        contact: '100', // Police emergency number
        status: 'resolved'
    },
];

export const mockHelpCenters = [
  { id: 'hc1', name: 'Ram Ghat Help Center', location: { lat: 23.1810, lng: 75.7690 } },
  { id: 'hc2', name: 'Mahakaleshwar Temple Help Center', location: { lat: 23.1860, lng: 75.7660 } },
  { id: 'hc3', name: 'Railway Station Help Center', location: { lat: 23.1754, lng: 75.7733 } },
  { id: 'hc4', name: 'Nanakheda Bus Stand Help Center', location: { lat: 23.1973, lng: 75.7944 } },
];