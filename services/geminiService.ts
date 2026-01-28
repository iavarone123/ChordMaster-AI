import { GoogleGenAI, Type } from "@google/genai";
import { Progression, ChordSlot, FretValue } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProgression = async (mood: string, key: string = 'C', scale: string = 'Major'): Promise<Progression> => {
  const prompt = `Generate a creative guitar chord progression.
Key: ${key}
Scale: ${scale}
Mood: ${mood}
Count: 4-6 chords

For each chord, provide 3 variations: open/low, mid-neck, and high-neck.
Return a valid JSON object matching the requested schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
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

  const text = response.text;
  if (!text) throw new Error("Empty response from AI service.");
  
  const data = JSON.parse(text);
  
  const sanitizedSlots: ChordSlot[] = (data.chordSlots || []).map((slot: any) => ({
    name: slot.name,
    voicings: (slot.voicings || []).map((v: any) => ({
      name: v.name || slot.name,
      frets: (v.frets || []).map((f: any): FretValue => {
        const str = String(f).toLowerCase();
        return str === 'x' ? 'x' : parseInt(str) || 0;
      }),
      fingers: v.fingers?.map((f: any) => {
        const str = String(f).toLowerCase();
        return (str === 'null' || str === 'none' || !str) ? null : parseInt(str);
      }) || null,
      baseFret: v.baseFret || 1
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Provide 3 distinct guitar chord voicings for: ${chordName}. Position 1 (low), 2 (mid), 3 (high).` }] }],
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

  const text = response.text;
  if (!text) throw new Error("Empty response from AI service.");
  const data = JSON.parse(text);
  
  return {
    name: data.name || chordName,
    voicings: (data.voicings || []).map((v: any) => ({
      name: v.name || data.name || chordName,
      frets: (v.frets || []).map((f: any): FretValue => {
        const str = String(f).toLowerCase();
        return str === 'x' ? 'x' : parseInt(str) || 0;
      }),
      fingers: v.fingers?.map((f: any) => {
        const str = String(f).toLowerCase();
        return (str === 'null' || str === 'none' || !str) ? null : parseInt(str);
      }) || null,
      baseFret: v.baseFret || 1
    }))
  };
};