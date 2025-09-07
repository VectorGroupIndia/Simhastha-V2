import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

const CheckDoubleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);


const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotification();
    const { t } = useLanguage();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (id: string) => {
        markAsRead(id);
        // Do not close the dropdown, allow linking
    };

    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "min ago";
        return "Just now";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-brand-primary p-2 rounded-full transition-colors relative" aria-label={`Notifications (${unreadCount} unread)`}>
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white">
                        <span className="sr-only">{unreadCount} unread notifications</span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-brand-dark">{t.notifications}</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <Link
                                    key={notification.id}
                                    to={notification.link || '#'}
                                    onClick={() => handleNotificationClick(notification.id)}
                                    className={`block p-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-start">
                                        {!notification.read && <span className="flex-shrink-0 w-2 h-2 mt-1.5 mr-3 bg-brand-primary rounded-full"></span>}
                                        <div className="flex-grow">
                                            <p className="font-semibold text-slate-800">{notification.title}</p>
                                            <p className="text-sm text-slate-600">{notification.message}</p>
                                            <p className="text-xs text-slate-400 mt-1">{timeSince(notification.timestamp)}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="p-8 text-center text-sm text-slate-500">{t.noNotifications}</p>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="p-2 bg-slate-50 border-t flex justify-between items-center">
                            <button onClick={markAllAsRead} className="flex items-center text-xs font-semibold text-brand-primary hover:underline px-3 py-1.5 rounded-md hover:bg-slate-200">
                                <CheckDoubleIcon className="w-4 h-4 mr-1.5" /> {t.markAllAsRead}
                            </button>
                            <button onClick={clearAll} className="flex items-center text-xs font-semibold text-red-600 hover:underline px-3 py-1.5 rounded-md hover:bg-red-100">
                                <TrashIcon className="w-4 h-4 mr-1.5" /> {t.clearAll}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;