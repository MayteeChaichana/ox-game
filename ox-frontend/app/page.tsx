"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

// --- Helpers ---
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // แนวนอน
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // แนวตั้ง
  [0, 4, 8], [2, 4, 6]             // แนวทะแยง
];

function calculateWinner(squares: (string | null)[]) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default function Home() {
  const { data: session, status } = useSession();
  
  // Game States
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winStreak, setWinStreak] = useState(0);
  const [lastPoints, setLastPoints] = useState<number | null>(null);

  // Leaderboard & Pagination States
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- API Functions ---
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("http://localhost:3001/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const sendResult = async (result: 'WIN' | 'LOSS' | 'DRAW') => {
    if (!session?.user?.name) return;
    try {
      const response = await fetch("http://localhost:3001/game-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: session.user.name, result }),
      });
      const data = await response.json();
      setLastPoints(data.pointsAdded);
      setWinStreak(data.winStreak);
      fetchLeaderboard();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // --- Game Logic ---
  const makeBotMove = useCallback((currentBoard: (string | null)[]) => {
    const emptySquares = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);

    if (emptySquares.length > 0) {
      const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      const newBoard = [...currentBoard];
      newBoard[randomIndex] = "O";
      setBoard(newBoard);

      const winner = calculateWinner(newBoard);
      if (winner) sendResult("LOSS");
      else if (!newBoard.includes(null)) sendResult("DRAW");
      setIsXNext(true);
    }
  }, [session]);

  useEffect(() => {
    if (!isXNext && !calculateWinner(board) && board.includes(null)) {
      const timer = setTimeout(() => makeBotMove(board), 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, makeBotMove]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(leaderboard.length / itemsPerPage) || 1;
  const currentLeaderboardData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return leaderboard.slice(start, start + itemsPerPage);
  }, [leaderboard, currentPage]);

  const handleSquareClick = (index: number) => {
    if (board[index] || calculateWinner(board) || !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const winnerResult = calculateWinner(newBoard);
    if (winnerResult) {
      sendResult("WIN");
    } else if (!newBoard.includes(null)) {
      sendResult("DRAW");
    } else {
      setIsXNext(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setLastPoints(null);
  };

  const winner = calculateWinner(board);

  // --- Render Helpers ---
  if (status === "loading") return <div className="flex h-screen items-center justify-center font-black animate-pulse bg-white text-black">LOADING...</div>;

  if (!session) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <div className="border-8 border-black p-12 bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-6xl font-black mb-6 italic tracking-tighter text-black uppercase">OX GAME</h1>
        <button onClick={() => signIn("google")} className="w-full bg-black text-white px-10 py-5 font-black text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] hover:bg-white hover:text-black transition-all active:shadow-none">
          LOGIN WITH GOOGLE
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-white p-4 text-black font-sans">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-10 py-6 border-b-4 border-black">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">OX GAME</h1>
        <div className="flex items-center gap-4">
          <span className="font-black border-b-2 border-black text-lg lowercase">{session.user?.name}</span>
          <button onClick={() => signOut()} className="bg-red-600 text-white px-4 py-1 font-black text-xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Logout</button>
        </div>
      </div>

      {/* Streak Badge */}
      <div className="mb-6 bg-blue-100 border-2 border-black px-4 py-1 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        Win Streak: <span className="text-blue-700 text-xl">{winStreak}</span> / 3
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleSquareClick(i)} disabled={!isXNext || !!winner}
            className={`w-24 h-24 md:w-28 md:h-28 bg-white border-4 border-black text-5xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${!cell && isXNext && !winner ? 'hover:bg-gray-100' : ''}`}
          >
            <span className={cell === 'X' ? 'text-black' : 'text-blue-600'}>{cell}</span>
          </button>
        ))}
      </div>

      {/* Status Display */}
      <div className="h-20 flex items-center justify-center mb-4">
        {winner ? (
          <h2 className={`text-4xl font-black uppercase italic animate-bounce px-6 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${winner === 'X' ? 'bg-yellow-300' : 'bg-red-400'}`}>
            {winner === 'X' 
              ? `You Win! +${lastPoints ?? 1}${lastPoints === 2 ? ' (BONUS)' : ''}` 
              : `Bot Win! ${lastPoints ?? -1}`}
          </h2>
        ) : !board.includes(null) ? (
          <h2 className="text-3xl font-black uppercase italic text-gray-500">Draw Game</h2>
        ) : (
          <p className={`font-bold uppercase tracking-widest ${isXNext ? 'text-black' : 'text-blue-500 animate-pulse'}`}>
            {isXNext ? "Your Turn" : "Bot Thinking..."}
          </p>
        )}
      </div>

      <button onClick={resetGame} className="bg-black text-white px-12 py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-800 transition-all mb-16 active:translate-y-1 active:shadow-none">
        New Game
      </button>

      {/* Leaderboard Section */}
      <div className="w-full max-w-4xl border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-20">
        <div className="bg-black text-white p-4 text-center font-black uppercase italic tracking-widest text-2xl border-b-4 border-black">
          Global Player Scores
        </div>
        
        <div className="divide-y-2 divide-black min-h-[360px]">
          {currentLeaderboardData.map((player: any, i) => (
            <div key={i} className="grid grid-cols-12 items-center p-4 hover:bg-gray-50">
              <div className="col-span-2 font-black text-2xl text-gray-400">#{(currentPage - 1) * itemsPerPage + i + 1}</div>
              <div className="col-span-7 font-bold text-lg truncate lowercase italic">{player.username}</div>
              <div className="col-span-3 text-right font-black text-2xl">{player.totalScore} <span className="text-xs">PTS</span></div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-t-4 border-black">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="bg-black text-white px-4 py-2 font-black uppercase text-xs disabled:opacity-30 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            Prev
          </button>
          <span className="font-black text-sm uppercase tracking-tighter">Page {currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="bg-black text-white px-4 py-2 font-black uppercase text-xs disabled:opacity-30 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}