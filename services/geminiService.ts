
import { GoogleGenAI, Type } from "@google/genai";
import { type TableData } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const extractTableFromImage = async (imageFile: File): Promise<TableData> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY ortam değişkeni yapılandırılmamış.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const base64Image = await fileToBase64(imageFile);

    const imagePart = {
        inlineData: {
            mimeType: imageFile.type,
            data: base64Image,
        },
    };

    const textPart = {
        text: `Analyze the image and extract all tabular data.
        Respond with ONLY a valid JSON object that is an array of arrays.
        Each inner array should represent a row in the table.
        Each element in the inner array should be a string representing a cell's content.
        Do not include headers if they are just merged cells or part of the image's title. Capture the actual data rows.
        Do not include any markdown formatting or any other text in your response. Just the JSON.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (Array.isArray(parsedData) && parsedData.every(row => Array.isArray(row))) {
            return parsedData as TableData;
        } else {
            throw new Error("Yapay zeka yanıtı beklenen formatta (dizi içinde diziler) değildi.");
        }

    } catch (error) {
        console.error("Gemini API çağrılırken hata oluştu:", error);
        if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API key is invalid'))) {
             throw new Error("Yapılandırılmış API anahtarı geçersiz. Lütfen dağıtım ayarlarınızı kontrol edin.");
        }
        throw new Error("Görüntüden veri çıkarılamadı. Yapay zeka modeli işlemekte zorlanmış olabilir veya API anahtarınızda bir sorun olabilir.");
    }
};
