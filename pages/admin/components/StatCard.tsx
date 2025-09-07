
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;