// Defines the possible input methods for the user.
export type InputMode = 'text' | 'image';

// Defines the views for the new tabbed output panel.
export type OutputView = 'algorithm' | 'video' | 'drawing';

// Defines the structure for the solution returned by the Gemini API.
export interface Solution {
  explanation: string[];
  drawingSvg: string | null;
  youtubeUrl: string | null;
}