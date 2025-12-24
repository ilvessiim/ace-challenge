import { Square, Player, Category } from "@/types/game";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

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
      className="grid gap-0 w-full max-w-5xl mx-auto p-4"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
      }}
    >
      {squares.map((square) => {
        const { owner, category } = getSquareContent(square);
        const isHighlighted = highlightedSquares.includes(square.id);
        const shouldShowCategory = owner && revealedPlayerIds.includes(owner.id);
        const hasStreak = (owner?.winStreak || 0) >= 3;
        
        const borderTop = isAdjacentToSameOwner(square, 'top');
        const borderRight = isAdjacentToSameOwner(square, 'right');
        const borderBottom = isAdjacentToSameOwner(square, 'bottom');
        const borderLeft = isAdjacentToSameOwner(square, 'left');
        
        return (
          <button
            key={square.id}
            onClick={() => onSquareClick(square)}
            className={cn(
              "aspect-square transition-all duration-200 relative",
              "flex flex-col items-center justify-center p-2 text-center",
              "hover:scale-105 hover:shadow-lg active:scale-95",
              !owner && "bg-neutral/20 border-2 border-neutral rounded-lg",
              isHighlighted && "ring-4 ring-warning animate-pulse"
            )}
            style={{
              backgroundColor: hasStreak
                ? 'hsl(var(--warning) / 0.4)'
                : owner 
                  ? `hsl(var(--${owner.color}) / 0.2)` 
                  : undefined,
              ...(owner && {
                outline: `6px solid ${hasStreak ? 'hsl(var(--warning))' : `hsl(var(--${owner.color}))`}`,
                outlineOffset: '-6px',
                marginTop: borderTop ? '-6px' : '0',
                marginRight: borderRight ? '-6px' : '0',
                marginBottom: borderBottom ? '-6px' : '0',
                marginLeft: borderLeft ? '-6px' : '0',
                borderTopLeftRadius: !borderTop && !borderLeft ? '0.75rem' : '0',
                borderTopRightRadius: !borderTop && !borderRight ? '0.75rem' : '0',
                borderBottomLeftRadius: !borderBottom && !borderLeft ? '0.75rem' : '0',
                borderBottomRightRadius: !borderBottom && !borderRight ? '0.75rem' : '0',
                zIndex: 1,
              })
            }}
          >
            {owner && (
              <div className="text-center w-full flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-3 border-background shadow-lg mb-2">
                  {owner.imageUrl ? (
                    <img 
                      src={owner.imageUrl} 
                      alt={owner.name}
                      className="w-full h-full object-cover"
                      style={{ minWidth: '100%', minHeight: '100%' }}
                    />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div className="text-sm font-semibold truncate px-1">{owner.name}</div>
              </div>
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
