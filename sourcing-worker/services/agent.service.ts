import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import { Mistral as MistralAI } from "@mistralai/mistralai";

export type AIModelType = "fast" | "advanced" | "logic" | "vision";

export interface AgentConfig {
  geminiKey?: string;
  groqKey?: string;
  cerebrasKey?: string;
  mistralKey?: string;
}

export class AgentService {
  private gemini: GoogleGenerativeAI | null = null;
  private groq: OpenAI | null = null;
  private cerebras: OpenAI | null = null;
  private mistral: MistralAI | null = null;

  constructor(config: AgentConfig) {
    if (config.geminiKey) {
      this.gemini = new GoogleGenerativeAI(config.geminiKey.trim());
    }
    
    if (config.groqKey) {
      this.groq = new OpenAI({
        apiKey: config.groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
    }

    if (config.cerebrasKey) {
      this.cerebras = new OpenAI({
        apiKey: config.cerebrasKey,
        baseURL: "https://api.cerebras.ai/v1",
      });
    }

    if (config.mistralKey) {
      this.mistral = new MistralAI({
        apiKey: config.mistralKey,
      });
    }
  }

  async execute(task: string, context: any, type: AIModelType = "fast"): Promise<string> {
    switch (type) {
      case "fast":
        return this.useGroq(task, context); 
      case "advanced":
        return this.useMistral(task, context); 
      case "logic":
        return this.useMistral(task, context); 
      case "vision":
        return this.useMistral(task, context); 
      default:
        return this.useGroq(task, context);
    }
  }

  private async useGeminiFlash(task: string, context: any): Promise<string> {
    if (!this.gemini) throw new Error("Gemini not configured");
    const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Task: ${task}\nContext: ${JSON.stringify(context)}`);
    return result.response.text();
  }

  private async useGeminiPro(task: string, context: any): Promise<string> {
    if (!this.gemini) throw new Error("Gemini not configured");
    const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(`Deep Reasoning Task: ${task}\nContext: ${JSON.stringify(context)}`);
    return result.response.text();
  }

  private async useGroq(task: string, context: any): Promise<string> {
    if (!this.groq) throw new Error("Groq not configured");
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: `Fast Task: ${task}\nContext: ${JSON.stringify(context)}` }],
      model: "llama-3.3-70b-versatile",
    });
    return completion.choices[0].message.content || "";
  }

  private async useMistral(task: string, context: any): Promise<string> {
    try {
      if (!this.mistral) throw new Error("Mistral not configured");
      const result = await this.mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: `Logic Task: ${task}\nContext: ${JSON.stringify(context)}` }],
      });
      return (result.choices?.[0]?.message?.content as string) || "";
    } catch (error) {
       console.error("[AgentService] Mistral failed or absent, falling back to Cerebras/Groq", error);
       try {
         return await this.useCerebras(task, context);
       } catch (cerebrasError) {
         console.error("[AgentService] Cerebras failed, falling back to Groq", cerebrasError);
         return this.useGroq(task, context);
       }
    }
  }

  async useCerebras(task: string, context: any): Promise<string> {
    if (!this.cerebras) throw new Error("Cerebras not configured");
    const completion = await this.cerebras.chat.completions.create({
      messages: [{ role: "user", content: `Rapid Classification: ${task}\nContext: ${JSON.stringify(context)}` }],
      model: "llama3.1-8b",
    });
    return completion.choices[0].message.content || "";
  }
}
