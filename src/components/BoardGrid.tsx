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
  activePlayerId?: string;
};

export const BoardGrid = ({ squares, players, categories, onSquareClick, highlightedSquares = [], revealedPlayerIds = [], activePlayerId }: BoardGridProps) => {
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
        const isActivePlayerSquare = owner && owner.id === activePlayerId;
        
        const borderTop = isAdjacentToSameOwner(square, 'top');
        const borderRight = isAdjacentToSameOwner(square, 'right');
        const borderBottom = isAdjacentToSameOwner(square, 'bottom');
        const borderLeft = isAdjacentToSameOwner(square, 'left');
        
        // Determine background and outline colors
        // Streak (gold) takes priority over everything else
        let bgColor = undefined;
        let outlineColor = undefined;
        
        if (hasStreak) {
          // Gold for 3+ win streak - highest priority
          bgColor = 'hsl(var(--warning) / 0.5)';
          outlineColor = 'hsl(var(--warning))';
        } else if (isHighlighted) {
          // Duel options - bondi blue with black outline
          bgColor = 'rgba(0, 149, 182, 0.6)';
          outlineColor = 'rgb(0, 0, 0)';
        } else if (isActivePlayerSquare) {
          // Active player choosing - electric blue
          bgColor = 'rgba(125, 249, 255, 0.5)';
          outlineColor = 'rgb(125, 249, 255)';
        } else if (owner) {
          // Other owned squares - royal blue
          bgColor = 'rgba(65, 105, 225, 0.4)';
          outlineColor = 'rgb(65, 105, 225)';
        }
        
        return (
          <button
            key={square.id}
            onClick={() => onSquareClick(square)}
            className={cn(
              "aspect-square transition-all duration-200 relative",
              "flex flex-col items-center justify-center p-2 text-center",
              "hover:scale-105 hover:shadow-lg active:scale-95",
              !owner && "bg-neutral/20 border-2 border-neutral rounded-lg"
            )}
            style={{
              backgroundColor: bgColor,
              ...(owner && {
                outline: `6px solid ${outlineColor}`,
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
              }),
              ...(isHighlighted && {
                animation: 'pulse-blue 1.5s ease-in-out infinite',
              }),
            }}
          >
            {owner && (
              <div className="text-center w-full flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg mb-2">
                  {owner.imageUrl ? (
                    <img 
                      src={owner.imageUrl} 
                      alt={owner.name}
                      className="w-full h-full object-cover"
                      style={{ minWidth: '100%', minHeight: '100%' }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="text-base font-bold truncate px-1">{owner.name}</div>
              </div>
            )}
            {category && shouldShowCategory && (
              <div className="text-sm font-bold text-foreground/90 line-clamp-2 mt-1">
                {category.name}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
