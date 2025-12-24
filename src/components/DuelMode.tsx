import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DuelState } from "@/types/game";
import { Check, X, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

type DuelModeProps = {
  duel: DuelState;
  onDuelEnd: (winnerId: string) => void;
  onCancel: () => void;
  onBonusUsed: (playerId: string) => void;
};

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const DuelMode = ({ duel, onDuelEnd, onCancel, onBonusUsed }: DuelModeProps) => {
  const [player1Time, setPlayer1Time] = useState(60);
  const [player2Time, setPlayer2Time] = useState(60);
  const [currentPlayer, setCurrentPlayer] = useState(duel.currentPlayer);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [questionFrozen, setQuestionFrozen] = useState(false);
  const [player1BonusUsed, setPlayer1BonusUsed] = useState(false);
  const [player2BonusUsed, setPlayer2BonusUsed] = useState(false);
  const [showReadyScreen, setShowReadyScreen] = useState(true);

  // Shuffle questions once when duel starts
  const shuffledQuestions = useMemo(() => shuffleArray(duel.category.questions), [duel.category.questions]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const isPlayer1Turn = currentPlayer === duel.player1.id;
  const currentPlayerObj = isPlayer1Turn ? duel.player1 : duel.player2;
  const currentPlayerBonusUsed = isPlayer1Turn ? player1BonusUsed : player2BonusUsed;
  const canUseBonus = currentPlayerObj.winStreak >= 3 && !currentPlayerBonusUsed;

  const applyBonus = () => {
    const currentPlayerId = isPlayer1Turn ? duel.player1.id : duel.player2.id;
    if (isPlayer1Turn) {
      setPlayer1Time(prev => prev + 5);
      setPlayer1BonusUsed(true);
    } else {
      setPlayer2Time(prev => prev + 5);
      setPlayer2BonusUsed(true);
    }
    onBonusUsed(currentPlayerId);
  };

  const startDuel = () => {
    setShowReadyScreen(false);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      if (isPlayer1Turn) {
        setPlayer1Time(prev => {
          if (prev <= 0) {
            setIsRunning(false);
            onDuelEnd(duel.player2.id);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setPlayer2Time(prev => {
          if (prev <= 0) {
            setIsRunning(false);
            onDuelEnd(duel.player1.id);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isPlayer1Turn, duel.player1.id, duel.player2.id, onDuelEnd]);

  const handleCorrect = () => {
    setIsRunning(false);
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentPlayer(isPlayer1Turn ? duel.player2.id : duel.player1.id);
        setIsRunning(true);
      } else {
        setCurrentQuestionIndex(0);
        setCurrentPlayer(isPlayer1Turn ? duel.player2.id : duel.player1.id);
        setIsRunning(true);
      }
    }, 500);
  };

  const handleSkip = () => {
    setQuestionFrozen(true);
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setCurrentQuestionIndex(0);
      }
      setQuestionFrozen(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds > 30) return '';
    if (seconds > 10) return 'text-warning';
    return 'text-destructive';
  };

  const PlayerAvatar = ({ player, size = 'md' }: { player: typeof duel.player1, size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32'
    };
    const iconSizes = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };
    
    return (
      <div className={cn(sizeClasses[size], "rounded-full bg-muted flex items-center justify-center overflow-hidden mx-auto border-2 border-background shadow-lg")}>
        {player.imageUrl ? (
          <img 
            src={player.imageUrl} 
            alt={player.name} 
            className="w-full h-full object-cover"
            style={{ minWidth: '100%', minHeight: '100%' }}
          />
        ) : (
          <User className={cn(iconSizes[size], "text-muted-foreground")} />
        )}
      </div>
    );
  };

  if (showReadyScreen) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-8 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">DUEL MODE</h2>
            <p className="text-xl text-muted-foreground">{duel.category.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6">
            <div 
              className="p-8 rounded-lg text-center space-y-3"
              style={{
                backgroundColor: `hsl(var(--${duel.player1.color}) / 0.2)`,
                borderWidth: '2px',
                borderColor: `hsl(var(--${duel.player1.color}))`
              }}
            >
              <PlayerAvatar player={duel.player1} size="lg" />
              <div className="text-2xl font-bold">{duel.player1.name}</div>
              {duel.player1.winStreak >= 3 && !player1BonusUsed && (
                <div className="text-warning text-sm font-semibold">🔥 3-Win Streak!</div>
              )}
            </div>

            <div 
              className="p-8 rounded-lg text-center space-y-3"
              style={{
                backgroundColor: `hsl(var(--${duel.player2.color}) / 0.2)`,
                borderWidth: '2px',
                borderColor: `hsl(var(--${duel.player2.color}))`
              }}
            >
              <PlayerAvatar player={duel.player2} size="lg" />
              <div className="text-2xl font-bold">{duel.player2.name}</div>
              {duel.player2.winStreak >= 3 && !player2BonusUsed && (
                <div className="text-warning text-sm font-semibold">🔥 3-Win Streak!</div>
              )}
            </div>
          </div>

          {(canUseBonus) && (
            <Card className="p-6 bg-warning/20 border-warning">
              <div className="text-center space-y-4">
                <div className="text-lg font-bold">🔥 Bonus Available for {currentPlayerObj.name}!</div>
                <p className="text-sm">You have a 3-win streak. Add +5 seconds to your time?</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={applyBonus} variant="default" size="lg">
                    Use +5 Seconds Bonus
                  </Button>
                  <Button onClick={startDuel} variant="outline" size="lg">
                    Continue Without Bonus
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {!canUseBonus && (
            <Button onClick={startDuel} size="lg" className="w-full text-xl py-6">
              Start Playing
            </Button>
          )}

          <Button onClick={onCancel} variant="outline" className="w-full">
            Cancel Duel
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">DUEL MODE</h2>
          <p className="text-muted-foreground">{duel.category.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 items-center">
          <div 
            className={cn(
              "p-6 rounded-lg transition-all bg-card",
              isPlayer1Turn && "ring-2"
            )}
            style={isPlayer1Turn ? {
              backgroundColor: `hsl(var(--${duel.player1.color}) / 0.2)`,
              boxShadow: `0 0 0 2px hsl(var(--${duel.player1.color}))`
            } : undefined}
          >
            <div className="text-center">
              <PlayerAvatar player={duel.player1} size="sm" />
              <div className="font-semibold mt-2">{duel.player1.name}</div>
              <div className={cn("text-3xl font-bold mt-2", getTimeColor(player1Time))}>
                {formatTime(player1Time)}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </div>

          <div 
            className={cn(
              "p-6 rounded-lg transition-all bg-card",
              !isPlayer1Turn && "ring-2"
            )}
            style={!isPlayer1Turn ? {
              backgroundColor: `hsl(var(--${duel.player2.color}) / 0.2)`,
              boxShadow: `0 0 0 2px hsl(var(--${duel.player2.color}))`
            } : undefined}
          >
            <div className="text-center">
              <PlayerAvatar player={duel.player2} size="sm" />
              <div className="font-semibold mt-2">{duel.player2.name}</div>
              <div className={cn("text-3xl font-bold mt-2", getTimeColor(player2Time))}>
                {formatTime(player2Time)}
              </div>
            </div>
          </div>
        </div>

        <Card className="p-8 bg-muted/50">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
            </div>
            {!questionFrozen ? (
              <>
                {currentQuestion?.imageUrl && (
                  <div className="flex justify-center mb-4">
                    <div className="w-80 h-80 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="Question" 
                        className="w-full h-full object-cover"
                        style={{ minWidth: '100%', minHeight: '100%' }}
                      />
                    </div>
                  </div>
                )}
                {currentQuestion?.text && (
                  <div className="text-2xl font-semibold">
                    {currentQuestion.text}
                  </div>
                )}
                {!currentQuestion?.text && !currentQuestion?.imageUrl && (
                  <div className="text-2xl font-semibold text-muted-foreground">
                    No more questions
                  </div>
                )}
              </>
            ) : (
              <div className="text-2xl font-semibold text-muted-foreground">
                Loading next question...
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleCorrect} 
            size="lg" 
            className="bg-success hover:bg-success/90 text-success-foreground"
            disabled={!isRunning || questionFrozen}
          >
            <Check className="w-5 h-5 mr-2" />
            Correct Answer
          </Button>
          <Button 
            onClick={handleSkip} 
            size="lg" 
            variant="secondary"
            disabled={!isRunning || questionFrozen}
          >
            <X className="w-5 h-5 mr-2" />
            Skip
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground text-center">End Duel Manually:</div>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => onDuelEnd(duel.player1.id)} 
              size="lg" 
              variant="outline"
              style={{
                borderColor: `hsl(var(--${duel.player1.color}))`,
                backgroundColor: `hsl(var(--${duel.player1.color}) / 0.1)`
              }}
            >
              {duel.player1.name} Wins
            </Button>
            <Button 
              onClick={() => onDuelEnd(duel.player2.id)} 
              size="lg" 
              variant="outline"
              style={{
                borderColor: `hsl(var(--${duel.player2.color}))`,
                backgroundColor: `hsl(var(--${duel.player2.color}) / 0.1)`
              }}
            >
              {duel.player2.name} Wins
            </Button>
          </div>
        </div>

        <Button onClick={onCancel} variant="outline" className="w-full">
          Cancel Duel
        </Button>
      </Card>
    </div>
  );
};
