

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

import AuthStep from '../components/reporting/AuthStep';
import InstructionsStep from '../components/reporting/InstructionsStep';
import ReportFormStep from '../components/reporting/ReportFormStep';
import ConfirmationStep from '../components/reporting/ConfirmationStep';
import SuccessStep from '../components/reporting/SuccessStep';
import { Report } from './ProfilePage';
import { findMatchingReports } from '../services/gemini';

export interface ReportData {
    reportType: 'lost' | 'found';
    category: string;
    subcategory: string;
    itemName: string;
    description: string;
    brand: string;
    color: string;
    material: string;
    identifyingMarks: string;
    location: string;
    serialNumber: string;
    city: string;
    tags: string;
    image: File | null;
    imagePreview: string | null;
}

type Step = 'auth' | 'instructions' | 'form' | 'confirmation' | 'success';

const ReportFlowPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { addNotification } = useNotification();

    const [step, setStep] = useState<Step>(user ? 'instructions' : 'auth');
    const [reportData, setReportData] = useState<ReportData>({
        reportType: 'lost',
        category: '',
        subcategory: '',
        itemName: '',
        description: '',
        brand: '',
        color: '',
        material: '',
        identifyingMarks: '',
        location: '',
        serialNumber: '',
        city: 'Ujjain',
        tags: '',
        image: null,
        imagePreview: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [matchIds, setMatchIds] = useState<string[]>([]);
    
    const stepTitles: { [key in Step]: string } = {
        auth: t.stepAuth,
        instructions: t.stepInstructions,
        form: t.stepForm,
        confirmation: t.stepConfirmation,
        success: t.stepSuccess,
    };
    
    const allSteps: Step[] = ['auth', 'instructions', 'form', 'confirmation'];

    const handleLoginSuccess = () => {
        setStep('instructions');
    };

    const handleProceedFromInstructions = () => {
        setStep('form');
    };
    
    const handleFormSubmit = (data: ReportData) => {
        setReportData(data);
        setStep('confirmation');
    };

    const handleBackToForm = () => {
        setStep('form');
    };
    
    const handleConfirm = async () => {
        setIsSubmitting(true);
        console.log("Submitting report:", reportData);
        
        try {
            // 1. Get all existing reports from localStorage
            const allReportsStr = localStorage.getItem('foundtastic-all-reports');
            let allReports: Report[] = allReportsStr ? JSON.parse(allReportsStr) : [];

            // 2. Create the new report object
            const newReport: Report = {
                id: `rep-${Date.now()}`,
                // FIX: Added the missing 'reportCategory' property. This report flow is for items.
                reportCategory: 'item',
                type: reportData.reportType,
                item: reportData.itemName,
                description: reportData.description,
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
                location: `${reportData.location}, ${reportData.city}`,
                imageUrl: reportData.imagePreview || '',
                matches: [],
            };

            // 3. Find candidate reports to match against
            const candidateType = newReport.type === 'lost' ? 'found' : 'lost';
            const candidates = allReports.filter(r => r.type === candidateType);

            // 4. Call the AI matching service
            if (candidates.length > 0) {
                const matchedReportIds = await findMatchingReports(newReport, candidates);
                
                if (matchedReportIds.length > 0) {
                    newReport.matches = matchedReportIds;
                    setMatchIds(matchedReportIds);

                    // 5. Update the matched reports to link back to the new report
                    allReports = allReports.map(report => {
                        if (matchedReportIds.includes(report.id)) {
                            return {
                                ...report,
                                matches: [...(report.matches || []), newReport.id]
                            };
                        }
                        return report;
                    });
                }
            }

            // 6. Add the new report to the list and save back to localStorage
            const updatedReports = [...allReports, newReport];
            localStorage.setItem('foundtastic-all-reports', JSON.stringify(updatedReports));
            
            // 7. Add notifications
            addNotification({
                title: t.notificationReportFiledTitle,
                message: t.notificationReportFiledBody.replace('{itemName}', newReport.item),
                link: '/profile'
            });
            if (newReport.matches.length > 0) {
                addNotification({
                    title: t.notificationMatchFoundTitle,
                    message: t.notificationMatchFoundBody.replace('{itemName}', newReport.item),
                    link: '/profile'
                });
            }

        } catch (error) {
            console.error("Failed during report submission and matching process:", error);
            // Optionally show an error to the user
        } finally {
            setIsSubmitting(false);
            setStep('success');
        }
    };
    
    const handleFileAnother = () => {
        setReportData({
            reportType: 'lost',
            category: '',
            subcategory: '',
            itemName: '',
            description: '',
            brand: '',
            color: '',
            material: '',
            identifyingMarks: '',
            location: '',
            serialNumber: '',
            city: 'Ujjain',
            tags: '',
            image: null,
            imagePreview: null,
        });
        setMatchIds([]);
        setStep('instructions'); // Go to instructions as user is now logged in
    };

    const renderStepContent = () => {
        switch (step) {
            case 'auth':
                return <AuthStep onLoginSuccess={handleLoginSuccess} />;
            case 'instructions':
                return <InstructionsStep onProceed={handleProceedFromInstructions} />;
            case 'form':
                return <ReportFormStep onSubmit={handleFormSubmit} initialData={reportData} />;
            case 'confirmation':
                return <ConfirmationStep data={reportData} onConfirm={handleConfirm} onBack={handleBackToForm} isSubmitting={isSubmitting} />;
            case 'success':
                return <SuccessStep onFileAnother={handleFileAnother} reportData={reportData} matchIds={matchIds} />;
            default:
                return null;
        }
    };
    
    const getStepStatus = (currentStep: Step, targetStep: Step): string => {
        const currentIndex = allSteps.indexOf(currentStep);
        const targetIndex = allSteps.indexOf(targetStep);

        if (targetIndex < currentIndex) {
            return 'complete';
        }
        if (targetIndex === currentIndex) {
            return 'current';
        }
        return 'upcoming';
    };


    return (
        <div className="bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-brand-dark sm:text-5xl">{t.reportTitle}</h1>
                        <p className="mt-4 text-lg text-slate-600">{t.reportSubtitle}</p>
                    </div>
                    
                    {step !== 'success' && (
                         <nav aria-label="Progress" className="mb-12">
                            <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                                {allSteps.map((s) => (
                                    <li key={s} className="md:flex-1">
                                        {getStepStatus(step, s) === 'complete' ? (
                                             <div className="group flex flex-col border-l-4 border-brand-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                                                <span className="text-sm font-medium text-brand-primary">{stepTitles[s]}</span>
                                            </div>
                                        ) : getStepStatus(step, s) === 'current' ? (
                                            <div className="flex flex-col border-l-4 border-brand-secondary py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0" aria-current="step">
                                                <span className="text-sm font-medium text-brand-secondary">{stepTitles[s]}</span>
                                            </div>
                                        ) : (
                                            <div className="group flex flex-col border-l-4 border-gray-200 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                                                <span className="text-sm font-medium text-gray-500">{stepTitles[s]}</span>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}

                    <div className="bg-white rounded-lg shadow-xl p-6 sm:p-10">
                         <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">{stepTitles[step]}</h2>
                        {renderStepContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportFlowPage;