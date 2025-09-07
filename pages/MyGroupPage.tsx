import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, FullUser, User } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Group } from '../data/mockData';

import CreateGroup from '../components/group/CreateGroup';
import GroupDashboard from '../components/group/GroupDashboard';
import LoadingIndicator from '../components/LoadingIndicator';
import Spinner from '../components/Spinner';

const GroupSwitcher: React.FC<{
    groups: Group[];
    activeGroupId: string | null;
    onSwitch: (groupId: string) => void;
}> = ({ groups, activeGroupId, onSwitch }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const activeGroup = groups.find(g => g.id === activeGroupId);

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {activeGroup?.name || t.selectActiveGroup}
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75
 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => { onSwitch(group.id); setIsOpen(false); }}
                                className={`${group.id === activeGroupId ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                                role="menuitem"
                            >
                                {group.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const MyGroupPage: React.FC = () => {
    const { user, switchActiveGroup, updateUserData } = useAuth();
    const { t } = useLanguage();
    const { addNotification } = useNotification();
    
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [allUsers, setAllUsers] = useState<FullUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');

    const activeGroup = useMemo(() => {
        return myGroups.find(g => g.id === user?.activeGroupId);
    }, [myGroups, user?.activeGroupId]);

    const activeGroupMembers = useMemo(() => {
        if (!activeGroup) return [];
        return allUsers.filter(u => activeGroup.memberIds.includes(u.id));
    }, [activeGroup, allUsers]);

    const loadGroupData = useCallback(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const allUsersStr = localStorage.getItem('foundtastic-all-users');
            const allGroupsStr = localStorage.getItem('foundtastic-all-groups');
            
            const loadedUsers: FullUser[] = allUsersStr ? JSON.parse(allUsersStr) : [];
            const loadedGroups: Group[] = allGroupsStr ? JSON.parse(allGroupsStr) : [];
            
            setAllUsers(loadedUsers);

            const currentUserData = loadedUsers.find(u => u.id === user.id);
            if (currentUserData && currentUserData.groupIds.length > 0) {
                const groups = loadedGroups.filter(g => currentUserData.groupIds.includes(g.id));
                setMyGroups(groups);
            } else {
                setMyGroups([]);
            }
        } catch (error) {
            console.error("Failed to load group data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadGroupData();
    }, [loadGroupData]);
    
    const handleCreateGroup = (groupName: string) => {
        if (!user || groupName.trim() === '') return;

        try {
            const allUsersStr = localStorage.getItem('foundtastic-all-users');
            const allGroupsStr = localStorage.getItem('foundtastic-all-groups');
            let allUsers: FullUser[] = allUsersStr ? JSON.parse(allUsersStr) : [];
            let allGroups: Group[] = allGroupsStr ? JSON.parse(allGroupsStr) : [];

            const newGroup: Group = {
                id: `g${Date.now()}`,
                name: groupName,
                adminId: user.id,
                memberIds: [user.id],
            };

            const updatedGroups = [...allGroups, newGroup];
            const updatedUsers = allUsers.map(u => 
                u.id === user.id ? { ...u, groupIds: [...u.groupIds, newGroup.id] } : u
            );

            localStorage.setItem('foundtastic-all-groups', JSON.stringify(updatedGroups));
            localStorage.setItem('foundtastic-all-users', JSON.stringify(updatedUsers));
            
            updateUserData({ groupIds: [...user.groupIds, newGroup.id], activeGroupId: newGroup.id });
            
            loadGroupData();
            setIsCreating(false);

        } catch (error) {
            console.error("Failed to create group:", error);
        }
    };
    
    const handleJoinGroup = (e: React.FormEvent) => {
        e.preventDefault();
        setJoinError('');
        if (!user || !joinCode.trim()) return;

        try {
            const allUsersStr = localStorage.getItem('foundtastic-all-users');
            const allGroupsStr = localStorage.getItem('foundtastic-all-groups');
            let allUsers: FullUser[] = allUsersStr ? JSON.parse(allUsersStr) : [];
            let allGroups: Group[] = allGroupsStr ? JSON.parse(allGroupsStr) : [];

            const groupToJoin = allGroups.find(g => g.id === joinCode.trim());
            if (!groupToJoin) {
                setJoinError(t.joinGroupErrorNotFound);
                return;
            }

            if (user.groupIds.includes(groupToJoin.id)) {
                setJoinError(t.joinGroupErrorAlreadyMember);
                return;
            }

            // Update user
            const updatedUsers = allUsers.map(u => 
                u.id === user.id ? { ...u, groupIds: [...u.groupIds, groupToJoin.id] } : u
            );
            
            // Update group
            const updatedGroups = allGroups.map(g => 
                g.id === groupToJoin.id ? { ...g, memberIds: [...g.memberIds, user.id] } : g
            );

            localStorage.setItem('foundtastic-all-users', JSON.stringify(updatedUsers));
            localStorage.setItem('foundtastic-all-groups', JSON.stringify(updatedGroups));
            
            updateUserData({ groupIds: [...user.groupIds, groupToJoin.id], activeGroupId: groupToJoin.id });

            addNotification({ title: t.joinGroupTitle, message: t.notificationJoinSuccess.replace('{groupName}', groupToJoin.name) });
            
            setJoinCode('');
            setIsJoining(false);
            loadGroupData();
            
        } catch (error) {
            console.error("Failed to join group:", error);
            setJoinError(t.notificationError);
        }
    };

    const renderContent = () => {
        if (isLoading) {
             return <LoadingIndicator message={t.myGroupLoading} />;
        }

        if (isCreating) {
            return <CreateGroup onCreateGroup={handleCreateGroup} onCancel={() => setIsCreating(false)} />;
        }
        
        if (activeGroup) {
            return <GroupDashboard group={activeGroup} members={activeGroupMembers} onGroupUpdate={loadGroupData} />;
        }
        
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">{t.noActiveGroupTitle}</h2>
                <p className="text-slate-600 mb-6">
                    {myGroups.length > 0 ? t.noActiveGroupSelect : t.noActiveGroupCreate}
                </p>
                {myGroups.length === 0 && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:opacity-90"
                    >
                        {t.createFirstGroupButton}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                 <div className="max-w-4xl mx-auto">
                     <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-brand-dark sm:text-5xl">{t.myGroupTitle}</h1>
                        <p className="mt-4 text-lg text-slate-600">{t.myGroupSubtitle}</p>
                    </div>
                    
                    {!isCreating && (
                        <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
                            <h3 className="font-semibold text-slate-700">{t.joinGroupTitle}</h3>
                            <p className="text-sm text-slate-500 mb-3">{t.joinGroupDescription}</p>
                            <form onSubmit={handleJoinGroup} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder={t.joinGroupPlaceholder}
                                    className="flex-grow block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2"
                                />
                                <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90">
                                    {t.joinGroupButton}
                                </button>
                            </form>
                            {joinError && <p className="mt-2 text-sm text-red-600">{joinError}</p>}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-xl p-6 sm:p-10">
                        {!isCreating && (
                            <div className="mb-8 pb-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    {myGroups.length > 0 && (
                                        <GroupSwitcher
                                            groups={myGroups}
                                            activeGroupId={user?.activeGroupId || null}
                                            onSwitch={switchActiveGroup}
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:opacity-90"
                                >
                                    {t.createGroupButton}
                                </button>
                            </div>
                        )}
                        {renderContent()}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default MyGroupPage;