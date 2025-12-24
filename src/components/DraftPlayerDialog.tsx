import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player } from "@/types/game";
import { Dices, User } from "lucide-react";

type DraftPlayerDialogProps = {
  draftedPlayer: Player;
  onStart: () => void;
};

export const DraftPlayerDialog = ({ draftedPlayer, onStart }: DraftPlayerDialogProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Dices className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Player Drafted!</h3>
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mx-auto mb-3 border-2 border-background shadow-lg">
              {draftedPlayer.imageUrl ? (
                <img 
                  src={draftedPlayer.imageUrl} 
                  alt={draftedPlayer.name} 
                  className="w-full h-full object-cover"
                  style={{ minWidth: '100%', minHeight: '100%' }}
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="text-2xl font-semibold">{draftedPlayer.name}</div>
            <p className="text-muted-foreground mt-2">
              Select an adjacent square to challenge
            </p>
          </div>
        </div>

        <Button onClick={onStart} size="lg" className="w-full">
          Start Turn
        </Button>
      </Card>
    </div>
  );
};