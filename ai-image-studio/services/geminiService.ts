
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AspectRatio } from '../types';
import { imageUtils } from './imageUtils';

// This is a placeholder for the actual SDK. 
// In a real environment, this would be imported from the @google/genai package.
// For this example, we assume GoogleGenAI is available on the window.
// @ts-ignore
const gemini = window.GoogleGenAI;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const HARDCODED_INSTRUCTION = "ultra-realistic, photorealistic photo, 8k, sharp focus, high-resolution, shot on a DSLR camera with a 50mm lens. Strictly no unrealistic image.";

export const geminiService = {
  generateImages: async (prompt: string, negativePrompt: string, aspectRatio: AspectRatio, numberOfImages = 4) => {
    const fullPrompt = `${HARDCODED_INSTRUCTION} ${prompt}. Avoid the following: ${negativePrompt}`;
    
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: {
          numberOfImages: numberOfImages,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
      }
      return [];
    } catch (error) {
      console.error("Gemini Image Generation Error:", error);
      throw new Error("Failed to generate images. Please check the console for details.");
    }
  },

  analyzeImage: async (file: File): Promise<string> => {
    const base64ImageData = await imageUtils.fileToB64(file);
    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: base64ImageData,
      },
    };
    const textPart = {
      text: "You are an expert art director. Describe this image in a single, detailed sentence that can be used as a prompt for an AI image generator. The description must be for a photorealistic photograph, capturing the subject, action, and style of the image. Be purely descriptive. Do not add any conversational text or markdown formatting."
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
    });
    return response.text;
  },

  generateCreativePrompt: async (): Promise<string> => {
    const prompt = "You are a creative director who specializes in photorealistic images of men with well defined, powerful and muscular physiques. Generate a single, compelling sentence to be used as a prompt for an AI image generator. The prompt must describe a scene involving at least two men that will result in a photorealistic photograph, including the subjects, their actions, and the overall style. Focus on dynamic, powerful or intimate concepts. Do not use markdown or add conversational text";

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  },

  enhanceImage: async (base64ImageDataUrl: string, originalPrompt: string, aspectRatio: AspectRatio, negativePrompt: string) => {
    const base64Data = imageUtils.dataUrlToB64(base64ImageDataUrl);
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    };

    const textPart1 = { text: "You are a creative director who expertises in photorealistic images. Your task is to enhance the user's prompt to be more detailed and evocative without altering the subject(s) in the image. Enhance the user's prompt based on these categories: (1)Define the Core Style and Medium, (2)Describe the Subject(s) and Action, (3)Set the Composition and Framing, (4)Establish the Lighting and (5)Atmosphere and Detail the Environment and Setting. Your goal is to produce a more photorealistic result. Be purely descriptive. Do not add any conversational text or markdown formatting." };
    const textPart2 = { text: `\n\nOriginal user prompt: "${originalPrompt}"`};
    
    const descriptionResponse: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart1, imagePart, textPart2]},
    });
    
    const detailedPrompt = descriptionResponse.text;

    if (!detailedPrompt) {
      throw new Error("Could not generate a description for enhancement.");
    }

    const generatedImages = await geminiService.generateImages(detailedPrompt, negativePrompt, aspectRatio, 1);

    return { images: generatedImages, newPrompt: detailedPrompt };
  },
};
