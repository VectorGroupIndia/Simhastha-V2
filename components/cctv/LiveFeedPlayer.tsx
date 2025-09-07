import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Report } from '../../pages/ProfilePage';
import { Sighting } from '../../pages/authority/CCTVMonitoringPage';
import { findFaceInVideoFrame } from '../../services/gemini';
import Spinner from '../Spinner';

interface LiveFeedPlayerProps {
    report: Report | null;
    onNewSighting: (sighting: Omit<Sighting, 'id'>) => void;
    isActive: boolean;
    onFeedStatusChange: (isActive: boolean) => void;
}

type AIStatus = 'idle' | 'initializing' | 'scanning' | 'error' | 'match_found';

const fileToBase64 = (url: string): Promise<{ mimeType: string, data: string }> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                const result = reader.result as string;
                const [mimePart, dataPart] = result.split(';base64,');
                const mimeType = mimePart.split(':')[1];
                resolve({ mimeType, data: dataPart });
            };
            reader.onerror = reject;
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    });
};

const LiveFeedPlayer: React.FC<LiveFeedPlayerProps> = ({ report, onNewSighting, isActive, onFeedStatusChange }) => {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [aiStatus, setAiStatus] = useState<AIStatus>('idle');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const statusInfo: Record<AIStatus, { text: string; color: string; icon: JSX.Element }> = {
        idle: { text: t.cctvStatusIdle, color: 'text-gray-500', icon: <></> },
        initializing: { text: t.cctvStatusInitializing, color: 'text-blue-600', icon: <Spinner size="sm" className="mr-2" /> },
        scanning: { text: t.cctvStatusScanning, color: 'text-green-600', icon: <Spinner size="sm" className="mr-2 animate-spin-slow" /> },
        error: { text: t.cctvStatusError, color: 'text-red-600', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        match_found: { text: t.cctvMatchFound, color: 'text-yellow-500 font-bold', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
    };

    const startVideoStream = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && videoRef.current) {
            setAiStatus('initializing');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                onFeedStatusChange(true);
                setAiStatus('scanning');
            } catch (err) {
                console.error("Error accessing camera:", err);
                setAiStatus('error');
                onFeedStatusChange(false);
            }
        }
    }, [onFeedStatusChange]);
    
    const stopVideoStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            onFeedStatusChange(false);
            setAiStatus('idle');
        }
    };
    
    useEffect(() => {
        if (report && !isActive) {
            startVideoStream();
        } else if (!report && isActive) {
            stopVideoStream();
        }

        return () => {
            // Cleanup on unmount
            if(videoRef.current && videoRef.current.srcObject) {
                stopVideoStream();
            }
        };
    }, [report, isActive, startVideoStream]);


    const captureAndAnalyzeFrame = useCallback(async () => {
        if (isProcessing || !videoRef.current || !canvasRef.current || !report) return;

        setIsProcessing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameDataUrl = canvas.toDataURL('image/jpeg');
            
            try {
                const personImage = await fileToBase64(report.imageUrl);
                const frameImage = { mimeType: 'image/jpeg', data: frameDataUrl.split(',')[1] };
                
                const result = await findFaceInVideoFrame(personImage, frameImage);
                
                if (result.match) {
                    setAiStatus('match_found');
                    // FIX: Added missing status and confirmedBy properties to the new sighting object to match the expected type.
                    onNewSighting({
                        reportId: report.id,
                        timestamp: new Date(),
                        cameraLocation: 'CAM 04 - Ram Ghat',
                        snapshotUrl: frameDataUrl,
                        confidence: result.confidence || 0.85, // Default confidence
                        status: 'unconfirmed',
                        confirmedBy: null
                    });
                    // Pause for a bit after a match
                    setTimeout(() => setAiStatus('scanning'), 5000);
                }
            } catch (error) {
                console.error("Analysis failed:", error);
            }
        }
        setIsProcessing(false);
    }, [report, isProcessing, onNewSighting]);

     useEffect(() => {
        const interval = setInterval(() => {
            if (isActive && aiStatus === 'scanning') {
                captureAndAnalyzeFrame();
            }
        }, 3000); // Analyze every 3 seconds

        return () => clearInterval(interval);
    }, [isActive, aiStatus, captureAndAnalyzeFrame]);


    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t.cctvLiveFeed}: CAM 04 - Ram Ghat</h3>
            <div className="relative w-full flex-grow bg-black rounded-md overflow-hidden aspect-video">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {!report && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-lg font-semibold">
                        {t.cctvStatusIdle}
                    </div>
                )}
            </div>
            <div className="mt-3 p-3 bg-gray-100 rounded-md flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{t.cctvStatus}</span>
                <div className={`flex items-center text-sm font-medium ${statusInfo[aiStatus].color}`}>
                    {statusInfo[aiStatus].icon}
                    {statusInfo[aiStatus].text}
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

export default LiveFeedPlayer;