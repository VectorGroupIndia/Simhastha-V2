import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const storageKey = useMemo(() => user ? `foundtastic-notifications-${user.id}` : null, [user]);

    useEffect(() => {
        if (storageKey) {
            try {
                const storedNotifications = localStorage.getItem(storageKey);
                if (storedNotifications) {
                    // Revive dates from ISO strings
                    const parsed = JSON.parse(storedNotifications).map((n: Notification) => ({...n, timestamp: new Date(n.timestamp)}));
                    setNotifications(parsed);
                } else {
                    // Seed initial notification for demo
                    const welcomeNotification = {
                        id: `notif-${Date.now()}`,
                        title: 'Welcome to Foundtastic!',
                        message: 'You can find all your updates and alerts here.',
                        timestamp: new Date(),
                        read: false,
                    };
                    setNotifications([welcomeNotification]);
                    localStorage.setItem(storageKey, JSON.stringify([welcomeNotification]));
                }
            } catch (error) {
                console.error("Failed to load notifications from localStorage", error);
            }
        } else {
            setNotifications([]); // Clear notifications on logout
        }
    }, [storageKey]);

    const updateAndStoreNotifications = (newNotifications: Notification[]) => {
        if (storageKey) {
            setNotifications(newNotifications);
            localStorage.setItem(storageKey, JSON.stringify(newNotifications));
        }
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}`,
            timestamp: new Date(),
            read: false,
        };
        // Add to the beginning of the list
        updateAndStoreNotifications([newNotification, ...notifications]);
    };

    const markAsRead = (id: string) => {
        const newNotifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        updateAndStoreNotifications(newNotifications);
    };

    const markAllAsRead = () => {
        const newNotifications = notifications.map(n => ({ ...n, read: true }));
        updateAndStoreNotifications(newNotifications);
    };

    const clearAll = () => {
        updateAndStoreNotifications([]);
    };

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};