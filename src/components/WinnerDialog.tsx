import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player } from "@/types/game";
import { User, Trophy, RotateCcw, Home } from "lucide-react";

type WinnerDialogProps = {
  winner: Player;
  onReplay: () => void;
  onNewGame: () => void;
};

export const WinnerDialog = ({ winner, onReplay, onNewGame }: WinnerDialogProps) => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-6 text-center">
        <div className="space-y-2">
          <div className="text-6xl">🥑🥑🥑</div>
          <Trophy className="w-16 h-16 mx-auto text-warning" />
          <div className="text-6xl">🥑🥑🥑</div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-warning">
            Kõige asjatundlikum noor
          </h2>
          
          <div 
            className="p-6 rounded-lg mx-auto max-w-xs"
            style={{
              backgroundColor: 'hsl(var(--warning) / 0.2)',
              borderWidth: '3px',
              borderColor: 'hsl(var(--warning))'
            }}
          >
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mx-auto border-4 border-warning shadow-lg">
              {winner.imageUrl ? (
                <img 
                  src={winner.imageUrl} 
                  alt={winner.name}
                  className="w-full h-full object-cover"
                  style={{ minWidth: '100%', minHeight: '100%' }}
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="text-2xl font-bold mt-4">{winner.name}</div>
          </div>
        </div>

        <div className="text-4xl">🥑🏆🥑</div>

        <div className="space-y-3 pt-4">
          <Button onClick={onReplay} size="lg" className="w-full text-lg">
            <RotateCcw className="w-5 h-5 mr-2" />
            Mängi uuesti
          </Button>
          <Button onClick={onNewGame} variant="outline" size="lg" className="w-full">
            <Home className="w-5 h-5 mr-2" />
            Uus mäng
          </Button>
        </div>
      </Card>
    </div>
  );
};
