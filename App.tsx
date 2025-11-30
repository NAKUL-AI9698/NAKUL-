import React, { useState, useEffect } from 'react';
import { Player, WinInfo, AiHintResponse } from './types';
import { getAiHint } from './services/geminiService';

// --- Constants ---
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// --- Helper Functions ---
function calculateWinner(squares: Player[]): WinInfo | null {
  for (let i = 0; i < WINNING_LINES.length; i++) {
    const [a, b, c] = WINNING_LINES[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: WINNING_LINES[i] };
    }
  }
  return null;
}

// --- Components ---

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare, disabled }) => {
  const baseClasses = "h-20 w-20 sm:h-24 sm:w-24 border-2 flex items-center justify-center text-4xl sm:text-5xl font-bold transition-all duration-300 transform active:scale-95";
  const borderClass = "border-cyan-900/50 hover:border-cyan-500/80";
  
  let contentClasses = "";
  if (value === 'X') {
    contentClasses = "text-cyan-400 neon-text-blue";
  } else if (value === 'O') {
    contentClasses = "text-fuchsia-400 neon-text-pink";
  }

  const winningClasses = isWinningSquare 
    ? (value === 'X' ? "bg-cyan-900/30 neon-box-blue winning-line" : "bg-fuchsia-900/30 neon-box-pink winning-line") 
    : "bg-gray-900/50 hover:bg-gray-800/80";

  return (
    <button
      className={`${baseClasses} ${borderClass} ${winningClasses} rounded-lg backdrop-blur-sm`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={contentClasses}>{value}</span>
    </button>
  );
};

export default function App() {
  const [squares, setSquares] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [hint, setHint] = useState<AiHintResponse | null>(null);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  const winInfo = calculateWinner(squares);
  const winner = winInfo?.winner;
  const isDraw = !winner && squares.every((square) => square !== null);

  const currentPlayer: Player = xIsNext ? 'X' : 'O';

  // --- Handlers ---
  
  const handleClick = (i: number) => {
    if (squares[i] || winner) return;

    const nextSquares = squares.slice();
    nextSquares[i] = currentPlayer;
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    setHint(null); // Clear hint on move
  };

  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setHint(null);
  };

  const handleAiHint = async () => {
    if (winner || isDraw) return;
    
    setAiLoading(true);
    setHint(null);
    
    const suggestion = await getAiHint(squares, currentPlayer);
    
    setHint(suggestion);
    setAiLoading(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'NXT NAKUL Tic-Tac-Toe',
      text: 'Challenge me to a game of Neon Tic-Tac-Toe!',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // --- Render Helpers ---

  const renderSquare = (i: number) => {
    const isWinningSquare = winInfo?.line.includes(i) ?? false;
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => handleClick(i)}
        isWinningSquare={isWinningSquare}
        disabled={!!winner || (!!squares[i])}
      />
    );
  };

  const StatusMessage = () => {
    if (winner) {
      return (
        <div className="flex flex-col items-center animate-bounce">
          <span className={`text-4xl font-black tracking-wider ${winner === 'X' ? 'text-cyan-400 neon-text-blue' : 'text-fuchsia-400 neon-text-pink'}`}>
            PLAYER {winner} WINS!
          </span>
        </div>
      );
    }
    if (isDraw) {
      return <span className="text-3xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">DRAW!</span>;
    }
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-lg uppercase tracking-widest">Turn:</span>
        <span className={`text-4xl font-bold ${xIsNext ? 'text-cyan-400 neon-text-blue' : 'text-fuchsia-400 neon-text-pink'}`}>
          PLAYER {currentPlayer}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black p-4 selection:bg-cyan-500 selection:text-black">
      
      {/* Toast Notification */}
      {showCopied && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-fuchsia-600/90 text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(192,38,211,0.6)] z-50 animate-bounce font-bold tracking-widest backdrop-blur-md border border-white/20 whitespace-nowrap">
          LINK COPIED!
        </div>
      )}

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Branding */}
      <header className="mb-8 z-10 text-center relative group">
        <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.6)] tracking-tighter hover:scale-105 transition-transform duration-500 cursor-default">
          NXT NAKUL
        </h1>
        <p className="mt-2 text-cyan-200/60 tracking-[0.5em] text-sm sm:text-base font-bold uppercase drop-shadow-md">
          Cyberpunk Battle Arena
        </p>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 blur-sm group-hover:w-64 transition-all duration-700"></div>
      </header>

      {/* Game Board Area */}
      <main className="z-10 flex flex-col items-center gap-8 w-full max-w-lg">
        
        {/* Status Bar */}
        <div className="h-16 flex items-center justify-center w-full bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <StatusMessage />
        </div>

        {/* The Grid */}
        <div className="relative p-6 bg-gray-900/60 rounded-3xl border border-gray-800 shadow-2xl backdrop-blur-xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 rounded-3xl -z-10 blur-xl group-hover:opacity-75 transition-opacity duration-500"></div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {Array(9).fill(null).map((_, i) => renderSquare(i))}
          </div>
        </div>

        {/* AI Hint Section */}
        {hint && !winner && !isDraw && (
           <div className="w-full bg-black/60 border border-yellow-500/30 rounded-xl p-4 text-center animate-fadeIn shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-1">NXT AI Suggestion</p>
              <p className="text-gray-200 text-sm">
                Try cell <span className="font-bold text-white">{hint.suggestedIndex + 1}</span>: "{hint.reasoning}"
              </p>
           </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
           <button
            onClick={handleReset}
            className="flex-1 py-4 px-4 rounded-xl font-bold uppercase tracking-wider text-white bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-gray-600 shadow-lg active:scale-95 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-4 px-4 rounded-xl font-bold uppercase tracking-wider text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 border border-fuchsia-500/50 shadow-lg active:scale-95 transition-all shadow-[0_0_10px_rgba(192,38,211,0.3)] hover:shadow-[0_0_20px_rgba(192,38,211,0.5)] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          
          <button
            onClick={handleAiHint}
            disabled={aiLoading || !!winner || isDraw}
            className={`flex-1 py-4 px-4 rounded-xl font-bold uppercase tracking-wider text-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2
              ${aiLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] border border-cyan-300'
              }`}
          >
            {aiLoading ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : (
              <>
                <span>Ask AI</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </>
            )}
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 text-gray-500 text-xs font-mono tracking-widest z-0">
        POWERED BY REACT & GEMINI • NXT NAKUL SYSTEMS
      </footer>
    </div>
  );
}