import React from 'react';
import { FullUser } from '../contexts/AuthContext';
import ProfileSettings from './ProfileSettings';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: FullUser;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all text-gray-800" onClick={e => e.stopPropagation()}>
                <div className="p-6 relative max-h-[90vh] overflow-y-auto">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="flex items-center space-x-4 border-b pb-4 mb-4">
                        <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                            <p className="text-brand-secondary font-semibold">{user.title}</p>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                        {user.phone && <div className="bg-slate-50 p-3 rounded-md"><strong>Phone:</strong> {user.phone}</div>}
                        {user.assignedZone && <div className="bg-slate-50 p-3 rounded-md"><strong>Assigned Zone:</strong> {user.assignedZone}</div>}
                        {user.skills && user.skills.length > 0 && (
                            <div className="md:col-span-2 bg-slate-50 p-3 rounded-md">
                                <strong>Skills:</strong>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {user.skills.map(skill => (
                                        <span key={skill} className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <ProfileSettings user={user} isModal={true} />
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
