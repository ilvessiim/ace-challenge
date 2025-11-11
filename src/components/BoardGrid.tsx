import { Square, Player, Category } from "@/types/game";
import { cn } from "@/lib/utils";

type BoardGridProps = {
  squares: Square[];
  players: Player[];
  categories: Category[];
  onSquareClick: (square: Square) => void;
  highlightedSquares?: string[];
};

export const BoardGrid = ({ squares, players, categories, onSquareClick, highlightedSquares = [] }: BoardGridProps) => {
  const rows = Math.max(...squares.map(s => s.row)) + 1;
  const cols = Math.max(...squares.map(s => s.col)) + 1;

  const getSquareContent = (square: Square) => {
    const owner = players.find(p => p.id === square.ownerId);
    const category = categories.find(c => c.id === square.categoryId);
    
    return { owner, category };
  };

  return (
    <div 
      className="grid gap-2 w-full max-w-5xl mx-auto p-4"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
      }}
    >
      {squares.map((square) => {
        const { owner, category } = getSquareContent(square);
        const isHighlighted = highlightedSquares.includes(square.id);
        
        return (
          <button
            key={square.id}
            onClick={() => onSquareClick(square)}
            className={cn(
              "aspect-square rounded-lg border-2 transition-all duration-200",
              "flex flex-col items-center justify-center p-2 text-center",
              "hover:scale-105 hover:shadow-lg active:scale-95",
              !owner && "bg-neutral/20 border-neutral",
              isHighlighted && "ring-4 ring-warning animate-pulse"
            )}
            style={{
              backgroundColor: owner ? `hsl(var(--${owner.color}) / 0.2)` : undefined,
              borderColor: owner ? `hsl(var(--${owner.color}))` : undefined,
            }}
          >
            {owner && (
              <div className="text-2xl mb-1">{owner.emoji}</div>
            )}
            {category && (
              <div className="text-xs font-semibold text-foreground/80 line-clamp-2">
                {category.name}
              </div>
            )}
            {!category && (
              <div className="text-xs text-muted-foreground">Empty</div>
            )}
          </button>
        );
      })}
    </div>
  );
};
