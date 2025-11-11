import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DuelState } from "@/types/game";
import { Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DuelModeProps = {
  duel: DuelState;
  onDuelEnd: (winnerId: string) => void;
  onCancel: () => void;
};

export const DuelMode = ({ duel, onDuelEnd, onCancel }: DuelModeProps) => {
  const [player1Time, setPlayer1Time] = useState(duel.player1Time);
  const [player2Time, setPlayer2Time] = useState(duel.player2Time);
  const [currentPlayer, setCurrentPlayer] = useState(duel.currentPlayer);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const currentQuestion = duel.category.questions[currentQuestionIndex];
  const isPlayer1Turn = currentPlayer === duel.player1.id;

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
      if (currentQuestionIndex < duel.category.questions.length - 1) {
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
    setIsRunning(false);
    setTimeout(() => {
      if (currentQuestionIndex < duel.category.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setCurrentQuestionIndex(0);
      }
      setIsRunning(true);
    }, 500);
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

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">DUEL MODE</h2>
          <p className="text-muted-foreground">{duel.category.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 items-center">
          <div className={cn(
            "p-6 rounded-lg transition-all",
            isPlayer1Turn ? "bg-player1/20 ring-2 ring-player1" : "bg-card"
          )}>
            <div className="text-center">
              <div className="text-4xl mb-2">{duel.player1.emoji}</div>
              <div className="font-semibold">{duel.player1.name}</div>
              <div className={cn("text-3xl font-bold mt-2", getTimeColor(player1Time))}>
                {formatTime(player1Time)}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className={cn(
            "p-6 rounded-lg transition-all",
            !isPlayer1Turn ? "bg-player2/20 ring-2 ring-player2" : "bg-card"
          )}>
            <div className="text-center">
              <div className="text-4xl mb-2">{duel.player2.emoji}</div>
              <div className="font-semibold">{duel.player2.name}</div>
              <div className={cn("text-3xl font-bold mt-2", getTimeColor(player2Time))}>
                {formatTime(player2Time)}
              </div>
            </div>
          </div>
        </div>

        <Card className="p-8 bg-muted/50">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Question {currentQuestionIndex + 1} of {duel.category.questions.length}
            </div>
            <div className="text-2xl font-semibold">
              {currentQuestion?.text || "No more questions"}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleCorrect} 
            size="lg" 
            className="bg-success hover:bg-success/90 text-success-foreground"
            disabled={!isRunning}
          >
            <Check className="w-5 h-5 mr-2" />
            Correct Answer
          </Button>
          <Button 
            onClick={handleSkip} 
            size="lg" 
            variant="secondary"
            disabled={!isRunning}
          >
            <X className="w-5 h-5 mr-2" />
            Skip
          </Button>
        </div>

        <Button onClick={onCancel} variant="outline" className="w-full">
          Cancel Duel
        </Button>
      </Card>
    </div>
  );
};
