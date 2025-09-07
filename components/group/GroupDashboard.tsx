import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth, FullUser } from '../../contexts/AuthContext';
import { Group } from '../../data/mockData';
import MemberCard from './MemberCard';
import AddMemberModal from './AddMemberModal';
import ConfirmationModal from '../ConfirmationModal';

interface GroupDashboardProps {
    group: Group;
    members: FullUser[];
    onGroupUpdate: () => void;
}

const GroupDashboard: React.FC<GroupDashboardProps> = ({ group, members, onGroupUpdate }) => {
    const { t } = useLanguage();
    const { user, updateUserData } = useAuth();
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const isUserAdmin = user?.id === group.adminId;

    const handleConfirmLeaveGroup = () => {
        if (!user) return;

        try {
            const allUsersStr = localStorage.getItem('foundtastic-all-users');
            const allGroupsStr = localStorage.getItem('foundtastic-all-groups');
            let allUsers: FullUser[] = allUsersStr ? JSON.parse(allUsersStr) : [];
            let allGroups: Group[] = allGroupsStr ? JSON.parse(allGroupsStr) : [];

            // Update user's group list
            const updatedUserGroupIds = user.groupIds.filter(id => id !== group.id);
            const newActiveGroupId = updatedUserGroupIds.length > 0 ? updatedUserGroupIds[0] : null;

            allUsers = allUsers.map(u => 
                u.id === user.id 
                ? { ...u, groupIds: updatedUserGroupIds, activeGroupId: newActiveGroupId } 
                : u
            );
            
            // Update group's member list
            const remainingMemberIds = group.memberIds.filter(id => id !== user.id);
            
            if (remainingMemberIds.length === 0) {
                // Delete group if last member leaves
                allGroups = allGroups.filter(g => g.id !== group.id);
            } else {
                allGroups = allGroups.map(g => {
                    if (g.id === group.id) {
                        const updatedGroup = { ...g, memberIds: remainingMemberIds };
                        // Handle admin leaving
                        if (g.adminId === user.id) {
                            updatedGroup.adminId = remainingMemberIds[0]; // Assign to the next member
                        }
                        return updatedGroup;
                    }
                    return g;
                });
            }

            localStorage.setItem('foundtastic-all-users', JSON.stringify(allUsers));
            localStorage.setItem('foundtastic-all-groups', JSON.stringify(allGroups));
            
            updateUserData({ groupIds: updatedUserGroupIds, activeGroupId: newActiveGroupId });

            onGroupUpdate(); // Trigger data reload in parent component
            
        } catch (error) {
            console.error("Failed to leave group:", error);
        }
    };
    
    const getLeaveModalMessage = () => {
        let message = t.leaveGroupConfirmationMessage.replace('{groupName}', group.name);
        if(isUserAdmin && group.memberIds.length > 1) {
            message += ` ${t.leaveGroupAdminWarning}`;
        }
        return <p>{message}</p>;
    }


    return (
        <div>
            <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-8">
                <h2 className="text-2xl font-bold text-brand-dark leading-6">{group.name}</h2>
                <div className="mt-3 flex sm:mt-0 sm:ml-4">
                    <button
                        type="button"
                        onClick={() => setIsAddMemberModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        disabled={!isUserAdmin}
                    >
                        {t.addMemberButton}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        {t.leaveGroupButton}
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-medium text-slate-800 mb-4">{t.groupMembers}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {members.map(member => (
                    <MemberCard key={member.id} member={member} isHead={member.id === group.adminId} />
                ))}
            </div>
            
            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                group={group}
            />

            <ConfirmationModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={handleConfirmLeaveGroup}
                title={t.leaveGroupConfirmationTitle}
                message={getLeaveModalMessage()}
                confirmText={t.leaveGroupConfirmButton}
                variant="danger"
            />
        </div>
    );
};

export default GroupDashboard;