import { useState } from "react";
import type { ReactNode } from "react";

const TURNS = {
  X: 'x',
  O: 'o'
} as const;

type turnType = typeof TURNS[keyof typeof TURNS];

const matrizSize = 5;
const nForWin = 3;

type squareType = {
  children: ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const Square = ({ children, isSelected, onClick }: squareType) => {
  const className = `square ${isSelected ? 'is-selected' : ""}`;

  return (
    <div onClick={onClick} className={className}>
      {children}
    </div>
  );
};

// Lógica para determinar ganador usando directamente la matriz
const checkWinner = (board: (turnType | null)[][], n: number, nForWin: number) => {
  const directions = [
    [0, 1],   // Horizontal hacia la derecha
    [1, 0],   // Vertical hacia abajo
    [1, 1],   // Diagonal hacia abajo a la derecha
    [1, -1]   // Diagonal hacia abajo a la izquierda
  ];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cell = board[r][c];

      // Si la celda está vacía, saltamos
      if (!cell) continue;

      for (const [dr, dc] of directions) {
        let count = 1;

        for (let step = 1; step < nForWin; step++) {
          const nextR = r + dr * step;
          const nextC = c + dc * step;

          // Verificamos los límites de la matriz directamente
          if (nextR < 0 || nextR >= n || nextC < 0 || nextC >= n) break;

          // Acceso directo con coordenadas 2D
          if (board[nextR][nextC] === cell) {
            count++;
          } else {
            break; 
          }
        }

        if (count === nForWin) {
          return cell;
        }
      }
    }
  }

  return null;
};

// Función auxiliar para crear la matriz inicial vacía
const createEmptyBoard = () => {
  return Array(matrizSize).fill(null).map(() => Array(matrizSize).fill(null));
};

function App() {
  // El estado ahora es explícitamente una matriz: (turnType | null)[][]
  const [board, setBoard] = useState<(turnType | null)[][]>(createEmptyBoard());
  const [turn, setTurn] = useState<turnType>(TURNS.X);

  const winner = checkWinner(board, matrizSize, nForWin);
  
  // Verificamos el empate comprobando que ninguna fila contenga un 'null'
  const isDraw = !winner && board.every((row) => row.every((cell) => cell !== null));

  const updateBoard = (rowIndex: number, colIndex: number) => {
    // 1. Evitamos sobreescribir o jugar si ya hay ganador
    if (board[rowIndex][colIndex] || winner) return;

    // 2. Copiamos la matriz (Deep Copy de 1 nivel) para no mutar el estado
    const newBoard = board.map(row => [...row]);
    
    // 3. Actualizamos la celda específica
    newBoard[rowIndex][colIndex] = turn;
    setBoard(newBoard);

    // 4. Cambiamos de turno
    setTurn(turn === TURNS.X ? TURNS.O : TURNS.X);
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setTurn(TURNS.X);
  };

  const winnerText = winner 
    ? `Ganador: ${winner.toUpperCase()}` 
    : isDraw 
      ? "Empate - No hubo ganadores" 
      : "En juego...";

  return (
    <main className="board">
      <h1>Tic Tac Toe</h1>
      <section 
        className="game" 
        style={{ '--matrix-size': matrizSize } as React.CSSProperties} 
      >
        {/* Usamos un doble .map para iterar filas y columnas */}
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              onClick={() => updateBoard(rowIndex, colIndex)}
            >
              {cell}
            </Square>
          ))
        ))}
      </section>
      
      <section className="turn">
        <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
        <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
      </section>
      
      <h1>{winnerText}</h1>
      
      {(winner || isDraw) && (
        <button onClick={resetGame}>Reiniciar</button>
      )}
    </main>
  );
}

export default App;