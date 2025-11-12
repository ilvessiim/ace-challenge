import { Square, Player, Category } from "@/types/game";
import { cn } from "@/lib/utils";

type BoardGridProps = {
  squares: Square[];
  players: Player[];
  categories: Category[];
  onSquareClick: (square: Square) => void;
  highlightedSquares?: string[];
  revealedPlayerIds?: string[];
};

export const BoardGrid = ({ squares, players, categories, onSquareClick, highlightedSquares = [], revealedPlayerIds = [] }: BoardGridProps) => {
  const rows = Math.max(...squares.map(s => s.row)) + 1;
  const cols = Math.max(...squares.map(s => s.col)) + 1;

  const getSquareContent = (square: Square) => {
    const owner = players.find(p => p.id === square.ownerId);
    const category = categories.find(c => c.id === square.categoryId);
    
    return { owner, category };
  };

  const isAdjacentToSameOwner = (square: Square, direction: 'top' | 'right' | 'bottom' | 'left') => {
    if (!square.ownerId) return false;
    
    const deltas = {
      top: { row: -1, col: 0 },
      right: { row: 0, col: 1 },
      bottom: { row: 1, col: 0 },
      left: { row: 0, col: -1 }
    };
    
    const delta = deltas[direction];
    const adjacent = squares.find(s => 
      s.row === square.row + delta.row && 
      s.col === square.col + delta.col
    );
    
    return adjacent?.ownerId === square.ownerId;
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
        const shouldShowCategory = owner && revealedPlayerIds.includes(owner.id);
        
        const borderTop = isAdjacentToSameOwner(square, 'top');
        const borderRight = isAdjacentToSameOwner(square, 'right');
        const borderBottom = isAdjacentToSameOwner(square, 'bottom');
        const borderLeft = isAdjacentToSameOwner(square, 'left');
        
        return (
          <button
            key={square.id}
            onClick={() => onSquareClick(square)}
            className={cn(
              "aspect-square transition-all duration-200",
              "flex flex-col items-center justify-center p-2 text-center",
              "hover:scale-105 hover:shadow-lg active:scale-95",
              !owner && "bg-neutral/20 border-2 border-neutral rounded-lg",
              isHighlighted && "ring-4 ring-warning animate-pulse"
            )}
            style={{
              backgroundColor: owner ? `hsl(var(--${owner.color}) / 0.2)` : undefined,
              ...(owner && {
                borderTopWidth: borderTop ? '0' : '4px',
                borderRightWidth: borderRight ? '0' : '4px',
                borderBottomWidth: borderBottom ? '0' : '4px',
                borderLeftWidth: borderLeft ? '0' : '4px',
                borderColor: `hsl(var(--${owner.color}))`,
                borderStyle: 'solid',
                borderTopLeftRadius: !borderTop && !borderLeft ? '0.75rem' : '0',
                borderTopRightRadius: !borderTop && !borderRight ? '0.75rem' : '0',
                borderBottomLeftRadius: !borderBottom && !borderLeft ? '0.75rem' : '0',
                borderBottomRightRadius: !borderBottom && !borderRight ? '0.75rem' : '0',
              })
            }}
          >
            {owner && (
              <div className="text-2xl mb-1">{owner.emoji}</div>
            )}
            {category && shouldShowCategory && (
              <div className="text-xs font-semibold text-foreground/80 line-clamp-2">
                {category.name}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
