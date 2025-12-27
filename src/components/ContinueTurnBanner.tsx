import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player, Category } from "@/types/game";
import { Trophy, ArrowRight, StopCircle, User } from "lucide-react";

type ChallengeOption = {
  player: Player;
  category: Category;
  squareId: string;
};

type ContinueTurnBannerProps = {
  winner: Player;
  newTerritory: string[];
  availableChallenges: ChallengeOption[];
  onContinue: () => void;
  onEndTurn: () => void;
};

export const ContinueTurnBanner = ({ 
  winner, 
  newTerritory,
  availableChallenges,
  onContinue, 
  onEndTurn 
}: ContinueTurnBannerProps) => {
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
    <Card className="p-4 mb-4 bg-gradient-to-r from-warning/10 to-primary/10 border-warning/30">
      <div className="flex flex-wrap items-center gap-4">
        {/* Winner info */}
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-warning" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{winner.emoji}</span>
              <span className="font-bold text-lg">{winner.name} Wins!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Territory: {newTerritory.length} square{newTerritory.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-border" />

        {/* Available challenges */}
        {hasOptions && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Available Challenges:
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueChallenges.map((challenge) => (
                <div 
                  key={challenge.player.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 border"
                >
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {challenge.player.imageUrl ? (
                      <img 
                        src={challenge.player.imageUrl} 
                        alt={challenge.player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{challenge.player.name}</span>
                    <span className="text-muted-foreground"> • {challenge.category.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasOptions && (
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              No adjacent opponents available
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 ml-auto">
          {hasOptions && (
            <Button onClick={onContinue} size="sm">
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue
            </Button>
          )}
          <Button onClick={onEndTurn} size="sm" variant="outline">
            <StopCircle className="w-4 h-4 mr-2" />
            End Turn
          </Button>
        </div>
      </div>
    </Card>
  );
};
