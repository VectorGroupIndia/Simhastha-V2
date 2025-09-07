
import React from 'react';
import { ReportData } from '../../pages/ReportFlowPage';
import { useLanguage } from '../../contexts/LanguageContext';
import Spinner from '../Spinner';

interface ConfirmationStepProps {
    data: ReportData;
    onConfirm: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    value ? (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-600">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2 break-words">{value}</dd>
        </div>
    ) : null
);

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ data, onConfirm, onBack, isSubmitting }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-inner border border-slate-200">
                <h3 className="text-xl font-bold text-brand-dark mb-4 border-b pb-2">{t.confirmHeading}</h3>
                <div className="sm:divide-y sm:divide-slate-200">
                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                         <dt className="text-sm font-medium text-slate-600">{t.confirmImage}</dt>
                         <dd className="mt-1 sm:mt-0 sm:col-span-2">
                             {data.imagePreview ? (
                                <img src={data.imagePreview} alt="Report item" className="h-32 w-32 object-cover rounded-md bg-slate-100" />
                            ) : (
                                <span className="text-sm text-slate-500">{t.confirmNoImage}</span>
                            )}
                         </dd>
                    </div>

                    <DetailRow label={t.confirmReportType} value={data.reportType === 'lost' ? t.confirmReportTypeLost : t.confirmReportTypeFound} />
                    <DetailRow label={t.itemName} value={data.itemName} />
                    <DetailRow label={t.confirmCategory} value={`${data.category} - ${data.subcategory}`} />
                    <DetailRow label={t.description} value={data.description} />
                    <DetailRow label={t.brand} value={data.brand} />
                    <DetailRow label={t.color} value={data.color} />
                    <DetailRow label={t.material} value={data.material} />
                    <DetailRow label={t.identifyingMarks} value={data.identifyingMarks} />
                    <DetailRow label={t.confirmLocation} value={`${data.location}, ${data.city}`} />
                    <DetailRow label={t.confirmSerialNumber} value={data.serialNumber} />
                    <DetailRow label={t.confirmTags} value={data.tags} />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6">
                 <button 
                    onClick={onBack} 
                    className="w-full sm:w-auto bg-transparent border border-slate-400 text-slate-700 font-semibold py-2 px-6 rounded-md hover:bg-slate-100 transition-colors"
                >
                    {t.confirmBackButton}
                </button>
                <button 
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-brand-secondary text-white font-semibold py-2 px-6 rounded-md hover:opacity-90 transition-opacity disabled:bg-slate-400 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isSubmitting && <Spinner className="-ml-1 mr-3" />}
                    {isSubmitting ? t.submittingAndMatching : t.confirmSubmitButton}
                </button>
            </div>
        </div>
    );
};

export default ConfirmationStep;