
import React from 'react';
import { FullUser } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface MemberCardProps {
    member: FullUser;
    isHead: boolean;
}

const CrownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.25a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.005 5.005a.75.75 0 01.75-.75h8.49a.75.75 0 010 1.5h-8.49a.75.75 0 01-.75-.75zM2.75 8.25a.75.75 0 01.75-.75h12.999a.75.75 0 010 1.5H3.5a.75.75 0 01-.75-.75zM5.08 11.892a.75.75 0 01.418-.53l4.5-2.25a.75.75 0 01.604 0l4.5 2.25a.75.75 0 01-.418 1.352l-4.25-2.125-4.25 2.125a.75.75 0 01-1.022-.822zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        <path d="M3 13.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
    </svg>
);


const MemberCard: React.FC<MemberCardProps> = ({ member, isHead }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="relative inline-block">
                <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                />
                {isHead && (
                    <span
                        className="absolute -top-1 -right-1 flex items-center justify-center bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full border-2 border-white"
                        title={t.groupHead}
                    >
                        <CrownIcon className="w-5 h-5" />
                    </span>
                )}
            </div>
            <h4 className="font-bold text-brand-dark">{member.name}</h4>
            <p className="text-sm text-slate-500 truncate">{member.email}</p>
        </div>
    );
};

export default MemberCard;
