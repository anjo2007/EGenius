import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { solveProblem } from './services/geminiService';
import { Solution } from './types';

const App: React.FC = () => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async (text: string, image: File | null) => {
    setIsLoading(true);
    setError(null);
    setSolution(null);
    try {
      const result = await solveProblem(text, image);
      setSolution(result);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-cyan-300/80 mb-6 text-lg tracking-wide">
            Stuck on an Engineering Graphics problem? Provide the details below and let E-Genius generate a complete step-by-step solution for you.
          </p>
          <p className="text-center text-amber-400/80 text-xs mb-6 p-2 bg-amber-900/20 rounded-md border border-amber-500/30">
            Optimized for faster solutions! Please verify the accuracy of all generated drawings and steps.
          </p>
          <InputPanel isLoading={isLoading} onSubmit={handleSolve} />
          <OutputPanel isLoading={isLoading} error={error} solution={solution} />
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-cyan-400/40 tracking-widest">
        <p>&copy; {new Date().getFullYear()} E-Genius. Created by ANJO MJ, Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;