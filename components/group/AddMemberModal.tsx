import React, { useState } from 'react';
import { Group } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group;
}

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, group }) => {
    const { t } = useLanguage();
    const { addNotification } = useNotification();
    const [email, setEmail] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a simulation. In a real app, an email would be sent.
        console.log(`Inviting ${email} to group ${group.name}`);
        addNotification({
            title: 'Invite Sent (Simulated)',
            message: `An invitation has been sent to ${email}.`,
        });
        setEmail('');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(group.id).then(() => {
            setIsCopied(true);
            addNotification({ title: 'Success', message: 'Invite code copied to clipboard!' });
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{t.addMemberTitle}</h3>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">{t.addMemberByEmail}</p>
                                    <form onSubmit={handleInvite} className="flex gap-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t.addMemberEmailPlaceholder}
                                            className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                                        />
                                        <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90">
                                            {t.sendInviteButton}
                                        </button>
                                    </form>
                                </div>
                                
                                <div className="mt-6 border-t pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">{t.addMemberByLink}</p>
                                    <div className="flex items-center gap-2 p-2 bg-gray-100 border rounded-md">
                                        <input
                                            type="text"
                                            readOnly
                                            value={group.id}
                                            className="flex-grow bg-transparent border-0 text-sm text-gray-600 focus:ring-0"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className="flex items-center text-sm text-slate-600 hover:text-brand-primary font-medium p-2 rounded-md transition-colors bg-white border"
                                        >
                                            {isCopied ? <><CheckIcon className="text-green-500"/> <span className="ml-1 text-green-500">{t.linkCopied}</span></> : <><ClipboardIcon className="mr-1"/> {t.copyLinkButton}</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            {t.modalClose}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;