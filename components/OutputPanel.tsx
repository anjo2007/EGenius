import React, { useState, useEffect } from 'react';
import { Loader } from './Loader';
import { Solution, OutputView } from '../types';

interface OutputPanelProps {
  isLoading: boolean;
  error: string | null;
  solution: Solution | null;
}

const WelcomeIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-24 w-24 text-cyan-400/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7V17L12 22L22 17V7L12 2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 7L12 12L22 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 4.5L7 9.5" opacity="0.7"/>
        <path d="M5.5 15.5L12 12L18.5 15.5" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <path d="M12 2v20" stroke="url(#glow-grad)" strokeWidth="1.5" />
        <defs>
            <linearGradient id="glow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 246, 255, 0)" />
                <stop offset="50%" stopColor="rgba(0, 246, 255, 1)" />
                <stop offset="100%" stopColor="rgba(0, 246, 255, 0)" />
            </linearGradient>
        </defs>
    </svg>
);

const getYouTubeEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    let videoId;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        const match = url.match(/(?:v=|\/|embed\/|watch\?v=)([0-9A-Za-z_-]{11})/);
        videoId = match ? match[1] : null;
    }
    
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
}

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);


export const OutputPanel: React.FC<OutputPanelProps> = ({ isLoading, error, solution }) => {
  const [activeView, setActiveView] = useState<Omit<OutputView, 'algorithm'>>('drawing');
  const [currentStep, setCurrentStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Reset states when a new solution arrives
  useEffect(() => {
    if (solution) {
      setCurrentStep(0);
      setActiveView('drawing');
    }
  }, [solution]);

  // Effect for highlighting SVG elements
  useEffect(() => {
    if (!solution?.drawingSvg || activeView !== 'drawing') return;
  
    const svgContainer = document.getElementById('svg-container');
    if (!svgContainer) return;
  
    // Determine which step to highlight (hover takes precedence)
    const stepToHighlight = hoveredStep !== null ? hoveredStep : currentStep;
  
    // Clear previous highlights
    const highlightedElements = svgContainer.querySelectorAll('.highlight-step');
    highlightedElements.forEach(el => el.classList.remove('highlight-step'));
  
    // Apply new highlight
    const elementToHighlight = svgContainer.querySelector(`#step-${stepToHighlight + 1}`);
    if (elementToHighlight) {
      elementToHighlight.classList.add('highlight-step');
    }
  
  }, [currentStep, hoveredStep, solution, activeView]);

  const handleDownloadSvg = () => {
    if (solution?.drawingSvg) {
      const svgBlob = new Blob([solution.drawingSvg], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'egenius-drawing.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader message="Generating your multi-format solution..." />;
    }

    if (error) {
      return (
        <div className="p-8 text-center text-red-400">
          <h3 className="text-xl font-semibold mb-2 glow-text" style={{color: '#ff4d4d', textShadow: '0 0 5px #ff4d4d'}}>An Error Occurred</h3>
          <p className="bg-red-900/50 p-4 rounded-md text-sm border border-red-500/30">{error}</p>
        </div>
      );
    }

    if (solution) {
      const embedUrl = getYouTubeEmbedUrl(solution.youtubeUrl);
      const VisualTabButton: React.FC<{ view: 'drawing' | 'video'; label: string, disabled?: boolean }> = ({ view, label, disabled = false }) => (
        <button
          type="button"
          onClick={() => !disabled && setActiveView(view)}
          disabled={disabled}
          className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:text-gray-600 disabled:cursor-not-allowed ${
            activeView === view
              ? 'bg-cyan-400/20 text-cyan-300 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:bg-cyan-400/10 hover:text-cyan-400'
          }`}
        >
          {label}
        </button>
      );

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 md:p-6">
          {/* Left Column: Algorithm */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-cyan-300 pb-2 mb-4 glow-text tracking-wider border-b border-cyan-500/20">
              Step-by-Step Algorithm
            </h2>
            <div className="space-y-2 flex-grow overflow-y-auto pr-2">
              {solution.explanation.map((step, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => setCurrentStep(index)}
                  className={`p-3 rounded-lg border-l-4 transition-all duration-200 cursor-pointer ${
                    currentStep === index
                      ? 'bg-cyan-400/20 border-cyan-400'
                      : 'bg-black/20 border-transparent hover:bg-cyan-400/10'
                  }`}
                >
                  <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
            {solution.explanation.length > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-cyan-500/20">
                <button
                  onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                  className="bg-cyan-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Prev
                </button>
                <span className="text-sm font-mono text-cyan-300">
                  Step {currentStep + 1} / {solution.explanation.length}
                </span>
                <button
                  onClick={() => setCurrentStep(s => Math.min(solution.explanation.length - 1, s + 1))}
                  disabled={currentStep === solution.explanation.length - 1}
                  className="bg-cyan-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          
          {/* Right Column: Visuals */}
          <div>
            <div className="flex border-b border-cyan-400/30">
              <VisualTabButton view="drawing" label="Drawing" disabled={!solution.drawingSvg} />
              <VisualTabButton view="video" label="Video Tutorial" disabled={!embedUrl} />
            </div>

            <div className="mt-6 min-h-[24rem]">
              {activeView === 'video' && embedUrl && (
                <div>
                  <h2 className="text-xl font-bold text-cyan-300 pb-2 mb-4 glow-text tracking-wider">Recommended Tutorial</h2>
                  <div className="aspect-w-16 aspect-h-9 bg-black/50 rounded-lg overflow-hidden border border-cyan-400/20">
                    <iframe src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full aspect-video"></iframe>
                  </div>
                </div>
              )}
              {activeView === 'drawing' && solution.drawingSvg && (
                <div>
                  <div className="flex justify-between items-center pb-2 mb-4">
                    <h2 className="text-xl font-bold text-cyan-300 glow-text tracking-wider">Solution Drawing</h2>
                    <button onClick={handleDownloadSvg} className="flex items-center bg-cyan-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500/50 transition-colors duration-300 text-xs uppercase tracking-wider border border-cyan-400/30">
                      <DownloadIcon />
                      SVG
                    </button>
                  </div>
                  <div id="svg-container" className="p-2 bg-white rounded-lg flex justify-center items-center border border-cyan-400/20">
                    <div className="w-full h-auto" dangerouslySetInnerHTML={{ __html: solution.drawingSvg }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full text-gray-500 min-h-[20rem]">
        <WelcomeIcon />
        <h3 className="text-xl font-medium text-gray-400 glow-text">Your interactive solution will appear here</h3>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Enter the problem details, click "Solve Problem," and get ready for a step-by-step, interactive breakdown.
        </p>
      </div>
    );
  };

  return (
    <div className="glassmorphic rounded-xl shadow-2xl mt-8">
      {renderContent()}
    </div>
  );
};