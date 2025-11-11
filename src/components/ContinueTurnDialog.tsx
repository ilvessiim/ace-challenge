import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player } from "@/types/game";
import { Trophy, ArrowRight } from "lucide-react";

type ContinueTurnDialogProps = {
  winner: Player;
  newTerritory: string[];
  onContinue: () => void;
  onEndTurn: () => void;
};

export const ContinueTurnDialog = ({ 
  winner, 
  newTerritory,
  onContinue, 
  onEndTurn 
}: ContinueTurnDialogProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="w-16 h-16 text-warning" />
          </div>
          <div>
            <div className="text-4xl mb-2">{winner.emoji}</div>
            <h3 className="text-2xl font-bold">{winner.name} Wins!</h3>
            <p className="text-muted-foreground mt-2">
              Territory expanded to {newTerritory.length} square{newTerritory.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            onClick={onContinue} 
            size="lg" 
            className="w-full"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Continue Playing
          </Button>
          <Button 
            onClick={onEndTurn} 
            size="lg" 
            variant="outline"
            className="w-full"
          >
            End Turn
          </Button>
        </div>
      </Card>
    </div>
  );
};