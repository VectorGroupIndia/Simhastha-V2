import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from '../../components/DashboardHeader';
import { useLanguage } from '../../contexts/LanguageContext';

export interface PlatformSettings {
    platformName: string;
    eventName: string;
    maintenanceMode: boolean;
    adminEmail: string;
    aiMatchThreshold: number;
    highValueKeywords: string;
}

const defaultSettings: PlatformSettings = {
    platformName: 'Foundtastic',
    eventName: 'Simhastha Kumbh Mela 2028',
    maintenanceMode: false,
    adminEmail: 'admin@foundtastic.com',
    aiMatchThreshold: 75,
    highValueKeywords: 'iphone, laptop, camera, jewelry, macbook, dslr, drone',
};

const ToggleSwitch: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <div>
            <span className="font-medium text-gray-900">{label}</span>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
            type="button"
            className={`${checked ? 'bg-brand-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
        >
            <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
        </button>
    </div>
);

const SettingsPage: React.FC = () => {
    const { t } = useLanguage();
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('foundtastic-settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            } else {
                localStorage.setItem('foundtastic-settings', JSON.stringify(defaultSettings));
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage:", error);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'range' || type === 'number';
        setSettings(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : isNumber ? Number(value) : value,
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('foundtastic-settings', JSON.stringify(settings));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
                <DashboardHeader title={t.settingsTitle} />

                <form onSubmit={handleSave}>
                    <div className="space-y-8">
                        {/* General Settings */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">{t.settingsGeneral}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="platformName" className="block text-sm font-medium text-gray-700">{t.settingsPlatformName}</label>
                                    <input type="text" name="platformName" id="platformName" value={settings.platformName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                </div>
                                <div>
                                    <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">{t.settingsEventName}</label>
                                    <input type="text" name="eventName" id="eventName" value={settings.eventName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                </div>
                                <ToggleSwitch
                                    label={t.settingsMaintenanceMode}
                                    description={t.settingsMaintenanceModeDesc}
                                    checked={settings.maintenanceMode}
                                    onChange={(checked) => setSettings(prev => ({...prev, maintenanceMode: checked}))}
                                />
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">{t.settingsNotifications}</h3>
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">{t.settingsAdminEmail}</label>
                                    <input type="email" name="adminEmail" id="adminEmail" value={settings.adminEmail} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                    <p className="mt-2 text-xs text-gray-500">{t.settingsAdminEmailDesc}</p>
                                </div>
                             </div>
                        </div>

                        {/* AI & Matching Settings */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">{t.settingsAI}</h3>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="aiMatchThreshold" className="block text-sm font-medium text-gray-700">{t.settingsAIMatchThreshold}: <span className="font-bold text-brand-primary">{settings.aiMatchThreshold}%</span></label>
                                    <input type="range" name="aiMatchThreshold" id="aiMatchThreshold" min="50" max="95" step="5" value={settings.aiMatchThreshold} onChange={handleChange} className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"/>
                                    <p className="mt-2 text-xs text-gray-500">{t.settingsAIMatchThresholdDesc}</p>
                                </div>
                                 <div>
                                    <label htmlFor="highValueKeywords" className="block text-sm font-medium text-gray-700">{t.settingsHighValueKeywords}</label>
                                    <textarea name="highValueKeywords" id="highValueKeywords" rows={3} value={settings.highValueKeywords} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"></textarea>
                                    <p className="mt-2 text-xs text-gray-500">{t.settingsHighValueKeywordsDesc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end items-center">
                        {isSaved && <span className="text-sm font-medium text-green-600 mr-4">{t.settingsSaved}</span>}
                        <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary/90 transition-colors">
                            {t.saveChanges}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SettingsPage;