import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, X, User } from "lucide-react";
import { Player, Category, Square, Question } from "@/types/game";
import { toast } from "@/hooks/use-toast";

type SetupBoardProps = {
  onStartGame: (rows: number, cols: number, players: Player[], categories: Category[], squares: Square[]) => void;
  existingPlayers?: Player[];
  existingCategories?: Category[];
};

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const SetupBoard = ({ onStartGame, existingPlayers, existingCategories }: SetupBoardProps) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [players, setPlayers] = useState<Player[]>(
    existingPlayers && existingPlayers.length > 0
      ? existingPlayers.map(p => ({ ...p, winStreak: 0 }))
      : [
          { id: '1', name: 'Player 1', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '2', name: 'Player 2', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '3', name: 'Player 3', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '4', name: 'Player 4', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '5', name: 'Player 5', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '6', name: 'Player 6', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '7', name: 'Player 7', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '8', name: 'Player 8', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '9', name: 'Player 9', emoji: '👤', color: 'player1', categoryId: null, winStreak: 0 }
        ]
  );
  const [categories, setCategories] = useState<Category[]>(existingCategories || []);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [questionImages, setQuestionImages] = useState<{ [key: number]: string }>({});
  const [playerImages, setPlayerImages] = useState<{ [key: string]: string }>({});
  const [nextQuestionId, setNextQuestionId] = useState(0);
  const [showCategoryAssignment, setShowCategoryAssignment] = useState(false);

  const handleMultipleImageUpload = (files: FileList) => {
    const startId = nextQuestionId;
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        const id = startId + index;
        setQuestionImages(prev => ({
          ...prev,
          [id]: imageUrl
        }));
      };
      reader.readAsDataURL(file);
    });
    setNextQuestionId(startId + files.length);
  };

  const handlePlayerImageUpload = (playerId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setPlayerImages(prev => ({
        ...prev,
        [playerId]: imageUrl
      }));
      setPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, imageUrl } : p
      ));
    };
    reader.readAsDataURL(file);
  };

  const removeQuestion = (id: number) => {
    setQuestionImages(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Category name required", variant: "destructive" });
      return;
    }
    
    const questionIds = Object.keys(questionImages).map(Number);
    
    if (questionIds.length === 0) {
      toast({ title: "Upload at least one photo", variant: "destructive" });
      return;
    }

    const questions: Question[] = questionIds.map(id => ({
      id: `q${Date.now()}-${id}`,
      text: '',
      imageUrl: questionImages[id]
    }));

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      questions
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setQuestionImages({});
    setNextQuestionId(0);
    toast({ title: "Category added!" });
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const addPlayer = () => {
    const nextId = (players.length + 1).toString();
    const colorIndex = (players.length % 9) + 1;
    setPlayers([...players, {
      id: nextId,
      name: `Player ${nextId}`,
      emoji: '👤',
      color: `player${colorIndex}`,
      categoryId: null,
      winStreak: 0
    }]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2) {
      toast({ title: "Need at least 2 players", variant: "destructive" });
      return;
    }
    setPlayers(players.filter(p => p.id !== id));
    setPlayerImages(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  const updatePlayerCategory = (id: string, categoryId: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, categoryId: categoryId === '' ? null : categoryId } : p));
  };

  const handleContinue = () => {
    if (categories.length === 0) {
      toast({ title: "Add at least one category", variant: "destructive" });
      return;
    }
    setShowCategoryAssignment(true);
  };

  const startGame = () => {
    if (players.length < 2) {
      toast({ title: "Add at least 2 players", variant: "destructive" });
      return;
    }

    if (categories.length < 2) {
      toast({ title: "Add at least 2 categories", variant: "destructive" });
      return;
    }

    const hasUnassignedPlayers = players.some(p => !p.categoryId);
    if (hasUnassignedPlayers) {
      toast({ title: "All players must select a category", variant: "destructive" });
      return;
    }


    const initialSquares: Square[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        initialSquares.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          categoryId: null,
          ownerId: null
        });
      }
    }

    // Prioritize: corners first, then bottom rows, then remaining squares
    const getSquarePriority = (sq: Square): number => {
      const isTopLeft = sq.row === 0 && sq.col === 0;
      const isTopRight = sq.row === 0 && sq.col === cols - 1;
      const isBottomLeft = sq.row === rows - 1 && sq.col === 0;
      const isBottomRight = sq.row === rows - 1 && sq.col === cols - 1;
      
      // Corners get highest priority (lowest number)
      if (isTopLeft || isTopRight || isBottomLeft || isBottomRight) {
        return 0;
      }
      
      // Bottom rows get next priority (lower row number = higher in grid = lower priority for filling)
      // So we want higher row numbers (bottom) to have lower priority values
      const rowPriority = (rows - 1 - sq.row) * 10; // Bottom rows first
      
      return 100 + rowPriority;
    };

    // Sort squares by priority (lower priority number = better for placing players)
    const prioritizedSquares = [...initialSquares].sort((a, b) => 
      getSquarePriority(a) - getSquarePriority(b)
    );

    // Take the first N squares for players (N = number of players)
    const squaresForPlayers = prioritizedSquares.slice(0, players.length);
    
    // Shuffle which player gets which of the prioritized squares
    const shuffledPlayerSquares = shuffleArray(squaresForPlayers);
    
    const squaresWithPlayers = players.map((player, index) => {
      const square = shuffledPlayerSquares[index];
      return {
        ...square,
        ownerId: player.id,
        categoryId: player.categoryId
      };
    });

    const finalSquares = initialSquares.map(sq => {
      const playerSquare = squaresWithPlayers.find(ps => ps.id === sq.id);
      return playerSquare || sq;
    });

    onStartGame(rows, cols, players, categories, finalSquares);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            THE FLOOR
          </h1>
          <p className="text-muted-foreground">Setup your game board</p>
        </div>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Board Size</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rows</Label>
              <Input type="number" min="3" max="10" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
            </div>
            <div>
              <Label>Columns</Label>
              <Input type="number" min="3" max="10" value={cols} onChange={(e) => setCols(Number(e.target.value))} />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Players</h2>
            <Button onClick={addPlayer} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Player</Button>
          </div>
          {players.map(player => (
            <div key={player.id} className="flex gap-4 items-center p-3 bg-muted/30 rounded-lg">
              <Label htmlFor={`player-image-${player.id}`} className="cursor-pointer shrink-0">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border hover:border-primary transition-colors">
                  {player.imageUrl ? (
                    <img 
                      src={player.imageUrl} 
                      alt={player.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <input 
                  id={`player-image-${player.id}`} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => { 
                    const file = e.target.files?.[0]; 
                    if (file) { 
                      handlePlayerImageUpload(player.id, file); 
                    } 
                  }} 
                />
              </Label>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Player Name</Label>
                <Input 
                  value={player.name} 
                  onChange={(e) => updatePlayerName(player.id, e.target.value)} 
                  placeholder="Enter name"
                />
              </div>
              {players.length > 2 && (
                <Button variant="ghost" size="sm" onClick={() => removePlayer(player.id)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Click on the avatar to upload a profile picture</p>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Categories</h2>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., World Capitals" />
            </div>
            <div>
              <Label className="mb-2 block">Upload Photos (each photo becomes a question)</Label>
              <Label htmlFor="multi-image-upload" className="cursor-pointer">
                <Button type="button" variant="outline" className="w-full" asChild>
                  <span><Plus className="w-4 h-4 mr-2" />Upload Multiple Photos</span>
                </Button>
              </Label>
              <input 
                id="multi-image-upload" 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={(e) => { 
                  const files = e.target.files; 
                  if (files && files.length > 0) { 
                    handleMultipleImageUpload(files); 
                  } 
                }} 
              />
            </div>
            {Object.keys(questionImages).length > 0 && (
              <div>
                <Label className="mb-2 block">Uploaded Photos ({Object.keys(questionImages).length})</Label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(questionImages).map(key => {
                    const id = Number(key);
                    return (
                      <div key={id} className="relative group">
                        <img src={questionImages[id]} alt="Question" className="w-full aspect-square rounded object-cover" />
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeQuestion(id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <Button onClick={addCategory} className="w-full" disabled={!newCategoryName.trim() || Object.keys(questionImages).length === 0}>
              <Plus className="w-4 h-4 mr-2" />Add Category
            </Button>
          </div>

          {categories.length > 0 && (
            <div className="space-y-2 mt-6">
              <h3 className="font-semibold">Added Categories:</h3>
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div><div className="font-semibold">{cat.name}</div><div className="text-sm text-muted-foreground">{cat.questions.length} questions</div></div>
                  <Button variant="ghost" size="sm" onClick={() => removeCategory(cat.id)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {!showCategoryAssignment ? (
          <Button onClick={handleContinue} size="lg" className="w-full text-lg">Continue</Button>
        ) : (
          <>
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Assign Categories to Players</h2>
              <p className="text-sm text-muted-foreground">Each player chooses their own category to defend</p>
              {players.map(player => (
                <div key={player.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {player.imageUrl ? (
                      <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">{player.name}</Label>
                    <select 
                      className="w-full p-2 rounded-md border bg-background text-foreground" 
                      value={player.categoryId || ''} 
                      onChange={(e) => updatePlayerCategory(player.id, e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </Card>
            <Button onClick={startGame} size="lg" className="w-full text-lg">Start Game</Button>
          </>
        )}
      </div>
    </div>
  );
};
