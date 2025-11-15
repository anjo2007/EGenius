import React, { useState, useRef } from 'react';
import { InputMode } from '../types';

interface InputPanelProps {
  isLoading: boolean;
  onSubmit: (text: string, image: File | null) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const InputPanel: React.FC<InputPanelProps> = ({ isLoading, onSubmit }) => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [problemText, setProblemText] = useState('');
  const [problemImage, setProblemImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProblemImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText && !problemImage) {
      alert("Please provide problem details via text or image.");
      return;
    }
    onSubmit(problemText, problemImage);
  };

  const TabButton: React.FC<{ mode: InputMode; label: string }> = ({ mode, label }) => (
    <button
      type="button"
      onClick={() => setInputMode(mode)}
      className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
        inputMode === mode
          ? 'bg-cyan-400/20 text-cyan-300 border-b-2 border-cyan-400'
          : 'text-gray-400 hover:bg-cyan-400/10 hover:text-cyan-400'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="glassmorphic rounded-xl shadow-2xl overflow-hidden">
      <form onSubmit={handleSubmit}>
        <div className="flex">
          <TabButton mode="text" label="Text Input" />
          <TabButton mode="image" label="Image Upload" />
        </div>

        <div className="p-6">
          {inputMode === 'text' && (
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="E.g., A line AB 80mm long is inclined at 45° to HP and 30° to VP..."
              className="w-full h-48 p-4 bg-black/30 border border-cyan-400/20 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              disabled={isLoading}
            />
          )}

          {inputMode === 'image' && (
            <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 p-4 bg-black/30 border-2 border-dashed border-cyan-400/30 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-cyan-400/80 hover:bg-cyan-400/5 transition"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              {imagePreview ? (
                <img src={imagePreview} alt="Problem preview" className="max-h-full max-w-full object-contain rounded-md" />
              ) : (
                <div className="text-center text-gray-500">
                  <UploadIcon />
                  <p className="mt-2 font-semibold">Click to upload</p>
                  <p className="text-xs">PNG, JPG, etc.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 pt-0">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center uppercase tracking-widest transform hover:scale-105 shadow-[0_0_15px_rgba(0,246,255,0.5)] hover:shadow-[0_0_25px_rgba(0,246,255,0.8)]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Solution...
              </>
            ) : (
              'Solve Problem'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};