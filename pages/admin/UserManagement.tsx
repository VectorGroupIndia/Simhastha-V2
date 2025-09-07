
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { mockUsers } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';
import DashboardHeader from '../../components/DashboardHeader';
import ConfirmationModal from '../../components/ConfirmationModal';

type UserRole = 'user' | 'admin' | 'authority' | 'volunteer';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    memberSince: string;
    status: 'active' | 'suspended';
}

const roleStyles: { [key in UserRole]: string } = {
    user: 'bg-blue-100 text-blue-800',
    admin: 'bg-red-100 text-red-800',
    authority: 'bg-purple-100 text-purple-800',
    volunteer: 'bg-green-100 text-green-800',
};

const statusStyles = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
};

type ModalAction = {
    type: 'suspend' | 'activate' | 'changeRole';
    user: User;
    newRole?: UserRole;
};

const UserManagement: React.FC = () => {
    const { t } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [modalState, setModalState] = useState<{ isOpen: boolean; action: ModalAction | null }>({ isOpen: false, action: null });

    useEffect(() => {
        try {
            const storedUsers = localStorage.getItem('foundtastic-all-users');
            if (storedUsers) {
                setUsers(JSON.parse(storedUsers));
            } else {
                const initialUsers = mockUsers.map(({ password, status, ...user }) => ({ ...user, status: status === 'inactive' ? 'suspended' : status })) as User[];
                localStorage.setItem('foundtastic-all-users', JSON.stringify(initialUsers));
                setUsers(initialUsers);
            }
        } catch (error) {
            console.error("Failed to process users from localStorage", error);
            const initialUsers = mockUsers.map(({ password, status, ...user }) => ({ ...user, status: status === 'inactive' ? 'suspended' : status })) as User[];
            setUsers(initialUsers);
        }
    }, []);

    const persistUsers = (updatedUsers: User[]) => {
        localStorage.setItem('foundtastic-all-users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const openConfirmationModal = (action: ModalAction) => {
        setModalState({ isOpen: true, action });
    };

    const handleConfirmAction = () => {
        if (!modalState.action) return;
        
        const { type, user, newRole } = modalState.action;
        let updatedUsers: User[] = [];

        if (type === 'changeRole' && newRole) {
            updatedUsers = users.map(u => u.id === user.id ? { ...u, role: newRole } : u);
        } else if (type === 'suspend' || type === 'activate') {
            const newStatus = type === 'suspend' ? 'suspended' : 'active';
            updatedUsers = users.map(u => u.id === user.id ? { ...u, status: newStatus } : u);
        }
        
        persistUsers(updatedUsers);
    };

    const handleRoleChangeRequest = (id: string, newRole: UserRole) => {
        const user = users.find(u => u.id === id);
        if (user && user.role !== newRole) {
            openConfirmationModal({ type: 'changeRole', user, newRole });
        }
    };
    
    const handleStatusToggleRequest = (user: User) => {
        const actionType = user.status === 'active' ? 'suspend' : 'activate';
        openConfirmationModal({ type: actionType, user });
    };

    const renderModalContent = () => {
        if (!modalState.action) return { title: '', message: <></>, variant: 'info' as const, confirmText: 'Confirm' };

        const { type, user, newRole } = modalState.action;
        switch(type) {
            case 'suspend':
                return {
                    title: t.adminActionSuspend + ' User',
                    message: <p>Are you sure you want to suspend <strong>{user.name}</strong>? They will not be able to log in.</p>,
                    variant: 'danger' as const,
                    confirmText: t.adminActionSuspend
                };
            case 'activate':
                return {
                    title: t.adminActionActivate + ' User',
                    message: <p>Are you sure you want to activate <strong>{user.name}</strong>? They will regain access to their account.</p>,
                    variant: 'info' as const,
                    confirmText: t.adminActionActivate
                };
            case 'changeRole':
                return {
                    title: 'Change User Role',
                    message: <p>Are you sure you want to change the role of <strong>{user.name}</strong> from <strong>{user.role}</strong> to <strong>{newRole}</strong>?</p>,
                    variant: 'warning' as const,
                    confirmText: 'Confirm Change'
                };
            default:
                return { title: '', message: <></>, variant: 'info' as const, confirmText: 'Confirm' };
        }
    };
    
    const modalContent = renderModalContent();
    
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.adminUserManagement} />
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder={t.adminSearchUsers}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="md:col-span-2 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                         <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="all">{t.adminAllRoles}</option>
                            <option value="user">{t.adminRoleUser}</option>
                            <option value="admin">{t.adminRoleAdmin}</option>
                            <option value="authority">{t.adminRoleAuthority}</option>
                            <option value="volunteer">{t.adminRoleVolunteer}</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminUsersTableHeadName}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminUsersTableHeadEmail}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminUsersTableHeadRole}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminUsersTableHeadStatus}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminUsersTableHeadActions}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="relative inline-block text-left">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChangeRequest(user.id, e.target.value as UserRole)}
                                                    className={`appearance-none w-full px-3 pr-8 py-1 text-xs leading-5 font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary cursor-pointer ${roleStyles[user.role]}`}
                                                >
                                                    <option value="user" className="font-medium text-black bg-white">{t.adminRoleUser}</option>
                                                    <option value="admin" className="font-medium text-black bg-white">{t.adminRoleAdmin}</option>
                                                    <option value="authority" className="font-medium text-black bg-white">{t.adminRoleAuthority}</option>
                                                    <option value="volunteer" className="font-medium text-black bg-white">{t.adminRoleVolunteer}</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-inherit">
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[user.status as keyof typeof statusStyles]}`}>{user.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900">{t.adminActionView}</button>
                                            <button className="ml-4 text-indigo-600 hover:text-indigo-900">{t.adminActionEdit}</button>
                                            <button onClick={() => handleStatusToggleRequest(user)} className="ml-4 text-red-600 hover:text-red-900">
                                                {user.status === 'active' ? t.adminActionSuspend : t.adminActionActivate}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ConfirmationModal 
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({ isOpen: false, action: null })}
                    onConfirm={handleConfirmAction}
                    title={modalContent.title}
                    message={modalContent.message}
                    variant={modalContent.variant}
                    confirmText={modalContent.confirmText}
                />
            </main>
        </div>
    );
};

export default UserManagement;
