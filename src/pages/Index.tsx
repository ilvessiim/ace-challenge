import { useState, useEffect } from "react";
import { SetupBoard } from "@/components/SetupBoard";
import { BoardGrid } from "@/components/BoardGrid";
import { DuelMode } from "@/components/DuelMode";
import { AssignCategoryDialog } from "@/components/AssignCategoryDialog";
import { StartDuelDialog } from "@/components/StartDuelDialog";
import { ContinueTurnBanner } from "@/components/ContinueTurnBanner";
import { DraftPlayerDialog } from "@/components/DraftPlayerDialog";
import { WinnerDialog } from "@/components/WinnerDialog";
import { Button } from "@/components/ui/button";
import { Player, Category, Square, GameState, DuelState, ActiveTurn } from "@/types/game";
import { Settings, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [squares, setSquares] = useState<Square[]>([]);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [revealedPlayerIds, setRevealedPlayerIds] = useState<string[]>([]);
  const [showDuelDialog, setShowDuelDialog] = useState(false);
  const [activeTurn, setActiveTurn] = useState<ActiveTurn | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showContinueBanner, setShowContinueBanner] = useState(false);
  const [duelWinnerId, setDuelWinnerId] = useState<string | null>(null);
  const [draftedPlayerIds, setDraftedPlayerIds] = useState<string[]>([]);
  const [lastEndedTurnPlayerId, setLastEndedTurnPlayerId] = useState<string | null>(null);
  const [gameWinner, setGameWinner] = useState<Player | null>(null);
  const [initialGameData, setInitialGameData] = useState<{
    rows: number;
    cols: number;
    players: Player[];
    categories: Category[];
    squares: Square[];
  } | null>(null);
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
    
    // Get active players (those still on the board with at least 1 square)
    const activePlayerIds = [...new Set(playerSquares.map(s => s.ownerId!))];
    
    // Remove eliminated players from drafted list (they're no longer in the game)
    const stillInGameDrafted = draftedPlayerIds.filter(id => activePlayerIds.includes(id));
    if (stillInGameDrafted.length !== draftedPlayerIds.length) {
      setDraftedPlayerIds(stillInGameDrafted);
    }
    
    // Find players who haven't been drafted yet this round
    // Also exclude the player who just ended their turn
    let eligiblePlayerIds = activePlayerIds.filter(id => 
      !stillInGameDrafted.includes(id) && id !== lastEndedTurnPlayerId
    );
    
    // If everyone has been drafted (or only the last-ended player remains), reset the round
    if (eligiblePlayerIds.length === 0) {
      setDraftedPlayerIds([]);
      setLastEndedTurnPlayerId(null);
      eligiblePlayerIds = activePlayerIds.filter(id => id !== lastEndedTurnPlayerId);
      
      // If still no one eligible (only the last-ended player exists), include them
      if (eligiblePlayerIds.length === 0) {
        eligiblePlayerIds = activePlayerIds;
        setLastEndedTurnPlayerId(null);
      }
    }
    
    // Filter to only those with adjacent opponents
    const eligibleWithOpponents = eligiblePlayerIds.filter(playerId => {
      const territory = squares.filter(s => s.ownerId === playerId).map(s => s.id);
      const adjacentChallenges = getAdjacentSquares(territory);
      return adjacentChallenges.length > 0;
    });
    
    if (eligibleWithOpponents.length === 0) {
      toast({ title: "No eligible players with adjacent opponents!", variant: "destructive" });
      return;
    }
    
    // Pick a random player from eligible ones
    const randomPlayerId = eligibleWithOpponents[Math.floor(Math.random() * eligibleWithOpponents.length)];
    const territory = squares.filter(s => s.ownerId === randomPlayerId).map(s => s.id);
    const availableChallenges = getAdjacentSquares(territory);
    
    // Mark this player as drafted
    setDraftedPlayerIds(prev => [...prev, randomPlayerId]);
    
    // Reveal this player and all adjacent opponents
    const adjacentPlayerIds = availableChallenges
      .map(sqId => squares.find(s => s.id === sqId)?.ownerId)
      .filter((id): id is string => !!id);
    setRevealedPlayerIds([randomPlayerId, ...adjacentPlayerIds]);
    
    setActiveTurn({ playerId: randomPlayerId, territory, availableChallenges });
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
    setGameWinner(null);
    
    // Store initial game data for replay
    setInitialGameData({
      rows,
      cols,
      players: gamePlayers.map(p => ({ ...p, winStreak: 0 })),
      categories: gameCategories,
      squares: gameSquares
    });
    
    toast({ title: "Assign players to squares, then start drafting!" });
  };

  const handleSquareClick = (square: Square) => {
    if (gameState === 'duel') return;
    
    // Draft/Continue mode: only allow adjacent challenges
    if ((gameState === 'draft' || gameState === 'continue') && activeTurn) {
      if (!activeTurn.availableChallenges.includes(square.id)) {
        toast({ title: "Can only challenge adjacent squares!", variant: "destructive" });
        return;
      }
      
      // Get defender from the square
      const defenderId = square.ownerId;
      if (!defenderId) return;
      
      // Check if category is assigned
      const defender = players.find(p => p.id === defenderId);
      const defenderCategory = categories.find(c => c.id === defender?.categoryId);
      
      if (!defenderCategory) {
        toast({ title: "This square needs a category first!", variant: "destructive" });
        return;
      }
      
      // Auto-start duel with attacker and defender
      setSelectedSquare(square);
      handleStartDuel(activeTurn.playerId, defenderId);
    }
  };


  const handleStartDuel = (attackerId: string, defenderId: string) => {
    if (!selectedSquare || !activeTurn) return;

    const attacker = players.find(p => p.id === attackerId);
    const defender = players.find(p => p.id === defenderId);
    
    // Use defender's category
    const defenderCategory = categories.find(c => c.id === defender?.categoryId);

    if (!attacker || !defender || !defenderCategory) return;

    setDuelState({
      player1: attacker,
      player2: defender,
      square: selectedSquare,
      category: defenderCategory,
      currentPlayer: attacker.id,
      player1Time: 60,
      player2Time: 60,
      currentQuestionIndex: 0
    });
    setGameState('duel');
    setShowDuelDialog(false);
  };

  const handleDuelEnd = (winnerId: string) => {
    if (!duelState) return;

    const loserId = winnerId === duelState.player1.id ? duelState.player2.id : duelState.player1.id;
    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);

    // Transfer ALL squares owned by loser to winner, and update category to winner's category
    const winnerCategoryId = winner?.categoryId || null;
    const updatedSquares = squares.map(s =>
      s.ownerId === loserId ? { ...s, ownerId: winnerId, categoryId: winnerCategoryId } : s
    );
    const capturedSquares = squares.filter(s => s.ownerId === loserId).length;
    setSquares(updatedSquares);

    // Update win streaks - only increment winner's streak, don't transfer from loser
    // Winner gets +1 to their own streak, loser resets to 0
    const updatedPlayers = players.map(p => {
      if (p.id === winnerId) {
        return { ...p, winStreak: p.winStreak + 1 };
      }
      if (p.id === loserId) {
        return { ...p, winStreak: 0, categoryId: null };
      }
      return p;
    });

    setPlayers(updatedPlayers);

    // Check if only one player remains (game over)
    const remainingPlayerIds = [...new Set(updatedSquares.filter(s => s.ownerId).map(s => s.ownerId!))];
    if (remainingPlayerIds.length === 1) {
      const finalWinner = updatedPlayers.find(p => p.id === remainingPlayerIds[0]);
      if (finalWinner) {
        setGameWinner(finalWinner);
        setDuelState(null);
        setSelectedSquare(null);
        return;
      }
    }

    // Move to "continue" flow for the duel winner.
    // IMPORTANT: clear activeTurn so the loser (or previous active player) cannot keep dueling from the board.
    setActiveTurn(null);
    setDuelWinnerId(winnerId);
    setGameState('continue');
    setShowContinueBanner(true);
    setSelectedSquare(null);

    toast({
      title: `${winner?.name} wins the duel!`,
      description: `${winner?.emoji} captured ${capturedSquares} square${capturedSquares !== 1 ? 's' : ''}! Win streak: ${(winner?.winStreak || 0) + 1}`
    });
  };

  const handleBonusUsed = (playerId: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(p => 
        p.id === playerId ? { ...p, winStreak: 0 } : p
      )
    );
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
    
    // Update revealed players for new challenges
    const adjacentPlayerIds = availableChallenges
      .map(sqId => squares.find(s => s.id === sqId)?.ownerId)
      .filter((id): id is string => !!id);
    setRevealedPlayerIds([duelWinnerId, ...adjacentPlayerIds]);
    
    setActiveTurn({ playerId: duelWinnerId, territory: newTerritory, availableChallenges });
    setShowContinueBanner(false);
    setDuelState(null);
    setSelectedSquare(null);
    setDuelWinnerId(null);
    toast({ title: "Continue your conquest!", description: "Select an adjacent square to challenge" });
  };

  const handleEndTurn = () => {
    const endingPlayerId = activeTurn?.playerId || duelWinnerId;
    
    setActiveTurn(null);
    setRevealedPlayerIds([]);
    setShowContinueBanner(false);
    setDuelState(null);
    setSelectedSquare(null);
    setDuelWinnerId(null);
    setGameState('playing');
    
    // Track who just ended their turn so they won't be drafted next
    if (endingPlayerId) {
      setLastEndedTurnPlayerId(endingPlayerId);
    }
    
    // Auto-draft next player
    setTimeout(() => {
      draftRandomPlayer();
    }, 100);
  };

  const handleCancelDuel = () => {
    setDuelState(null);
    setGameState(activeTurn ? 'continue' : 'playing');
    setSelectedSquare(null);
  };

  const handleReplay = () => {
    if (!initialGameData) return;
    
    // Reset with same players and categories
    setPlayers(initialGameData.players.map(p => ({ ...p, winStreak: 0 })));
    setCategories(initialGameData.categories);
    setSquares(initialGameData.squares);
    setDuelState(null);
    setSelectedSquare(null);
    setActiveTurn(null);
    setDuelWinnerId(null);
    setRevealedPlayerIds([]);
    setShowDraftDialog(false);
    setShowContinueBanner(false);
    setDraftedPlayerIds([]);
    setLastEndedTurnPlayerId(null);
    setGameWinner(null);
    setGameState('playing');
    toast({ title: "Game restarted!", description: "Same players and categories" });
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
    setRevealedPlayerIds([]);
    setShowDraftDialog(false);
    setShowContinueBanner(false);
    setDraftedPlayerIds([]);
    setLastEndedTurnPlayerId(null);
    setGameWinner(null);
    setInitialGameData(null);
  };

  const handleEditSettings = () => {
    setGameState('setup');
    setSquares([]);
    setDuelState(null);
    setSelectedSquare(null);
    setActiveTurn(null);
    setDuelWinnerId(null);
    setRevealedPlayerIds([]);
    setShowDraftDialog(false);
    setShowContinueBanner(false);
    setDraftedPlayerIds([]);
  };

  if (gameState === 'setup') {
    return <SetupBoard onStartGame={handleStartGame} existingPlayers={players} existingCategories={categories} />;
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
              <>
                <Button onClick={draftRandomPlayer}>
                  Draft Player
                </Button>
                <Button variant="outline" onClick={handleEditSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Settings
                </Button>
              </>
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
            const hasStreak = player.winStreak >= 3;
            return (
              <div 
                key={player.id} 
                className={`p-4 rounded-lg transition-all ${
                  isActive ? `bg-${player.color}/30 ring-2 ring-${player.color}` : `bg-${player.color}/20`
                }`}
                style={{
                  backgroundColor: hasStreak 
                    ? 'hsl(var(--warning) / 0.3)'
                    : isActive 
                      ? `hsl(var(--${player.color}) / 0.3)` 
                      : `hsl(var(--${player.color}) / 0.2)`,
                  ...(isActive && {
                    boxShadow: hasStreak 
                      ? `0 0 0 2px hsl(var(--warning))`
                      : `0 0 0 2px hsl(var(--${player.color}))`
                  })
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background shadow-md">
                    {player.imageUrl ? (
                      <img 
                        src={player.imageUrl} 
                        alt={player.name}
                        className="w-full h-full object-cover"
                        style={{ minWidth: '100%', minHeight: '100%' }}
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div 
                      className="font-semibold"
                      style={{ color: hasStreak ? 'hsl(var(--warning))' : undefined }}
                    >
                      {player.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ownedSquares} squares
                      {hasStreak && ` • 🔥 ${player.winStreak} streak`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showContinueBanner && duelWinnerId && (() => {
          const newTerritory = squares.filter(s => s.ownerId === duelWinnerId).map(s => s.id);
          const adjacentSquareIds = getAdjacentSquares(newTerritory);
          const challengeOptions = adjacentSquareIds.map(sqId => {
            const sq = squares.find(s => s.id === sqId);
            const player = players.find(p => p.id === sq?.ownerId);
            const category = categories.find(c => c.id === player?.categoryId);
            return player && category ? { player, category, squareId: sqId } : null;
          }).filter((opt): opt is { player: Player; category: Category; squareId: string } => opt !== null);
          
          // Get opponent player IDs for revealing their categories
          const opponentPlayerIds = challengeOptions.map(opt => opt.player.id);

          return (
            <>
              <ContinueTurnBanner
                winner={players.find(p => p.id === duelWinnerId)!}
                newTerritory={newTerritory}
                availableChallenges={challengeOptions}
                onContinue={handleContinueTurn}
                onEndTurn={handleEndTurn}
              />
              <BoardGrid 
                squares={squares} 
                players={players}
                categories={categories}
                onSquareClick={handleSquareClick}
                highlightedSquares={adjacentSquareIds}
                revealedPlayerIds={[duelWinnerId, ...opponentPlayerIds]}
                activePlayerId={duelWinnerId}
              />
            </>
          );
        })()}

        {!showContinueBanner && (
          <BoardGrid 
            squares={squares} 
            players={players}
            categories={categories}
            onSquareClick={handleSquareClick}
            highlightedSquares={activeTurn?.availableChallenges}
            revealedPlayerIds={revealedPlayerIds}
            activePlayerId={activeTurn?.playerId}
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
            onBonusUsed={handleBonusUsed}
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

        {gameWinner && (
          <WinnerDialog
            winner={gameWinner}
            onReplay={handleReplay}
            onNewGame={handleResetGame}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
