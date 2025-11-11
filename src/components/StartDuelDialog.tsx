import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Player, Square, Category } from "@/types/game";
import { X, Swords } from "lucide-react";

type StartDuelDialogProps = {
  square: Square;
  players: Player[];
  category: Category | undefined;
  onStartDuel: (player1Id: string, player2Id: string) => void;
  onClose: () => void;
};

export const StartDuelDialog = ({ 
  square, 
  players, 
  category,
  onStartDuel, 
  onClose 
}: StartDuelDialogProps) => {
  if (!category) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="text-center">
            <p className="text-destructive">This square needs a category first!</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5" />
            <h3 className="text-xl font-bold">Start Duel</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-2">Category: {category.name}</p>
          <p className="text-sm text-muted-foreground">{category.questions.length} questions available</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Select two players to duel:</p>
          <div className="grid grid-cols-2 gap-3">
            {players.map(player => (
              <Button
                key={player.id}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => {
                  const otherPlayer = players.find(p => p.id !== player.id);
                  if (otherPlayer) {
                    onStartDuel(player.id, otherPlayer.id);
                  }
                }}
              >
                <div className="text-3xl">{player.emoji}</div>
                <div className="font-semibold text-sm">{player.name}</div>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
