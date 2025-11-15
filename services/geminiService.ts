import { GoogleGenAI, Part, Type } from "@google/genai";
import { Solution } from "../types";

// Helper function to convert a File object to a base64 string for the Gemini API.
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      resolve(base64Data);
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Calls the Gemini API to solve an engineering graphics problem using a robust JSON-based approach.
 * @param problemText The text description of the problem.
 * @param problemImage The image file of the problem.
 * @returns A promise that resolves to a Solution object.
 */
export const solveProblem = async (problemText: string, problemImage: File | null): Promise<Solution> => {
  // Use gemini-2.5-flash for faster response times.
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `You are E-Genius, an expert AI assistant specializing in solving Engineering Graphics problems for the KTU (B.Tech) syllabus. Your goal is to provide a highly accurate, educational, and interactive solution as quickly as possible. Your response MUST be a single, valid JSON object that strictly conforms to the provided schema.

1.  **explanation**:
    *   Provide a detailed, step-by-step algorithm for constructing the solution.
    *   Return this as a JSON array of strings, where each string is a distinct, numbered step.
    *   Example: ["1. Draw the XY line.", "2. Mark point A 10mm above HP...", "3. Project the top view a' onto the XY line..."]
    *   The language must be clear, concise, and follow standard engineering terminology.

2.  **drawingSvg**:
    *   Generate a single, valid, self-contained SVG string representing the final drawing.
    *   **CRITICAL: ACCURACY IS THE TOP PRIORITY.** Before generating the SVG, perform all geometric calculations with high precision. Double-check every length, angle, and projection to ensure they perfectly match the problem statement. The final drawing must be a geometrically perfect representation of the solution.
    *   **Adhere to standards.** Use correct line weights and styles as per BIS/KTU conventions:
        - Final objects/outlines: Dark, thick, continuous lines.
        - Projection lines & Dimension lines: Lighter, thinner, continuous lines.
        - Construction lines: Faint, continuous lines.
        - Hidden edges: Dashed lines.
    *   **Label everything meticulously.** All significant points, lines, and dimensions must be clearly and correctly labeled (e.g., A, B, a, b, a', b', HP, VP, XY). Dimensioning should be clear and follow standards.
    *   **Interactive IDs:** For each step in the \`explanation\` array, add a corresponding unique \`id\` to the main SVG element(s) (e.g., a \`<g>\` group or a specific \`<path>\`) created in that step. The ID must follow the format \`step-N\`, where N is the 1-based index of the explanation step. For example, the SVG elements for "1. Draw the XY line." should be grouped and given \`id="step-1"\`. This is essential for interactivity.
    *   The SVG \`viewBox\` must be calculated to tightly contain the entire drawing with a small, consistent padding (e.g., 10-20 units). The SVG should not have excessive empty space. Set a transparent or white background.

3.  **youtubeUrl**:
    *   First, analyze the problem to identify its core engineering graphics concept (e.g., 'projection of solids', 'isometric projection', 'development of surfaces').
    *   Construct a targeted YouTube search query using this concept.
    *   **Prioritize searching within the 'engg tutor' channel (https://www.youtube.com/@enggtutor0786/)**. For example, search for "projection of lines engg tutor".
    *   Return the single most relevant and high-quality tutorial video URL. If no suitable video exists on the preferred channel, you may then search reputable public channels.
    *   The video's content must directly match the problem's concept.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      explanation: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of strings, where each string is a step in the algorithm.",
      },
      drawingSvg: {
        type: Type.STRING,
        description: "A valid, self-contained SVG string of the final drawing.",
      },
      youtubeUrl: {
        type: Type.STRING,
        description: "A relevant YouTube tutorial URL.",
      },
    },
    required: ["explanation", "drawingSvg", "youtubeUrl"],
  };

  const parts: Part[] = [];

  if (problemText) {
    parts.push({ text: `Solve the following engineering graphics problem:\n\n${problemText}` });
  }

  if (problemImage) {
    const imagePart = await fileToGenerativePart(problemImage);
    parts.push(imagePart);
  }

  if (parts.length === 0) {
    throw new Error("No problem provided. Please enter text or upload an image.");
  }
  
  let responseText = '';
  try {
    const result = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });
    
    responseText = result.text.trim();
    const parsedSolution: { explanation: string[]; drawingSvg: string; youtubeUrl: string; } = JSON.parse(responseText);

    return {
      explanation: parsedSolution.explanation && parsedSolution.explanation.length > 0 ? parsedSolution.explanation : ["No explanation provided."],
      drawingSvg: parsedSolution.drawingSvg || null,
      youtubeUrl: parsedSolution.youtubeUrl || null,
    };

  } catch (error) {
    console.error("Error processing Gemini response:", error);
    if (error instanceof SyntaxError) { // JSON.parse throws SyntaxError
        console.error("Malformed JSON received:", responseText);
        throw new Error(`The AI returned an invalid response structure. This can happen with complex problems. Please try again or rephrase your query.`);
    }
    if (error instanceof Error) {
        throw new Error(`Failed to get solution from Gemini: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
};