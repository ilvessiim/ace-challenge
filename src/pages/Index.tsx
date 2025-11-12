import { useState } from "react";
import { SetupBoard } from "@/components/SetupBoard";
import { BoardGrid } from "@/components/BoardGrid";
import { DuelMode } from "@/components/DuelMode";
import { AssignCategoryDialog } from "@/components/AssignCategoryDialog";
import { StartDuelDialog } from "@/components/StartDuelDialog";
import { ContinueTurnDialog } from "@/components/ContinueTurnDialog";
import { DraftPlayerDialog } from "@/components/DraftPlayerDialog";
import { Button } from "@/components/ui/button";
import { Player, Category, Square, GameState, DuelState, ActiveTurn } from "@/types/game";
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
  const [activeTurn, setActiveTurn] = useState<ActiveTurn | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [duelWinnerId, setDuelWinnerId] = useState<string | null>(null);

  const getAdjacentSquares = (squareIds: string[]): string[] => {
    const adjacent = new Set<string>();
    
    squareIds.forEach(id => {
      const square = squares.find(s => s.id === id);
      if (!square) return;
      
      // Check all 4 directions
      const directions = [
        { row: square.row - 1, col: square.col }, // up
        { row: square.row + 1, col: square.col }, // down
        { row: square.row, col: square.col - 1 }, // left
        { row: square.row, col: square.col + 1 }, // right
      ];
      
      directions.forEach(dir => {
        const adjSquare = squares.find(s => s.row === dir.row && s.col === dir.col);
        if (adjSquare && adjSquare.ownerId && adjSquare.ownerId !== square.ownerId) {
          adjacent.add(adjSquare.id);
        }
      });
    });
    
    return Array.from(adjacent);
  };

  const draftRandomPlayer = () => {
    const playerSquares = squares.filter(s => s.ownerId);
    if (playerSquares.length === 0) {
      toast({ title: "No players on board yet!", variant: "destructive" });
      return;
    }
    
    const randomSquare = playerSquares[Math.floor(Math.random() * playerSquares.length)];
    const playerId = randomSquare.ownerId!;
    const territory = squares.filter(s => s.ownerId === playerId).map(s => s.id);
    const availableChallenges = getAdjacentSquares(territory);
    
    if (availableChallenges.length === 0) {
      toast({ title: "This player has no adjacent opponents!", description: "Drafting another player..." });
      draftRandomPlayer();
      return;
    }
    
    setActiveTurn({ playerId, territory, availableChallenges });
    setGameState('draft');
    setShowDraftDialog(true);
  };

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
    toast({ title: "Assign players to squares, then start drafting!" });
  };

  const handleSquareClick = (square: Square) => {
    if (gameState === 'duel') return;
    
    // Setup mode: assign categories and players
    if (gameState === 'playing') {
      setSelectedSquare(square);
      setShowAssignDialog(true);
      return;
    }
    
    // Draft/Continue mode: only allow adjacent challenges
    if ((gameState === 'draft' || gameState === 'continue') && activeTurn) {
      if (!activeTurn.availableChallenges.includes(square.id)) {
        toast({ title: "Can only challenge adjacent squares!", variant: "destructive" });
        return;
      }
      setSelectedSquare(square);
      setShowDuelDialog(true);
    }
  };

  const handleAssignCategory = (squareId: string, categoryId: string, ownerId?: string) => {
    setSquares(squares.map(s => 
      s.id === squareId ? { ...s, categoryId, ownerId: ownerId || s.ownerId } : s
    ));
    toast({ title: "Square assigned!" });
  };

  const handleStartDuel = (attackerId: string, defenderId: string) => {
    if (!selectedSquare || !selectedSquare.categoryId || !activeTurn) return;

    const attacker = players.find(p => p.id === attackerId);
    const defender = players.find(p => p.id === defenderId);
    const category = categories.find(c => c.id === selectedSquare.categoryId);

    if (!attacker || !defender || !category) return;

    setDuelState({
      player1: attacker,
      player2: defender,
      square: selectedSquare,
      category,
      currentPlayer: attacker.id,
      player1Time: 45,
      player2Time: 45,
      currentQuestionIndex: 0
    });
    setGameState('duel');
    setShowDuelDialog(false);
  };

  const handleDuelEnd = (winnerId: string) => {
    if (!duelState || !activeTurn) return;

    const loserId = winnerId === duelState.player1.id ? duelState.player2.id : duelState.player1.id;
    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);
    
    // Transfer ALL squares owned by loser to winner
    const updatedSquares = squares.map(s => 
      s.ownerId === loserId ? { ...s, ownerId: winnerId } : s
    );
    const capturedSquares = squares.filter(s => s.ownerId === loserId).length;
    setSquares(updatedSquares);
    
    // Handle category transfer
    let updatedPlayers = [...players];
    const attackerIsWinner = winnerId === activeTurn.playerId;
    
    if (attackerIsWinner) {
      // If winner played in their own category and won
      if (duelState.square.ownerId === winnerId) {
        updatedPlayers = updatedPlayers.map(p => {
          if (p.id === winnerId && !p.categoryId && loser?.categoryId) {
            return { ...p, categoryId: loser.categoryId };
          }
          if (p.id === loserId) {
            return { ...p, categoryId: null };
          }
          return p;
        });
      }
    }
    setPlayers(updatedPlayers);
    
    setDuelWinnerId(winnerId);
    setGameState('continue');
    setShowContinueDialog(true);
    
    toast({ 
      title: `${winner?.name} wins the duel!`,
      description: `${winner?.emoji} captured ${capturedSquares} square${capturedSquares !== 1 ? 's' : ''}!`
    });
  };

  const handleContinueTurn = () => {
    if (!duelWinnerId) return;
    
    const newTerritory = squares.filter(s => s.ownerId === duelWinnerId).map(s => s.id);
    const availableChallenges = getAdjacentSquares(newTerritory);
    
    if (availableChallenges.length === 0) {
      toast({ title: "No more adjacent opponents!", description: "Ending turn..." });
      handleEndTurn();
      return;
    }
    
    setActiveTurn({ playerId: duelWinnerId, territory: newTerritory, availableChallenges });
    setShowContinueDialog(false);
    setDuelState(null);
    setSelectedSquare(null);
    setDuelWinnerId(null);
    toast({ title: "Continue your conquest!", description: "Select an adjacent square to challenge" });
  };

  const handleEndTurn = () => {
    setActiveTurn(null);
    setShowContinueDialog(false);
    setDuelState(null);
    setSelectedSquare(null);
    setDuelWinnerId(null);
    setGameState('playing');
    toast({ title: "Turn ended", description: "Click 'Draft Player' to start next turn" });
  };

  const handleCancelDuel = () => {
    setDuelState(null);
    setGameState(activeTurn ? 'continue' : 'playing');
    setSelectedSquare(null);
  };

  const handleResetGame = () => {
    setGameState('setup');
    setPlayers([]);
    setCategories([]);
    setSquares([]);
    setDuelState(null);
    setSelectedSquare(null);
    setActiveTurn(null);
    setDuelWinnerId(null);
    setShowDraftDialog(false);
    setShowContinueDialog(false);
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
          <div className="flex gap-2">
            {gameState === 'playing' && (
              <Button onClick={draftRandomPlayer}>
                Draft Player
              </Button>
            )}
            <Button variant="outline" onClick={handleResetGame}>
              <Settings className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {players.map(player => {
            const ownedSquares = squares.filter(s => s.ownerId === player.id).length;
            const isActive = activeTurn?.playerId === player.id;
            return (
              <div 
                key={player.id} 
                className={`p-4 rounded-lg transition-all ${
                  isActive ? `bg-${player.color}/30 ring-2 ring-${player.color}` : `bg-${player.color}/20`
                }`}
                style={{
                  backgroundColor: isActive 
                    ? `hsl(var(--${player.color}) / 0.3)` 
                    : `hsl(var(--${player.color}) / 0.2)`,
                  ...(isActive && {
                    boxShadow: `0 0 0 2px hsl(var(--${player.color}))`
                  })
                }}
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
          highlightedSquares={activeTurn?.availableChallenges}
        />

        {showAssignDialog && selectedSquare && (
          <AssignCategoryDialog
            square={selectedSquare}
            categories={categories}
            players={players}
            onAssign={handleAssignCategory}
            onClose={() => {
              setShowAssignDialog(false);
              setSelectedSquare(null);
            }}
          />
        )}

        {showDuelDialog && selectedSquare && activeTurn && (
          <StartDuelDialog
            square={selectedSquare}
            players={players.filter(p => 
              p.id === activeTurn.playerId || 
              squares.find(s => s.id === selectedSquare.id)?.ownerId === p.id
            )}
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

        {showDraftDialog && activeTurn && (
          <DraftPlayerDialog
            draftedPlayer={players.find(p => p.id === activeTurn.playerId)!}
            onStart={() => {
              setShowDraftDialog(false);
              setGameState('draft');
            }}
          />
        )}

        {showContinueDialog && duelWinnerId && (
          <ContinueTurnDialog
            winner={players.find(p => p.id === duelWinnerId)!}
            newTerritory={squares.filter(s => s.ownerId === duelWinnerId).map(s => s.id)}
            onContinue={handleContinueTurn}
            onEndTurn={handleEndTurn}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
