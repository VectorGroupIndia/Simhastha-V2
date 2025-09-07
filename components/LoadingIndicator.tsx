import React from 'react';
import Spinner from './Spinner';

interface LoadingIndicatorProps {
    message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center p-16" role="status" aria-live="polite">
            <Spinner size="lg" className="text-brand-primary" />
            {message && <p className="mt-4 text-slate-600 font-semibold">{message}</p>}
        </div>
    );
};

export default LoadingIndicator;
