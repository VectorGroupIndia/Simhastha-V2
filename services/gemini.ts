
import { GoogleGenAI, Type } from "@google/genai";
import { ItemCategory } from "../types";
import { CATEGORIES } from "../constants";
import { Report } from "../pages/ProfilePage";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using mock data.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface GeminiAnalysisResult {
  title: string;
  description: string;
  category: ItemCategory;
  subcategory: string;
  brand: string;
  color: string;
  material: string;
  identifyingMarks: string;
}

// This is a mock function for development when an API key isn't available.
const analyzeItemImageMock = (
  _base64Image: string,
  _mimeType: string
): Promise<GeminiAnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: "Mock: Black Headphones",
        description: "A pair of over-ear black headphones, likely for listening to music. They appear to be in good condition.",
        category: "Electronics",
        subcategory: "Headphones",
        brand: "Sony",
        color: "Black",
        material: "Plastic",
        identifyingMarks: "Small scratch on the right earcup.",
      });
    }, 1500);
  });
};

// This is the primary function that calls the Gemini API.
const analyzeItemImageLive = async (
  base64Image: string,
  mimeType: string
): Promise<GeminiAnalysisResult> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
        text: `You are an expert item identifier for a lost and found platform. Analyze the provided image and return a single, minified JSON object with the following structure. Do not include any markdown formatting like \`\`\`json.
- "title": A concise title (e.g., "Black Leather Wallet", "Silver iPhone 13").
- "description": A helpful, detailed description of the item.
- "category": The most appropriate category from this exact list: [${CATEGORIES.join(', ')}].
- "subcategory": A specific subcategory (e.g., "Headphones", "Backpack", "Passport").
- "brand": The item's brand, if identifiable. If not, use an empty string.
- "color": The primary color. If not clear, use an empty string.
- "material": The primary material (e.g., "Leather", "Plastic"). If not clear, use an empty string.
- "identifyingMarks": Any unique marks like scratches, stickers, or defects. If none, use an empty string.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, descriptive title for the item (e.g., 'Black Leather Wallet', 'Silver iPhone 13')."
            },
            description: {
              type: Type.STRING,
              description: "A brief, helpful description of the item, noting any distinguishing features visible in the image."
            },
            category: {
              type: Type.STRING,
              enum: CATEGORIES as unknown as string[],
              description: "The most fitting category from the provided list."
            },
            subcategory: {
              type: Type.STRING,
              description: "A specific subcategory for the item (e.g., 'Headphones', 'Backpack', 'Passport')."
            },
            brand: { type: Type.STRING, description: "The brand of the item, if identifiable (e.g., 'Apple', 'Samsonite'). Optional." },
            color: { type: Type.STRING, description: "The primary color of the item. Optional." },
            material: { type: Type.STRING, description: "The primary material of the item (e.g., 'Leather', 'Plastic', 'Cotton'). Optional." },
            identifyingMarks: {
              type: Type.STRING,
              description: "Any unique marks like scratches, stickers, or defects visible on the item. Optional."
            }
          },
          required: ["title", "description", "category", "subcategory"],
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as GeminiAnalysisResult;
    return result;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image. Please try again or enter details manually.");
  }
};

export const analyzeItemImage = process.env.API_KEY 
  ? analyzeItemImageLive 
  : analyzeItemImageMock;


// --- Translation Logic ---

const translateToEnglishMock = async (text: string, _sourceLanguage: string): Promise<string> => {
    if (!text) return "";
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`${text} (translated to English)`);
        }, 500);
    });
};

const translateToEnglishLive = async (text: string, sourceLanguage: string): Promise<string> => {
    if (!text || sourceLanguage === 'English') {
        return text;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Translate the following text from ${sourceLanguage} to English. Provide only the translated text, without any introductory phrases or explanations. Text to translate: "${text}"`,
            config: {
                temperature: 0.2,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error(`Error translating from ${sourceLanguage}:`, error);
        throw new Error(`Failed to translate text from ${sourceLanguage}. Please try again.`);
    }
};

export const translateToEnglish = process.env.API_KEY
    ? translateToEnglishLive
    : translateToEnglishMock;


const translateFromEnglishMock = async (text: string, targetLanguage: string): Promise<string> => {
    if (!text) return "";
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`${text} (translated to ${targetLanguage})`);
        }, 500);
    });
};

const translateFromEnglishLive = async (text: string, targetLanguage: string): Promise<string> => {
    if (!text || targetLanguage === 'English') {
        return text;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Translate the following English text to ${targetLanguage}. Provide only the translated text, without any introductory phrases, explanations, or quotes. Text to translate: "${text}"`,
            config: {
                temperature: 0.7, // A bit more creative for natural language
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error(`Error translating to ${targetLanguage}:`, error);
        throw new Error(`Failed to translate text to ${targetLanguage}. Please try again.`);
    }
};


export const translateFromEnglish = process.env.API_KEY
    ? translateFromEnglishLive
    : translateFromEnglishMock;


// --- Matching Logic ---

const findMatchingReportsMock = async (sourceReport: Report, candidates: Report[]): Promise<string[]> => {
    console.log("Using mock matching function.");
    if (sourceReport.imageUrl) {
        console.log("Image provided, but mock function does not perform visual matching.");
    }
    return new Promise(resolve => {
        setTimeout(() => {
            const matches: string[] = [];
            if (sourceReport.item.toLowerCase().includes('iphone') && sourceReport.type === 'lost') {
                const foundPhone = candidates.find(c => c.item.toLowerCase().includes('iphone') && c.type ==='found');
                if (foundPhone) matches.push(foundPhone.id);
            }
            if (sourceReport.item.toLowerCase().includes('wallet') && sourceReport.type === 'lost') {
                const foundWallet = candidates.find(c => c.item.toLowerCase().includes('wallet') && c.type ==='found');
                if (foundWallet) matches.push(foundWallet.id);
            }
            console.log(`Mock match found: ${matches}`);
            resolve(matches);
        }, 2000);
    });
};

const findMatchingReportsLive = async (sourceReport: Report, candidates: Report[]): Promise<string[]> => {
    try {
        const candidateSummaries = candidates.map(c => ({
            id: c.id,
            item: c.item,
            description: c.description,
            location: c.location
        }));

        const promptText = `You are an intelligent assistant for a lost and found platform. Your task is to find potential matches for a given report from a list of candidate reports. Your response must be a single, minified JSON object with one key: "matchedReportIds", which is an array of strings. Do not include any markdown formatting.

**Matching Criteria (Strict):**
A match is a strong potential match ONLY if it meets these criteria:
1.  **Item Similarity:** The items must be very similar in name, description, color, brand, etc.
2.  **Location Proximity:** The reported locations must be reasonably close to each other. This is a high-priority factor.
${sourceReport.imageUrl ? "3. **Visual Confirmation:** An image of the source item is provided. This is the MOST IMPORTANT factor. The description of a candidate report MUST align with the visual characteristics in the image. If the description contradicts the image (e.g., wrong color, different brand visible), it is NOT a match." : ""}

**Source Report Details ('${sourceReport.type}' report):**
- Item Name: ${sourceReport.item}
- Description: ${sourceReport.description}
- Location: ${sourceReport.location}

**Candidate Reports to evaluate ('${candidates[0]?.type || ''}' reports):**
${JSON.stringify(candidateSummaries)}

Based on the strict criteria above, return a JSON object containing only the IDs of the strong potential matches. If no reports meet the criteria, return an empty array.
Example response: {"matchedReportIds": ["rep2", "rep14"]}`;

        const textPart = { text: promptText };
        
        const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [];

        if (sourceReport.imageUrl && sourceReport.imageUrl.startsWith('data:')) {
            const [mimePart, dataPart] = sourceReport.imageUrl.split(';base64,');
            const mimeType = mimePart.split(':')[1];
            if (mimeType && dataPart) {
                const imagePart = {
                    inlineData: {
                        mimeType,
                        data: dataPart,
                    },
                };
                parts.push(imagePart);
            }
        }
        parts.push(textPart);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        matchedReportIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of report IDs that are strong potential matches based on both visual and textual analysis."
                        }
                    },
                    required: ["matchedReportIds"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { matchedReportIds: string[] };
        
        return result.matchedReportIds || [];

    } catch (error) {
        console.error("Error finding matches with Gemini:", error);
        throw new Error("Failed to find matches. Please try again later.");
    }
};

export const findMatchingReports = process.env.API_KEY
    ? findMatchingReportsLive
    : findMatchingReportsMock;


// --- Face Recognition Logic ---

interface FaceMatchResult {
    match: boolean;
    confidence?: number;
}

const findFaceInVideoFrameMock = async (
  _personImageBase64: { mimeType: string, data: string },
  _videoFrameBase64: { mimeType: string, data: string }
): Promise<FaceMatchResult> => {
  return new Promise(resolve => {
    // Simulate API call delay
    setTimeout(() => {
      // In this mock, we'll randomly return a match about 5% of the time to test the UI flow.
      const isMatch = Math.random() < 0.05; 
      if (isMatch) {
        console.log("Mock AI: Found a potential face match!");
        resolve({ match: true, confidence: Math.random() * (0.98 - 0.85) + 0.85 });
      } else {
        resolve({ match: false });
      }
    }, 2500); // Slower delay to simulate a more complex task
  });
};


const findFaceInVideoFrameLive = async (
  personImageBase64: { mimeType: string, data: string },
  videoFrameBase64: { mimeType: string, data: string }
): Promise<FaceMatchResult> => {
  try {
    const personImagePart = {
      inlineData: { ...personImageBase64 },
    };
    const videoFramePart = {
      inlineData: { ...videoFrameBase64 },
    };
    
    const textPart = {
      text: "You are an advanced AI security assistant. Your task is to determine if the person in the first image (the reference photo) is present in the second image (the video frame). Analyze the faces carefully. Respond only with a JSON object indicating if a match is found and the confidence level if it is a match.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart, personImagePart, videoFramePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match: {
              type: Type.BOOLEAN,
              description: "Whether the person from the reference photo is found in the video frame."
            },
            confidence: {
              type: Type.NUMBER,
              description: "The confidence score of the match, from 0 to 1. Only include if match is true.",
              nullable: true,
            }
          },
          required: ["match"]
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as FaceMatchResult;

  } catch (error) {
    console.error("Error during face recognition with Gemini:", error);
    // To prevent overwhelming the user with errors, we'll return 'no match' on API failure.
    // In a real-world scenario, you might want more robust error handling.
    return { match: false };
  }
};

export const findFaceInVideoFrame = process.env.API_KEY
    ? findFaceInVideoFrameLive
    : findFaceInVideoFrameMock;
