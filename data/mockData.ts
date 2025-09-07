import { Report } from '../pages/ProfilePage';
import { SosRequest } from '../pages/volunteer/VolunteerDashboard';

export const mockUsers = [
    { id: 'u1', name: 'Rohan Sharma', email: 'citizen@foundtastic.com', password: 'password', role: 'user', memberSince: '2024-01-15', status: 'active' },
    { id: 'u2', name: 'Admin User', email: 'admin@foundtastic.com', password: 'password', role: 'admin', memberSince: '2024-01-10', status: 'active' },
    { id: 'u3', name: 'Priya Singh', email: 'authority@foundtastic.com', password: 'password', role: 'authority', memberSince: '2024-01-12', status: 'active' },
    { id: 'u4', name: 'Amit Kumar', email: 'volunteer@foundtastic.com', password: 'password', role: 'volunteer', memberSince: '2024-02-01', status: 'active' },
    { id: 'u5', name: 'Anjali Gupta', email: 'anjali@example.com', password: 'password', role: 'user', memberSince: '2024-03-20', status: 'suspended' },
    { id: 'u6', name: 'Sandeep Verma', email: 'sandeep@example.com', password: 'password', role: 'volunteer', memberSince: '2024-03-22', status: 'active' },
];

export const mockReports: Report[] = [
    { id: 'rep1', type: 'lost', item: 'iPhone 14 Pro', description: 'Black iPhone 14 Pro with a small crack on the top left corner. Has a blue Spigen case.', date: '2024-07-20', status: 'in_review', location: 'Ram Ghat, Ujjain', imageUrl: 'https://images.unsplash.com/photo-1677353952934-6e53f47c3e58?q=80&w=400', matches: ['rep2'] },
    { id: 'rep2', type: 'found', item: 'Apple iPhone', description: 'Found a black iPhone near the river. It has a cracked screen and a blue case. It is locked.', date: '2024-07-21', status: 'pending', location: 'Ram Ghat, Ujjain', imageUrl: 'https://images.unsplash.com/photo-1677353952934-6e53f47c3e58?q=80&w=400', matches: ['rep1'] },
    { id: 'rep3', type: 'lost', item: 'Child\'s Blue Backpack', description: 'Small blue backpack with a Spider-Man keychain. Contains a water bottle and a lunchbox.', date: '2024-07-19', status: 'resolved', resolvedDate: '2024-07-21', location: 'Mahakaleshwar Temple', imageUrl: 'https://images.unsplash.com/photo-1553062407-98e365097524?q=80&w=400' },
    { id: 'rep4', type: 'found', item: 'Leather Wallet', description: 'Brown leather wallet containing some cash and an ID card for Suresh Kumar.', date: '2024-07-22', status: 'resolved', resolvedDate: '2024-07-25', location: 'Food court area', imageUrl: 'https://images.unsplash.com/photo-1613093902319-5b7541b4a370?q=80&w=400' },
    { id: 'rep5', type: 'lost', item: 'Silver Watch', description: 'Titan silver watch with a metal strap. Has a small scratch on the glass.', date: '2024-07-18', status: 'closed', location: 'Harsiddhi Temple', imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=400' },
    { id: 'rep6', type: 'found', item: 'Set of Keys', description: 'A bunch of keys with a red Maruti car key and a few house keys.', date: '2024-07-21', status: 'in_review', location: 'Parking Lot B', imageUrl: 'https://images.unsplash.com/photo-1564282864384-35c2763d333b?q=80&w=400' },
    { id: 'rep7', type: 'lost', item: 'Black DSLR Camera', description: 'Nikon D5600 camera in a black bag with one extra lens.', date: '2024-07-22', status: 'pending', location: 'Near Shipra River bridge', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400' },
    { id: 'rep8', type: 'found', item: 'Prescription Glasses', description: 'Black framed prescription glasses in a blue case.', date: '2024-07-22', status: 'pending', location: 'Help Desk 3', imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400' },
    { id: 'rep9', type: 'lost', item: 'Red Scarf', description: 'A plain red woolen scarf.', date: '2024-06-15', status: 'closed', location: 'Ujjain Railway Station', imageUrl: 'https://images.unsplash.com/photo-1600361099105-779c45038f32?q=80&w=400' },
    { id: 'rep10', type: 'found', item: 'Samsonite Suitcase', description: 'A large blue hard-shell suitcase.', date: '2024-06-20', status: 'resolved', resolvedDate: '2024-06-28', location: 'Nanakheda Bus Stand', imageUrl: 'https://images.unsplash.com/photo-1581553983792-c138b254d036?q=80&w=400' },
    { id: 'rep11', type: 'lost', item: 'Airpods Pro', description: 'Apple Airpods Pro in a white case.', date: '2024-07-01', status: 'pending', location: 'Mahakaleshwar Temple', imageUrl: 'https://images.unsplash.com/photo-1608043148419-916576624328?q=80&w=400' },
    { id: 'rep12', type: 'found', item: 'Toddler\'s Shoe', description: 'A single small pink shoe for a toddler.', date: '2024-07-05', status: 'closed', location: 'Ram Ghat, Ujjain', imageUrl: 'https://images.unsplash.com/photo-1515757393165-8b38072a2e37?q=80&w=400' },
    { id: 'rep13', type: 'lost', item: 'College ID Card', description: 'ID card for Avantika University for a student named Neha Sharma.', date: '2024-07-10', status: 'resolved', resolvedDate: '2024-07-11', location: 'Food court area', imageUrl: 'https://images.unsplash.com/photo-1620336234384-f772a510a751?q=80&w=400' },
    { id: 'rep14', type: 'found', item: 'Water Bottle', description: 'A steel water bottle with "Stay Hydrated" written on it.', date: '2024-07-12', status: 'in_review', location: 'Parking Lot B', imageUrl: 'https://images.unsplash.com/photo-1602143407151-2474f4b6d760?q=80&w=400' }
];

export const mockAnnouncements = [
    { id: 'an1', date: '2024-07-22', message: 'All volunteers assigned to Sector 5, please report to the main help desk for a briefing on today\'s duties.' },
    { id: 'an2', date: '2024-07-21', message: 'Weather alert: Heavy rainfall expected post 4 PM. Please guide pilgrims to nearby shelters.' },
    { id: 'an3', date: '2024-07-20', message: 'A child has been found near Ram Ghat. Description: Boy, approx 5 years old, wearing a red t-shirt. Please be on the lookout for his parents.' },
];

export const mockVolunteerTasks = [
    { id: 'task1', title: 'Assist at Help Desk 3', description: 'Help pilgrims file reports and answer queries at the help desk near Mahakal Temple.', location: 'Help Desk 3, Mahakaleshwar Temple', status: 'in_progress' },
    { id: 'task2', title: 'Patrol Ram Ghat Area', description: 'Conduct a patrol of the Ram Ghat area and look for a lost elderly person as per the latest SOS.', location: 'Ram Ghat', status: 'pending' },
    { id: 'task3', title: 'Deliver Found Item', description: 'Deliver a found wallet to the central evidence room.', location: 'Central Evidence Room', status: 'completed' },
];

export const mockSosRequests: SosRequest[] = [
    { 
        id: 'sos1', 
        userName: 'Emergency Control', 
        message: 'Elderly woman separated from family', 
        details: 'An elderly woman, approximately 70 years old, is separated from her family. She was last seen wearing a yellow saree and has difficulty hearing. Her family is waiting at Help Desk 2.',
        location: { name: 'Near Kal Bhairav Temple', lat: 23.1889, lng: 75.7601 },
        timestamp: '15 mins ago',
        contact: '+919876543210',
        status: 'new'
    },
    { 
        id: 'sos2', 
        userName: 'Police Control', 
        message: 'Suspicious unattended bag found', 
        details: 'A large, black, unattended backpack has been found near the main food court in Sector 2. Please assist in cordoning off the area and wait for the bomb disposal squad. Do not approach.',
        location: { name: 'Food Court, Sector 2', lat: 23.1765, lng: 75.7885 },
        timestamp: '35 mins ago',
        contact: '100', // Police emergency number
        status: 'new'
    },
];