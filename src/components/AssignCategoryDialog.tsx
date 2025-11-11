import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Category, Square } from "@/types/game";
import { X } from "lucide-react";

type AssignCategoryDialogProps = {
  square: Square;
  categories: Category[];
  onAssign: (squareId: string, categoryId: string) => void;
  onClose: () => void;
};

export const AssignCategoryDialog = ({ 
  square, 
  categories, 
  onAssign, 
  onClose 
}: AssignCategoryDialogProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Assign Category</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Select a category for square ({square.row + 1}, {square.col + 1})
        </p>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {categories.map(category => (
            <Button
              key={category.id}
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => {
                onAssign(square.id, category.id);
                onClose();
              }}
            >
              <div className="text-left">
                <div className="font-semibold">{category.name}</div>
                <div className="text-xs text-muted-foreground">
                  {category.questions.length} questions
                </div>
              </div>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
