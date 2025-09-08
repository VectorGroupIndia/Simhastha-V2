


import React, { useState, useEffect } from 'react';
import { ReportData } from '../../pages/ReportFlowPage';
import { analyzeItemImage, translateFromEnglish } from '../../services/gemini';
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

const ReportFormStep: React.FC<ReportFormStepProps> = ({ onSubmit, initialData }) => {
    const { language, t } = useLanguage();
    // FIX: Initialize formData with all required fields from ReportData to satisfy TypeScript.
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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState('');
    const [analysisSuccess, setAnalysisSuccess] = useState(false);
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
        if (isAnalyzing) {
            const loadingMessages = isAnalyzing && loadingMessage === t.translatingAIResult
                ? [t.translatingAIResult]
                : baseLoadingMessages;
                
            setLoadingMessage(loadingMessages[0]); 
            let messageIndex = 0;
            interval = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 2000); 
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isAnalyzing, loadingMessage, t.translatingAIResult]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setAnalysisSuccess(false);
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnalysisSuccess(false);
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const currentImages = [...formData.images, ...filesArray];
            
            const previewPromises = filesArray.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(previewPromises).then(newPreviews => {
                setFormData(prev => ({
                    ...prev,
                    images: currentImages,
                    imagePreviews: [...prev.imagePreviews, ...newPreviews],
                }));
            });
        }
    };
    
    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
        }));
    }
    
    const handleAnalyzeImage = async () => {
        if (formData.images.length === 0) return;

        setIsAnalyzing(true);
        setAnalysisSuccess(false);
        setAnalysisError('');
        try {
            const base64Promises = formData.images.map(file => fileToBase64(file));
            const base64Images = await Promise.all(base64Promises);
            
            // FIX: The analyzeItemImage function returns an array of results.
            const analysisResults = await analyzeItemImage(base64Images);
            
            // Handle case where no items are found
            if (!analysisResults || analysisResults.length === 0) {
                setAnalysisError("No distinct items could be identified in the image. Please fill the form manually.");
                setAnalysisSuccess(false);
                setIsAnalyzing(false);
                return;
            }

            // For this form, we'll use the first item identified by the AI.
            // A more complex UI could let the user choose if multiple items are found.
            const analysisResult = analysisResults[0];
            
            let finalData = { ...analysisResult };

            if (language !== 'English') {
                setLoadingMessage(t.translatingAIResult);
                const [
                    translatedTitle,
                    translatedDescription,
                    translatedBrand,
                    translatedColor,
                    translatedMaterial,
                    translatedIdentifyingMarks
                ] = await Promise.all([
                    translateFromEnglish(analysisResult.title, language),
                    translateFromEnglish(analysisResult.description, language),
                    translateFromEnglish(analysisResult.brand, language),
                    translateFromEnglish(analysisResult.color, language),
                    translateFromEnglish(analysisResult.material, language),
                    translateFromEnglish(analysisResult.identifyingMarks, language),
                ]);
                finalData.title = translatedTitle;
                finalData.description = translatedDescription;
                finalData.brand = translatedBrand;
                finalData.color = translatedColor;
                finalData.material = translatedMaterial;
                finalData.identifyingMarks = translatedIdentifyingMarks;
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
            
            setAnalysisSuccess(true);

        } catch (error) {
            console.error("AI analysis failed:", error);
            setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
            setAnalysisSuccess(false);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const errorStrings = t.formErrors;
        if (!formData.category) newErrors.category = errorStrings.category;
        if (!formData.subcategory) newErrors.subcategory = errorStrings.subcategory;
        if (!formData.itemName.trim()) newErrors.itemName = errorStrings.itemName;
        if (!formData.description.trim()) newErrors.description = errorStrings.description;
        if (!formData.city.trim()) newErrors.city = errorStrings.city;
        if (!formData.location.trim()) newErrors.location = errorStrings.location;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const getInputClassName = (field: string, isSelect = false) => `mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-slate-900 ${isSelect ? '' : ''} ${errors[field] ? 'border-red-500' : 'border-slate-300'}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Report Type Tabs */}
            <div className="flex border-b border-gray-200">
                <button type="button" onClick={() => setFormData(p => ({...p, reportType: 'lost'}))} className={`flex-1 py-3 text-center font-semibold transition-colors duration-200 ${formData.reportType === 'lost' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t.reportTypeLost}
                </button>
                <button type="button" onClick={() => setFormData(p => ({...p, reportType: 'found'}))} className={`flex-1 py-3 text-center font-semibold transition-colors duration-200 ${formData.reportType === 'found' ? 'text-brand-secondary border-b-2 border-brand-secondary' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t.reportTypeFound}
                </button>
            </div>
            
            {/* Image Upload & AI */}
            <div>
                 <label className="block text-sm font-medium text-slate-700">{t.uploadAndAnalyze}</label>
                 <div className="mt-2 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t.chooseImage}</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                            </div>
                            <input id="file-upload" type="file" className="hidden" multiple onChange={handleImageChange} accept="image/*"/>
                        </label>
                    </div> 

                    {formData.imagePreviews.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {formData.imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-0 right-0 m-1 bg-red-600/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove image"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                     <p className="text-xs text-slate-500 mt-2">{t.imageImprovesMatch}</p>
                     
                     <div className="mt-4">
                        <button type="button" onClick={handleAnalyzeImage} disabled={formData.images.length === 0 || isAnalyzing} className="w-full justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90 disabled:bg-slate-400 disabled:cursor-not-allowed flex">
                            {t.analyzeWithAI}
                        </button>
                     </div>
                     {isAnalyzing && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                            <Spinner size="md" className="text-brand-primary mr-3" />
                            <span className="text-sm font-medium text-brand-primary">{loadingMessage}</span>
                        </div>
                    )}
                    {analysisSuccess && !isAnalyzing && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                             <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="font-semibold text-green-800">{t.analysisCompleteTitle}</h4>
                                <p className="mt-1 text-sm text-green-700">{t.analysisCompleteBody}</p>
                            </div>
                        </div>
                    )}
                    {analysisError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                            <AlertTriangleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0"/>
                            <div>
                                <h4 className="font-semibold text-red-800">{t.analysisFailedTitle}</h4>
                                <p className="mt-1 text-sm text-red-700">{analysisError}</p>
                                <p className="mt-2 text-sm text-red-700">{t.analysisFailedBody}</p>
                            </div>
                        </div>
                    )}
                 </div>
            </div>
            
            <div className="border-t pt-6 space-y-6">
                 <p className="block text-sm font-medium text-slate-700">{t.fillDetails}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category & Subcategory */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700">{t.category}</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} className={getInputClassName('category', true)}>
                            <option value="">{t.selectCategory}</option>
                            {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                    </div>
                    <div>
                        <label htmlFor="subcategory" className="block text-sm font-medium text-slate-700">{t.subcategory}</label>
                        <select id="subcategory" name="subcategory" value={formData.subcategory} onChange={handleChange} disabled={!formData.category} className={getInputClassName('subcategory', true) + " disabled:bg-slate-50"}>
                            <option value="">{t.selectSubcategory}</option>
                            {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                        {errors.subcategory && <p className="mt-1 text-sm text-red-600">{errors.subcategory}</p>}
                    </div>
                </div>

                {/* Item Name */}
                <div>
                    <label htmlFor="itemName" className="block text-sm font-medium text-slate-700">{t.itemName}</label>
                    <input type="text" id="itemName" name="itemName" value={formData.itemName} onChange={handleChange} placeholder={t.itemNamePlaceholder} className={getInputClassName('itemName')}/>
                    {errors.itemName && <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>}
                </div>

                {/* Description */}
                <div>
                     <label htmlFor="description" className="block text-sm font-medium text-slate-700">{t.description}</label>
                    <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} placeholder={t.descriptionPlaceholder} className={getInputClassName('description')}></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
                 
                 {/* Detailed Info Section */}
                 <div className="border-t pt-6 space-y-6">
                    <p className="block text-sm font-medium text-slate-700">{t.moreDetails}</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label htmlFor="brand" className="block text-sm font-medium text-slate-700">{t.brand}</label>
                             <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder={t.brandPlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-slate-700">{t.color}</label>
                            <input type="text" id="color" name="color" value={formData.color} onChange={handleChange} placeholder={t.colorPlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                        </div>
                     </div>
                     <div>
                        <label htmlFor="material" className="block text-sm font-medium text-slate-700">{t.material}</label>
                        <input type="text" id="material" name="material" value={formData.material} onChange={handleChange} placeholder={t.materialPlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                     </div>
                     <div>
                        <label htmlFor="identifyingMarks" className="block text-sm font-medium text-slate-700">{t.identifyingMarks}</label>
                        <textarea id="identifyingMarks" name="identifyingMarks" rows={3} value={formData.identifyingMarks} onChange={handleChange} placeholder={t.identifyingMarksPlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"></textarea>
                     </div>
                 </div>
                
                 {/* City & Location */}
                <div className="border-t pt-6 space-y-6">
                    <p className="block text-sm font-medium text-slate-700">{t.locationInfo}</p>
                    <div>
                         <label htmlFor="city" className="block text-sm font-medium text-slate-700">{t.city}</label>
                        <select id="city" name="city" value={formData.city} onChange={handleChange} className={getInputClassName('city', true)}>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700">{formData.reportType === 'lost' ? t.lastSeenLocation : t.foundLocation}</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder={t.locationPlaceholder} className={getInputClassName('location')}/>
                        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                    </div>
                     <div className="mt-4">
                        <p className="text-sm text-slate-600 mb-2">{t.mapInstruction}</p>
                        <div className="h-80 rounded-lg overflow-hidden shadow border border-slate-200">
                             <iframe 
                                src="https://maps.google.com/maps?q=Ujjain&t=&z=13&ieUTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{border:0}}
                                allowFullScreen={false}
                                loading="lazy"
                                title="Ujjain Location Picker Map"
                                referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                    </div>
                </div>

                {/* Serial Number & Tags */}
                 <div className="border-t pt-6 space-y-6">
                    <p className="block text-sm font-medium text-slate-700">{t.additionalInfo}</p>
                     <div>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-slate-700">{t.serialNumber}</label>
                        <input type="text" id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-slate-900"/>
                    </div>
                    
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-slate-700">{t.tags}</label>
                        <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder={t.tagsPlaceholder} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-slate-900"/>
                        <p className="mt-1 text-xs text-slate-500">{t.tagsHelp}</p>
                    </div>
                 </div>
            </div>

            {errors.form && <p className="text-sm text-red-600 text-center">{errors.form}</p>}
            
            <div className="border-t pt-6">
                <button type="submit" className="w-full bg-brand-secondary text-white font-semibold py-3 px-4 rounded-md hover:opacity-90 transition-opacity flex justify-center items-center">
                   {t.submitButton}
                </button>
            </div>
        </form>
    );
};

export default ReportFormStep;