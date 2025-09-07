import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Spinner from '../Spinner';

interface CreateGroupProps {
    onCreateGroup: (groupName: string) => void;
    onCancel: () => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onCreateGroup, onCancel }) => {
    const { t } = useLanguage();
    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (groupName.trim()) {
            setIsLoading(true);
            // Simulate network delay
            setTimeout(() => {
                onCreateGroup(groupName);
                // No need to set isLoading to false, as the component will be unmounted
            }, 1000);
        }
    };

    return (
        <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-brand-dark mb-4">{t.createGroupTitle}</h2>
            <p className="text-slate-600 mb-8">{t.createGroupDescription}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="groupName" className="sr-only">{t.groupNameLabel}</label>
                    <input
                        type="text"
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder={t.groupNamePlaceholder}
                        className="block w-full text-center rounded-md border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-lg p-3"
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        type="submit"
                        disabled={!groupName.trim() || isLoading}
                        className="w-full justify-center items-center px-8 py-3 border border-transparent text-lg font-semibold rounded-md shadow-sm text-white bg-brand-secondary hover:opacity-90 disabled:bg-slate-400 disabled:cursor-not-allowed flex"
                    >
                        {isLoading && <Spinner className="-ml-1 mr-3" />}
                        {t.createGroupButton}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full justify-center items-center px-8 py-3 border border-slate-300 text-lg font-semibold rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50"
                    >
                        {t.cancelButton}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateGroup;
