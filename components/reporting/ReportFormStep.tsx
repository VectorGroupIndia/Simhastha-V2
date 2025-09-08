import React, { useState, useEffect } from 'react';
import { ReportData } from '../../pages/ReportFlowPage';
import { analyzeItemImage, translateFromEnglish, extractFacesFromImage, GeminiAnalysisResult } from '../../services/gemini';
import { useLanguage } from '../../contexts/LanguageContext';
import Spinner from '../Spinner';

interface ReportFormStepProps {
    onSubmit: (data: ReportData) => void;
    initialData: Partial<ReportData>;
}

const categories = {
    'Electronics': ['Mobile Phone', 'Laptop', 'Camera', 'Headphones', 'Other'],
    'Documents': ['Wallet', 'ID Card', 'Passport', 'Keys', 'Other'],
    'Bags': ['Backpack', 'Handbag', 'Luggage', 'Other'],
    'Personal Items': ['Watch', 'Jewelry', 'Glasses', 'Umbrella', 'Other'],
    'Other': ['Other'],
};

const cities = ['Ujjain', 'Indore', 'Bhopal', 'Gwalior', 'Jabalpur'];

const fileToBase64 = (file: File): Promise<{mimeType: string, data: string}> => 
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimePart, dataPart] = result.split(';base64,');
            const mimeType = mimePart.split(':')[1];
            resolve({mimeType, data: dataPart});
        };
        reader.onerror = error => reject(error);
    });

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

const baseLoadingMessages = ["Analyzing image...", "Identifying key features...", "Categorizing the item...", "Almost there..."];

type AnalysisState = 'idle' | 'loading' | 'multi-item-selection' | 'face-selection' | 'error' | 'success';

const ReportFormStep: React.FC<ReportFormStepProps> = ({ onSubmit, initialData }) => {
    const { language, t } = useLanguage();
    const [formData, setFormData] = useState<ReportData>({
        reportCategory: 'item',
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
        age: '',
        gender: '',
        lastSeenWearing: '',
        ...initialData,
    });
    
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
    const [analysisResults, setAnalysisResults] = useState<any[]>([]);
    const [analysisError, setAnalysisError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState(baseLoadingMessages[0]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (formData.category && categories[formData.category as keyof typeof categories]) {
            setSubcategories(categories[formData.category as keyof typeof categories]);
        } else {
            setSubcategories([]);
        }
    }, [formData.category]);

     useEffect(() => {
        let interval: number;
        if (analysisState === 'loading') {
            const messages = loadingMessage === t.translatingAIResult ? [t.translatingAIResult] : baseLoadingMessages;
            setLoadingMessage(messages[0]); 
            let messageIndex = 0;
            interval = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                setLoadingMessage(messages[messageIndex]);
            }, 2000); 
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [analysisState, loadingMessage, t.translatingAIResult]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            const newErrors = { ...errors };
            delete newErrors[name];
            setErrors(newErrors);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        
        const filesArray = Array.from(e.target.files);
        if(filesArray.length === 0) return;

        const file = filesArray[0]; // For simplicity, handle one image at a time for analysis
        
        setFormData(prev => ({...prev, images: [file], imagePreviews: [URL.createObjectURL(file)] }));
        setAnalysisState('loading');
        setAnalysisError('');
        
        try {
            const base64Image = await fileToBase64(file);
            if (formData.reportCategory === 'person') {
                const faces = await extractFacesFromImage(base64Image);
                if (faces.length > 1) {
                    setAnalysisResults(faces);
                    setAnalysisState('face-selection');
                } else if (faces.length === 1) {
                    setFormData(prev => ({ ...prev, imagePreviews: faces, images: [] })); // Use the extracted face
                    setAnalysisState('idle'); // Or 'success' if we want a message
                } else {
                    setAnalysisState('error');
                    setAnalysisError("No faces detected. Please upload a clearer photo or a photo with people.");
                }
            } else { // 'item' category
                const results = await analyzeItemImage([base64Image]);
                if(results.length > 1) {
                    setAnalysisResults(results);
                    setAnalysisState('multi-item-selection');
                } else if (results.length === 1) {
                    handlePopulateFormWithItem(results[0]);
                } else {
                     setAnalysisState('error');
                     setAnalysisError("No distinct items found. Please fill the form manually.");
                }
            }
        } catch (error) {
            console.error("AI analysis failed:", error);
            setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
            setAnalysisState('error');
        }
    };

    const handlePopulateFormWithItem = async (item: GeminiAnalysisResult) => {
         let finalData = { ...item };
         if (language !== 'English') {
            setLoadingMessage(t.translatingAIResult);
            const [title, description, brand, color, material, identifyingMarks] = await Promise.all([
                translateFromEnglish(item.title, language),
                translateFromEnglish(item.description, language),
                translateFromEnglish(item.brand, language),
                translateFromEnglish(item.color, language),
                translateFromEnglish(item.material, language),
                translateFromEnglish(item.identifyingMarks, language),
            ]);
            finalData = { ...item, title, description, brand, color, material, identifyingMarks };
        }
        setFormData(prev => ({
            ...prev,
            category: finalData.category || prev.category,
            subcategory: finalData.subcategory || '',
            itemName: finalData.title || prev.itemName,
            description: finalData.description || prev.description,
            brand: finalData.brand || prev.brand,
            color: finalData.color || prev.color,
            material: finalData.material || prev.material,
            identifyingMarks: finalData.identifyingMarks || prev.identifyingMarks,
        }));
        setAnalysisState('success');
    }
    
    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
        }));
        setAnalysisState('idle');
        setAnalysisResults([]);
        setAnalysisError('');
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const errorStrings = t.formErrors;

        if (formData.reportCategory === 'person') {
            if (!formData.itemName.trim()) newErrors.itemName = errorStrings.nameRequired;
            if (!formData.age.trim()) newErrors.age = "Age is required.";
            if (!formData.gender) newErrors.gender = "Gender is required.";
            if (!formData.description.trim()) newErrors.description = errorStrings.description;
        } else {
             if (!formData.category) newErrors.category = errorStrings.category;
             if (!formData.subcategory) newErrors.subcategory = errorStrings.subcategory;
             if (!formData.itemName.trim()) newErrors.itemName = errorStrings.itemName;
             if (!formData.description.trim()) newErrors.description = errorStrings.description;
        }

        if (!formData.city.trim()) newErrors.city = errorStrings.city;
        if (!formData.location.trim()) newErrors.location = errorStrings.location;
        if (formData.imagePreviews.length === 0) newErrors.images = "An image is required.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const getInputClassName = (field: string) => `mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-slate-900 ${errors[field] ? 'border-red-500' : 'border-slate-300'}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Report Category & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="reportCategory" className="block text-sm font-medium text-slate-700">{t.reportCategoryTitle}</label>
                    <select id="reportCategory" name="reportCategory" value={formData.reportCategory} onChange={handleChange} className={getInputClassName('reportCategory')}>
                        <option value="item">{t.reportCategoryItem}</option>
                        <option value="person">{t.reportCategoryPerson}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">{formData.reportCategory === 'person' ? "Status" : "Report Type"}</label>
                     <div className="mt-1 flex border border-gray-200 rounded-md overflow-hidden">
                        <button type="button" onClick={() => setFormData(p => ({...p, reportType: 'lost'}))} className={`flex-1 py-2 text-center font-semibold transition-colors duration-200 ${formData.reportType === 'lost' ? 'text-white bg-brand-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                            {t.reportTypeLost}
                        </button>
                        {formData.reportCategory === 'item' && (
                        <button type="button" onClick={() => setFormData(p => ({...p, reportType: 'found'}))} className={`flex-1 py-2 text-center font-semibold transition-colors duration-200 ${formData.reportType === 'found' ? 'text-white bg-brand-secondary' : 'text-slate-600 hover:bg-slate-100'}`}>
                            {t.reportTypeFound}
                        </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Image Upload & AI */}
            <div>
                 <label className="block text-sm font-medium text-slate-700">{t.uploadAndAnalyze}</label>
                 <div className="mt-2 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                    {formData.imagePreviews.length === 0 ? (
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t.chooseImage}</span> or drag and drop</p>
                                <input id="file-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*"/>
                            </label>
                        </div> 
                    ): (
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {formData.imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group"><img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-md" /><button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 m-1 bg-red-600/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100" aria-label="Remove image">&times;</button></div>
                            ))}
                        </div>
                    )}
                    {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                 </div>
            </div>
            
            {analysisState === 'loading' && <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center"><Spinner size="md" className="text-brand-primary mr-3" /><span className="text-sm font-medium text-brand-primary">{loadingMessage}</span></div>}
            {analysisState === 'success' && <div className="p-4 bg-green-50 border border-green-200 rounded-lg"><h4 className="font-semibold text-green-800">{t.analysisCompleteTitle}</h4><p className="mt-1 text-sm text-green-700">{t.analysisCompleteBody}</p></div>}
            {analysisState === 'error' && <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"><AlertTriangleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0"/><div><h4 className="font-semibold text-red-800">{t.analysisFailedTitle}</h4><p className="mt-1 text-sm text-red-700">{analysisError}</p></div></div>}
            
            {analysisState === 'multi-item-selection' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800">{t.analysisMultiItemTitle}</h4>
                    <p className="mt-1 text-sm text-blue-700">{t.analysisMultiItemBody}</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {analysisResults.map((item, index) => (
                            <button key={index} type="button" onClick={() => handlePopulateFormWithItem(item)} className="p-3 bg-white border rounded-md shadow-sm text-left hover:bg-blue-100 hover:border-blue-300">
                                <p className="font-semibold text-brand-dark">{item.title}</p>
                                <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {analysisState === 'face-selection' && (
                 <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800">{t.analysisFaceSelectionTitle}</h4>
                    <p className="mt-1 text-sm text-blue-700">{t.analysisFaceSelectionBody}</p>
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {analysisResults.map((faceUrl, index) => (
                             <button key={index} type="button" onClick={() => { setFormData(prev => ({...prev, imagePreviews: [faceUrl], images: []})); setAnalysisState('idle');}} className="aspect-square border-2 border-transparent rounded-md overflow-hidden hover:border-brand-primary hover:scale-105 transition-transform focus:border-brand-primary focus:ring-2 focus:ring-brand-primary">
                                <img src={faceUrl} alt={`Detected face ${index+1}`} className="w-full h-full object-cover"/>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t pt-6 space-y-6">
                 <p className="block text-sm font-medium text-slate-700">{t.fillDetails}</p>

                {formData.reportCategory === 'person' ? (
                <>
                    <div><label htmlFor="itemName" className="block text-sm font-medium text-slate-700">{t.confirmPersonName}</label><input type="text" id="itemName" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g., Suresh Kumar" className={getInputClassName('itemName')}/>{errors.itemName && <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="age" className="block text-sm font-medium text-slate-700">{t.confirmPersonAge}</label><input type="number" id="age" name="age" value={formData.age} onChange={handleChange} placeholder="e.g., 45" className={getInputClassName('age')}/>{errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}</div>
                        <div><label htmlFor="gender" className="block text-sm font-medium text-slate-700">{t.confirmPersonGender}</label><select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={getInputClassName('gender')}><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>{errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}</div>
                    </div>
                     <div><label htmlFor="lastSeenWearing" className="block text-sm font-medium text-slate-700">{t.confirmLastSeenWearing}</label><input type="text" id="lastSeenWearing" name="lastSeenWearing" value={formData.lastSeenWearing} onChange={handleChange} placeholder="e.g., Blue shirt, black pants" className={getInputClassName('lastSeenWearing')}/></div>
                    <div><label htmlFor="description" className="block text-sm font-medium text-slate-700">{t.description}</label><textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} placeholder="Any other identifying marks or details" className={getInputClassName('description')}></textarea>{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}</div>
                </>
                ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="category" className="block text-sm font-medium text-slate-700">{t.category}</label><select id="category" name="category" value={formData.category} onChange={handleChange} className={getInputClassName('category')}><option value="">{t.selectCategory}</option>{Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>{errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}</div>
                        <div><label htmlFor="subcategory" className="block text-sm font-medium text-slate-700">{t.subcategory}</label><select id="subcategory" name="subcategory" value={formData.subcategory} onChange={handleChange} disabled={!formData.category} className={getInputClassName('subcategory') + " disabled:bg-slate-50"}><option value="">{t.selectSubcategory}</option>{subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}</select>{errors.subcategory && <p className="mt-1 text-sm text-red-600">{errors.subcategory}</p>}</div>
                    </div>
                    <div><label htmlFor="itemName" className="block text-sm font-medium text-slate-700">{t.itemName}</label><input type="text" id="itemName" name="itemName" value={formData.itemName} onChange={handleChange} placeholder={t.itemNamePlaceholder} className={getInputClassName('itemName')}/>{errors.itemName && <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>}</div>
                    <div><label htmlFor="description" className="block text-sm font-medium text-slate-700">{t.description}</label><textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} placeholder={t.descriptionPlaceholder} className={getInputClassName('description')}></textarea>{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}</div>
                </>
                )}
                 
                <div className="border-t pt-6 space-y-6">
                    <p className="block text-sm font-medium text-slate-700">{t.locationInfo}</p>
                    <div><label htmlFor="city" className="block text-sm font-medium text-slate-700">{t.city}</label><select id="city" name="city" value={formData.city} onChange={handleChange} className={getInputClassName('city')}><option value="Ujjain">Ujjain</option></select>{errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}</div>
                    <div><label htmlFor="location" className="block text-sm font-medium text-slate-700">{formData.reportType === 'lost' ? t.lastSeenLocation : t.foundLocation}</label><input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder={t.locationPlaceholder} className={getInputClassName('location')}/>{errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}</div>
                </div>
            </div>
            
            <div className="border-t pt-6">
                <button type="submit" className="w-full bg-brand-secondary text-white font-semibold py-3 px-4 rounded-md hover:opacity-90 flex justify-center items-center">
                   {t.submitButton}
                </button>
            </div>
        </form>
    );
};

export default ReportFormStep;
