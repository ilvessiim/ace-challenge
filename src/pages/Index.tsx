import { useState } from "react";
import { SetupBoard } from "@/components/SetupBoard";
import { BoardGrid } from "@/components/BoardGrid";
import { DuelMode } from "@/components/DuelMode";
import { AssignCategoryDialog } from "@/components/AssignCategoryDialog";
import { StartDuelDialog } from "@/components/StartDuelDialog";
import { Button } from "@/components/ui/button";
import { Player, Category, Square, GameState, DuelState } from "@/types/game";
import { Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [squares, setSquares] = useState<Square[]>([]);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDuelDialog, setShowDuelDialog] = useState(false);

  const handleStartGame = (
    rows: number, 
    cols: number, 
    gamePlayers: Player[], 
    gameCategories: Category[],
    gameSquares: Square[]
  ) => {
    setPlayers(gamePlayers);
    setCategories(gameCategories);
    setSquares(gameSquares);
    setGameState('playing');
    toast({ title: "Game started! Click squares to assign categories or start duels." });
  };

  const handleSquareClick = (square: Square) => {
    if (gameState === 'duel') return;

    setSelectedSquare(square);
    
    if (!square.categoryId) {
      setShowAssignDialog(true);
    } else {
      setShowDuelDialog(true);
    }
  };

  const handleAssignCategory = (squareId: string, categoryId: string) => {
    setSquares(squares.map(s => 
      s.id === squareId ? { ...s, categoryId } : s
    ));
    toast({ title: "Category assigned!" });
  };

  const handleStartDuel = (player1Id: string, player2Id: string) => {
    if (!selectedSquare || !selectedSquare.categoryId) return;

    const player1 = players.find(p => p.id === player1Id);
    const player2 = players.find(p => p.id === player2Id);
    const category = categories.find(c => c.id === selectedSquare.categoryId);

    if (!player1 || !player2 || !category) return;

    setDuelState({
      player1,
      player2,
      square: selectedSquare,
      category,
      currentPlayer: player1.id,
      player1Time: 45,
      player2Time: 45,
      currentQuestionIndex: 0
    });
    setGameState('duel');
    setShowDuelDialog(false);
  };

  const handleDuelEnd = (winnerId: string) => {
    if (!duelState) return;

    setSquares(squares.map(s => 
      s.id === duelState.square.id ? { ...s, ownerId: winnerId } : s
    ));
    
    const winner = players.find(p => p.id === winnerId);
    toast({ 
      title: `${winner?.name} wins the duel!`,
      description: `${winner?.emoji} now owns this square.`
    });

    setDuelState(null);
    setGameState('playing');
    setSelectedSquare(null);
  };

  const handleCancelDuel = () => {
    setDuelState(null);
    setGameState('playing');
    setSelectedSquare(null);
  };

  const handleResetGame = () => {
    setGameState('setup');
    setPlayers([]);
    setCategories([]);
    setSquares([]);
    setDuelState(null);
    setSelectedSquare(null);
  };

  if (gameState === 'setup') {
    return <SetupBoard onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            THE FLOOR
          </h1>
          <Button variant="outline" onClick={handleResetGame}>
            <Settings className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {players.map(player => {
            const ownedSquares = squares.filter(s => s.ownerId === player.id).length;
            return (
              <div 
                key={player.id} 
                className={`p-4 rounded-lg ${
                  player.color === 'player1' ? 'bg-player1/20' : 'bg-player2/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{player.emoji}</div>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {ownedSquares} squares
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <BoardGrid 
          squares={squares} 
          players={players}
          categories={categories}
          onSquareClick={handleSquareClick}
        />

        {showAssignDialog && selectedSquare && (
          <AssignCategoryDialog
            square={selectedSquare}
            categories={categories}
            onAssign={handleAssignCategory}
            onClose={() => {
              setShowAssignDialog(false);
              setSelectedSquare(null);
            }}
          />
        )}

        {showDuelDialog && selectedSquare && (
          <StartDuelDialog
            square={selectedSquare}
            players={players}
            category={categories.find(c => c.id === selectedSquare.categoryId)}
            onStartDuel={handleStartDuel}
            onClose={() => {
              setShowDuelDialog(false);
              setSelectedSquare(null);
            }}
          />
        )}

        {gameState === 'duel' && duelState && (
          <DuelMode
            duel={duelState}
            onDuelEnd={handleDuelEnd}
            onCancel={handleCancelDuel}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
