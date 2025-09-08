

import React, { useState, useEffect } from 'react';
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
import { findMatchingReports, getTagsFromText, translateToEnglish } from '../services/gemini';

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
    images: File[];
    imagePreviews: string[];
}

type Step = 'auth' | 'instructions' | 'form' | 'confirmation' | 'success';

const BackgroundBlobs: React.FC = () => (
    <div className="fixed inset-0 -z-10">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/30 rounded-full filter blur-3xl opacity-50 animate-float"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/30 rounded-full filter blur-3xl opacity-50 animate-float2"></div>
    </div>
);

const ReportFlowPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
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
        images: [],
        imagePreviews: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [matchIds, setMatchIds] = useState<string[]>([]);
    
    useEffect(() => {
        if (user && user.role !== 'user') {
            const dashboardMap: { [key: string]: string } = {
                admin: '/admin',
                authority: '/authority',
                volunteer: '/volunteer'
            };
            const redirectPath = dashboardMap[user.role];
            if (redirectPath) {
                navigate(redirectPath, { replace: true });
            }
        }
    }, [user, navigate]);

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
        if (!user) {
            addNotification({ title: 'Error', message: 'You must be logged in to submit a report.' });
            return;
        }
        setIsSubmitting(true);
        
        try {
            // 1. Prepare data for processing (all in English)
            let processedData = { ...reportData };
            if (language !== 'English') {
                const [itemName, description, brand, color, material, identifyingMarks, location, tags] = await Promise.all([
                    translateToEnglish(reportData.itemName, language),
                    translateToEnglish(reportData.description, language),
                    translateToEnglish(reportData.brand, language),
                    translateToEnglish(reportData.color, language),
                    translateToEnglish(reportData.material, language),
                    translateToEnglish(reportData.identifyingMarks, language),
                    translateToEnglish(reportData.location, language),
                    translateToEnglish(reportData.tags, language),
                ]);
                processedData = { ...processedData, itemName, description, brand, color, material, identifyingMarks, location, tags };
            }

            // 2. AI Text Analysis for tags
            if (processedData.description) {
                const aiTags = await getTagsFromText(processedData.description);
                const userTags = processedData.tags ? processedData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                const combinedTags = [...new Set([...userTags, ...aiTags])];
                processedData.tags = combinedTags.join(', ');
            }
            
            // 3. Create the final Report object
            const newReport: Report = {
                id: `rep-${Date.now()}`,
                reporterId: user.id,
                reportCategory: 'item',
                type: processedData.reportType,
                item: processedData.itemName,
                description: processedData.description,
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
                location: `${processedData.location}, ${processedData.city}`,
                imageUrls: processedData.imagePreviews,
                matches: [],
            };

            // 4. Find matches
            const allReportsStr = localStorage.getItem('foundtastic-all-reports');
            let allReports: Report[] = allReportsStr ? JSON.parse(allReportsStr) : [];
            const candidateType = newReport.type === 'lost' ? 'found' : 'lost';
            const candidates = allReports.filter(r => r.type === candidateType);

            if (candidates.length > 0) {
                const matchedReportIds = await findMatchingReports(newReport, candidates);
                
                if (matchedReportIds.length > 0) {
                    newReport.matches = matchedReportIds;
                    setMatchIds(matchedReportIds);

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
            
            // 5. Save and Notify
            const updatedReports = [...allReports, newReport];
            localStorage.setItem('foundtastic-all-reports', JSON.stringify(updatedReports));
            
            addNotification({
                title: t.notificationReportFiledTitle,
                message: t.notificationReportFiledBody.replace('{itemName}', reportData.itemName),
                link: '/profile'
            });

            if (newReport.matches && newReport.matches.length > 0) {
                addNotification({
                    title: t.notificationMatchFoundTitle,
                    message: t.notificationMatchFoundBody.replace('{itemName}', reportData.itemName),
                    link: '/profile'
                });
            }

        } catch (error) {
            console.error("Failed during report submission and matching process:", error);
            addNotification({ title: 'Submission Failed', message: 'An error occurred while filing your report.' });
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
            images: [],
            imagePreviews: [],
        });
        setMatchIds([]);
        setStep('instructions');
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
        <div className="relative isolate overflow-hidden min-h-screen py-16">
            <BackgroundBlobs />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{t.reportTitle}</h1>
                        <p className="mt-4 text-lg text-slate-300">{t.reportSubtitle}</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
                         {step !== 'success' && (
                             <nav aria-label="Progress" className="mb-12">
                                <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                                    {allSteps.map((s) => (
                                        <li key={s} className="md:flex-1">
                                            {getStepStatus(step, s) === 'complete' ? (
                                                 <div className="group flex flex-col border-l-4 border-brand-secondary py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                                                    <span className="text-sm font-medium text-brand-secondary">{stepTitles[s]}</span>
                                                </div>
                                            ) : getStepStatus(step, s) === 'current' ? (
                                                <div className="flex flex-col border-l-4 border-brand-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0" aria-current="step">
                                                    <span className="text-sm font-medium text-brand-primary">{stepTitles[s]}</span>
                                                </div>
                                            ) : (
                                                <div className="group flex flex-col border-l-4 border-gray-200/30 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                                                    <span className="text-sm font-medium text-gray-400">{stepTitles[s]}</span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        )}
                         <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">{stepTitles[step]}</h2>
                        {renderStepContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportFlowPage;