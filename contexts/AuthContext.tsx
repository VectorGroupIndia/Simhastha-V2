import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { mockUsers, mockGroups } from '../data/mockData';

type UserRole = 'user' | 'admin' | 'authority' | 'volunteer';
type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  memberSince: string;
  avatarUrl: string;
  groupIds: string[];
  activeGroupId: string | null;
}

export interface FullUser extends User {
    status: UserStatus;
}

interface AuthData {
    email: string;
    password: string;
}


interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchActiveGroup: (groupId: string) => void;
  updateUserData: (updatedData: Partial<User>) => void;
  updateProfile: (userId: string, newName: string) => Promise<void>;
  changePassword: (email: string, currentPass: string, newPass: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Seed data if it doesn't exist
        try {
            if (!localStorage.getItem('foundtastic-all-users')) {
                const initialUsers = mockUsers.map(({ password, ...user }) => user) as FullUser[];
                localStorage.setItem('foundtastic-all-users', JSON.stringify(initialUsers));
            }
            if (!localStorage.getItem('foundtastic-auth-data')) {
                const initialAuthData = mockUsers.map(u => ({ email: u.email, password: u.password }));
                localStorage.setItem('foundtastic-auth-data', JSON.stringify(initialAuthData));
            }
            if (!localStorage.getItem('foundtastic-all-groups')) {
                localStorage.setItem('foundtastic-all-groups', JSON.stringify(mockGroups));
            }
        } catch (error) {
            console.error("Failed to seed data to localStorage", error);
        }


        // Check for a logged-in user in localStorage on initial load
        try {
            const storedUser = localStorage.getItem('foundtastic-user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('foundtastic-user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, pass: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const storedUsers = localStorage.getItem('foundtastic-all-users');
                const users: FullUser[] = storedUsers ? JSON.parse(storedUsers) : [];
                
                const storedAuthData = localStorage.getItem('foundtastic-auth-data');
                const authData: AuthData[] = storedAuthData ? JSON.parse(storedAuthData) : [];

                const userAuth = authData.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (userAuth && userAuth.password === pass) {
                    const userToLogin = users.find(u => u.email.toLowerCase() === email.toLowerCase());
                    if (!userToLogin) {
                        reject(new Error('User data not found.'));
                        return;
                    }

                    if (userToLogin.status === 'suspended') {
                        reject(new Error('This account has been suspended.'));
                        return;
                    }

                    const { status, ...userData } = userToLogin;
                    localStorage.setItem('foundtastic-user', JSON.stringify(userData));
                    setUser(userData);
                    resolve();
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000); // Simulate network delay
        });
    };

    const register = async (name: string, email: string, pass: string): Promise<void> => {
         return new Promise((resolve, reject) => {
            setTimeout(() => {
                const storedUsers = localStorage.getItem('foundtastic-all-users');
                const users: FullUser[] = storedUsers ? JSON.parse(storedUsers) : [];
                
                const storedAuthData = localStorage.getItem('foundtastic-auth-data');
                const authData: AuthData[] = storedAuthData ? JSON.parse(storedAuthData) : [];
                
                if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                    reject(new Error('An account with this email already exists.'));
                    return;
                }
                
                const newUser: FullUser = {
                    id: `u${Date.now()}`,
                    name,
                    email,
                    role: 'user',
                    memberSince: new Date().toISOString().split('T')[0],
                    status: 'active',
                    avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
                    groupIds: [],
                    activeGroupId: null,
                };
                
                const newAuthData: AuthData = { email, password: pass };
                
                localStorage.setItem('foundtastic-all-users', JSON.stringify([...users, newUser]));
                localStorage.setItem('foundtastic-auth-data', JSON.stringify([...authData, newAuthData]));
                
                // After registering, log the user in
                login(email, pass).then(resolve).catch(reject);
            }, 1500); // Simulate network delay
        });
    };
    
    const updateUserData = (updatedData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updatedData };
            setUser(updatedUser);
            localStorage.setItem('foundtastic-user', JSON.stringify(updatedUser));
        }
    };

    const updateProfile = async (userId: string, newName: string): Promise<void> => {
        return new Promise((resolve) => {
            // Update the master user list
            const storedUsers = localStorage.getItem('foundtastic-all-users');
            let users: FullUser[] = storedUsers ? JSON.parse(storedUsers) : [];
            users = users.map(u => u.id === userId ? { ...u, name: newName } : u);
            localStorage.setItem('foundtastic-all-users', JSON.stringify(users));

            // Update the current session user
            updateUserData({ name: newName });
            resolve();
        });
    };

    const changePassword = async (email: string, currentPass: string, newPass: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const storedAuthData = localStorage.getItem('foundtastic-auth-data');
            let authData: AuthData[] = storedAuthData ? JSON.parse(storedAuthData) : [];
            const userAuthIndex = authData.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

            if (userAuthIndex === -1 || authData[userAuthIndex].password !== currentPass) {
                reject(new Error('Your current password does not match.'));
                return;
            }

            authData[userAuthIndex].password = newPass;
            localStorage.setItem('foundtastic-auth-data', JSON.stringify(authData));
            resolve();
        });
    };


    const switchActiveGroup = (groupId: string) => {
        if (user && user.groupIds.includes(groupId)) {
            updateUserData({ activeGroupId: groupId });
        }
    };


    const logout = () => {
        localStorage.removeItem('foundtastic-user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, switchActiveGroup, updateUserData, updateProfile, changePassword, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
