import { GoogleGenAI, Type } from "@google/genai";
import { Progression, ChordSlot, FretValue } from "../types";

// Helper to get AI instance safely
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProgression = async (mood: string, key: string = 'C', scale: string = 'Major'): Promise<Progression> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a guitar chord progression in the key of ${key} ${scale} scale with a ${mood} mood. Include 4-6 chords. 
    IMPORTANT: For EVERY chord in the progression, provide 3 different voicing variations.
    Give each voicing a descriptive name that explains the shape (e.g., "C Major - Open Position", "C Major - 3rd Fret Barre", "C Major - 8th Fret Triad").
    Return the response in the specified JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          key: { type: Type.STRING },
          scale: { type: Type.STRING },
          mood: { type: Type.STRING },
          chordSlots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                voicings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      frets: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      baseFret: { type: Type.NUMBER },
                      fingers: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                      }
                    },
                    required: ["name", "frets"]
                  }
                }
              },
              required: ["name", "voicings"]
            }
          }
        },
        required: ["title", "description", "chordSlots", "key", "mood"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  
  const sanitizedSlots: ChordSlot[] = (data.chordSlots || []).map((slot: any) => ({
    name: slot.name,
    voicings: (slot.voicings || []).map((v: any) => ({
      ...v,
      frets: v.frets.map((f: string): FretValue => {
        const cleaned = String(f).toLowerCase();
        return cleaned === 'x' ? 'x' : parseInt(cleaned);
      }),
      fingers: v.fingers?.map((f: string) => {
        const cleaned = String(f).toLowerCase();
        return (cleaned === 'null' || !cleaned || cleaned === 'none') ? null : parseInt(cleaned);
      }) || null
    }))
  }));

  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    chordSlots: sanitizedSlots,
    key: data.key || key,
    mood: data.mood || mood
  };
};

export const fetchChordByName = async (chordName: string): Promise<ChordSlot> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide 3 distinct guitar chord voicings for: ${chordName}. 
    1. A low position (open or nut)
    2. A middle position (frets 3-7)
    3. A high position (frets 8-12)
    Give each voicing a descriptive name including its position.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          voicings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                frets: { type: Type.ARRAY, items: { type: Type.STRING } },
                baseFret: { type: Type.NUMBER },
                fingers: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "frets"]
            }
          }
        },
        required: ["name", "voicings"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    name: data.name || chordName,
    voicings: (data.voicings || []).map((v: any) => ({
      ...v,
      frets: v.frets.map((f: string): FretValue => {
        const cleaned = String(f).toLowerCase();
        return cleaned === 'x' ? 'x' : parseInt(cleaned);
      }),
      fingers: v.fingers?.map((f: string) => {
        const cleaned = String(f).toLowerCase();
        return (cleaned === 'null' || !cleaned || cleaned === 'none') ? null : parseInt(cleaned);
      }) || null
    }))
  };
};