import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Category, Square, Player } from "@/types/game";
import { X } from "lucide-react";

type AssignCategoryDialogProps = {
  square: Square;
  categories: Category[];
  players: Player[];
  onAssign: (squareId: string, categoryId: string, ownerId?: string) => void;
  onClose: () => void;
};

export const AssignCategoryDialog = ({ 
  square, 
  categories,
  players,
  onAssign, 
  onClose 
}: AssignCategoryDialogProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  const handleAssign = () => {
    if (selectedCategoryId) {
      onAssign(square.id, selectedCategoryId, selectedOwnerId || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Assign Square</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Square ({square.row + 1}, {square.col + 1})
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Category</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategoryId === category.id ? "default" : "outline"}
                  className="w-full justify-start h-auto py-3"
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  <div className="text-left">
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-xs opacity-70">
                      {category.questions.length} questions
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Owner (optional)</h4>
            <div className="grid grid-cols-2 gap-2">
              {players.map(player => (
                <Button
                  key={player.id}
                  variant={selectedOwnerId === player.id ? "default" : "outline"}
                  className="h-auto py-3 flex flex-col items-center gap-2"
                  onClick={() => setSelectedOwnerId(selectedOwnerId === player.id ? null : player.id)}
                >
                  <div className="text-2xl">{player.emoji}</div>
                  <div className="text-xs font-semibold">{player.name}</div>
                </Button>
              ))}
              <Button
                variant={selectedOwnerId === null ? "default" : "outline"}
                className="h-auto py-3"
                onClick={() => setSelectedOwnerId(null)}
              >
                None
              </Button>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleAssign} 
          disabled={!selectedCategoryId}
          className="w-full"
        >
          Assign
        </Button>
      </Card>
    </div>
  );
};
