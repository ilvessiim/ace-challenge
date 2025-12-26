import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player, Square, Category } from "@/types/game";
import { Trophy, ArrowRight, User } from "lucide-react";

type ChallengeOption = {
  player: Player;
  category: Category;
  squareId: string;
};

type ContinueTurnDialogProps = {
  winner: Player;
  newTerritory: string[];
  availableChallenges: ChallengeOption[];
  onContinue: () => void;
  onEndTurn: () => void;
};

export const ContinueTurnDialog = ({ 
  winner, 
  newTerritory,
  availableChallenges,
  onContinue, 
  onEndTurn 
}: ContinueTurnDialogProps) => {
  const hasOptions = availableChallenges.length > 0;

  // Group challenges by player (since a player might have multiple adjacent squares)
  const uniqueChallenges = availableChallenges.reduce<ChallengeOption[]>((acc, challenge) => {
    const exists = acc.find(c => c.player.id === challenge.player.id);
    if (!exists) {
      acc.push(challenge);
    }
    return acc;
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-auto">
      <Card className="w-full max-w-lg p-6 space-y-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="w-12 h-12 text-warning" />
          </div>
          <div>
            <div className="text-3xl mb-2">{winner.emoji}</div>
            <h3 className="text-xl font-bold">{winner.name} Wins!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Territory: {newTerritory.length} square{newTerritory.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {hasOptions && (
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              Available Challenges ({uniqueChallenges.length}):
            </h4>
            <div className="space-y-2 max-h-48 overflow-auto">
              {uniqueChallenges.map((challenge) => (
                <div 
                  key={challenge.player.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border-2 border-background">
                    {challenge.player.imageUrl ? (
                      <img 
                        src={challenge.player.imageUrl} 
                        alt={challenge.player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{challenge.player.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {challenge.category.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasOptions && (
          <div className="border-t border-border pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              No adjacent opponents available
            </p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {hasOptions && (
            <Button 
              onClick={onContinue} 
              size="lg" 
              className="w-full"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Continue Playing
            </Button>
          )}
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
