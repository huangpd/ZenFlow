
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  // Always use process.env.API_KEY directly for initialization
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async getSutraInsight(sutraContent: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `请用通俗易懂且富有禅意的现代语言，解析以下经文片段，并给修行者一个生活中的建议：${sutraContent}`,
      config: {
        systemInstruction: "你是一位智慧、慈悲的禅修老师，说话简洁、深刻且温和。尽量使用温暖而有力量的现代中文。",
        temperature: 0.7,
      },
    });
    // Correctly accessing .text property
    return response.text || "禅意深远，此时无声胜有声。";
  }

  static async getDailyGuidance(meditationMins: number, tasksCount: number): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `我今天坐禅了${meditationMins}分钟，完成了${tasksCount}项功课。请给我一个今天的修行寄语。`,
      config: {
        systemInstruction: "你是一位鼓励修行者的向导。用简短、优美、充满阳光的话语给予指引。",
      },
    });
    // Correctly accessing .text property
    return response.text || "精进修行，功不唐捐。";
  }

  static async generateZenImage(description: string): Promise<string | null> {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `A minimalist traditional Chinese ink wash painting representing zen tranquility and the following feeling: ${description}. Soft brushstrokes, serene composition, professional art gallery quality.` }
          ]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      // Find the image part by iterating through parts as per guidelines
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (error) {
      console.error("Image generation error:", error);
    }
    return null;
  }
}