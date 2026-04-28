import { useState } from "react";
import type { ReactNode } from "react";

const TURNS = {
  X : 'x',
  O : 'o'
} as const;

//type turnType = typeof TURNS[keyof typeof TURNS];
type turnType = "x" | "o";

const matrizSize = 3;

type squareType = {
  children: ReactNode,
  isSelected?: boolean,
  updateBoard?: (index:number) => void,
  index?: number
}

const Square = ({ children, isSelected, updateBoard, index}: squareType) =>{
    const className = `square ${ isSelected? 'is-selected': "" }`

    const handleClick = () =>{
      if (updateBoard && index !== undefined) {
      updateBoard(index);
    }
    };
    return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
    );
};


//Logica para determinar ganador

const checkWinnerOptimized = (board: (turnType | null)[]) => {
  const n = matrizSize; // Tamaño del tablero
  const rows = [0, 0, 0];
  const cols = [0, 0, 0];
  let diag1 = 0;
  let diag2 = 0;

  for (let i = 0; i < board.length; i++) {
    const cell = board[i];
    if (!cell) continue;

    // Convertimos el índice plano (0-8) a coordenadas (fila, columna)
    const row = Math.floor(i / n);
    const col = i % n;
    
    // Asignamos valor: X = 1, O = -1
    const value = cell === 'x' ? 1 : -1;

    rows[row] += value;
    cols[col] += value;
    
    if (row === col) diag1 += value;
    if (row + col === n - 1) diag2 += value;

    // Si algún contador llega a 3 o -3, hay ganador
    if (
      Math.abs(rows[row]) === n ||
      Math.abs(cols[col]) === n ||
      Math.abs(diag1) === n ||
      Math.abs(diag2) === n
    ) {
      return cell; // Retorna 'x' o 'o'
    }
  }

  return null;
};

function App(){
  const [board, setBoard] = useState<(turnType | null)[]>(
    Array(matrizSize**2).fill(null)
  )
  const [turn, setTurn] = useState<turnType>(TURNS.X)

  const [winner, setWinner] = useState<boolean | null>(null) // null no hay ganador, false empate
  const [whoWin, setWhoWin] = useState<turnType | null>(null) // null no hay ganador, false empate


  const updateBoard = (index: number) => {
    // EXTRA: Evitamos que se sobrescriba una casilla que ya tiene un valor
    if (board[index] || winner !== null) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
    setTurn(newTurn);

    const newWinner = checkWinnerOptimized(newBoard);
    console.log(newWinner)
    
    if (newWinner) {
      setWhoWin(newWinner);
      setWinner(true);
    } else if (newBoard.every(item => item !== null)) {
      // Si no hay ganador y no quedan espacios vacíos
      setWinner(false);
    } else {
      // Solo cambiamos el turno si el juego continúa
      const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
      setTurn(newTurn);
    }

    
  };
  const winnerText = winner === true ? `Ganador: ${whoWin?.toUpperCase()}` : winner === false ? "No hubo ganadores" : "En juego...";

  const resetGame = () => {
  setBoard(Array(matrizSize**2).fill(null));
  setTurn(TURNS.X);
  setWinner(null);
  setWhoWin(null);
  };


  return <main className="board">
    <h1>Tic Tac Toe</h1>
    <section 
        className="game" 
        style={{ 
          '--matrix-size': matrizSize 
        } as React.CSSProperties} // El casting es necesario en TS para variables custom
      >
        {board.map((_, index) => {
          return (
            <Square
              key={index}
              index={index}
              updateBoard={updateBoard}
            >
              {board[index]}
            </Square>
          );
        })}
      </section>
    <section className="turn">
      <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
      <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
    </section>
    <h1>
      {winnerText }
    </h1>
    <button onClick={resetGame}>Reiniciar</button>
  </main>
}

export default App
