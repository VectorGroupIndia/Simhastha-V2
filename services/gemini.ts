
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
        text: `Analyze the image of this item. Based on the image, provide a concise title, a helpful description, suggest the most appropriate category, a suitable subcategory, and if possible, identify the item's brand, main color, and material for a lost and found website. The available categories are: ${CATEGORIES.join(', ')}. The subcategory should be a specific type of the item (e.g., 'Smartphone' for 'Electronics').`
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
            material: { type: Type.STRING, description: "The primary material of the item (e.g., 'Leather', 'Plastic', 'Cotton'). Optional." }
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

        const promptText = `You are an intelligent assistant for a lost and found platform. Your task is to find potential matches for a given report from a list of candidate reports.
A match should be considered likely if the items are very similar in category, description, color, brand, and reported in a similar location.

Here is the source report (this is a '${sourceReport.type}' report):
- Item Name: ${sourceReport.item}
- Description: ${sourceReport.description}
- Location: ${sourceReport.location}
${sourceReport.imageUrl ? "An image of the source item is also provided. Use it for visual comparison against the descriptions of the candidate items." : ""}

Here is a list of candidate reports to check against (these are all '${candidates[0]?.type || ''}' reports):
${JSON.stringify(candidateSummaries)}

Analyze the reports, using both the text and the provided image of the source item, and return a JSON object containing only the IDs of the reports from the candidate list that are a strong potential match. Be very strict in your matching. Only include IDs with a high probability of being the same item.`;

        const textPart = { text: promptText };
        
        // FIX: The `parts` array was incorrectly typed as `never[]`.
        // It's now explicitly typed to accept both text and image parts.
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
