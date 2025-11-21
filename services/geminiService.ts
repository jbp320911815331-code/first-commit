import { GoogleGenAI, Type } from "@google/genai";
import { RadioStation } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateStationInsight = async (station: RadioStation): Promise<{ locationContext: string; musicVibe: string }> => {
  if (!apiKey) {
    return {
      locationContext: "API Key missing.",
      musicVibe: "Please configure Gemini API Key."
    };
  }

  const prompt = `
    Analyze this radio station:
    Name: ${station.name}
    Location: ${station.state}, ${station.country}
    Tags: ${station.tags}
    Language: ${station.language}

    Provide a short, engaging 2-sentence summary about the culture/vibe of this geographical location, and 1 sentence describing the likely music style based on the tags.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            locationContext: { type: Type.STRING },
            musicVibe: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      locationContext: "Could not retrieve cultural insights at this time.",
      musicVibe: "Enjoy the music!"
    };
  }
};
