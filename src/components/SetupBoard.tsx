import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { Player, Category, Square, Question } from "@/types/game";
import { toast } from "@/hooks/use-toast";

type SetupBoardProps = {
  onStartGame: (rows: number, cols: number, players: Player[], categories: Category[], squares: Square[]) => void;
  existingPlayers?: Player[];
  existingCategories?: Category[];
};

export const SetupBoard = ({ onStartGame, existingPlayers, existingCategories }: SetupBoardProps) => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [players, setPlayers] = useState<Player[]>(
    existingPlayers && existingPlayers.length > 0
      ? existingPlayers.map(p => ({ ...p, winStreak: 0 }))
      : [
          { id: '1', name: 'Player 1', emoji: '😎', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '2', name: 'Player 2', emoji: '🎮', color: 'player2', categoryId: null, winStreak: 0 }
        ]
  );
  const [categories, setCategories] = useState<Category[]>(existingCategories || []);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newQuestions, setNewQuestions] = useState('');
  const [questionImages, setQuestionImages] = useState<{ [key: number]: string }>({});
  const [showCategoryAssignment, setShowCategoryAssignment] = useState(false);

  const handleImageUpload = (lineIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setQuestionImages(prev => ({
        ...prev,
        [lineIndex]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Category name required", variant: "destructive" });
      return;
    }
    
    const questionLines = newQuestions.split('\n').filter(q => q.trim());
    const questions: Question[] = questionLines.map((text, idx) => ({ 
      id: `q${Date.now()}-${idx}`, 
      text: text.trim(),
      imageUrl: questionImages[idx]
    }));

    if (questions.length === 0) {
      toast({ title: "Add at least one question", variant: "destructive" });
      return;
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      questions
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewQuestions('');
    setQuestionImages({});
    toast({ title: "Category added!" });
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const addPlayer = () => {
    const nextId = (players.length + 1).toString();
    const colorIndex = (players.length % 6) + 1;
    setPlayers([...players, {
      id: nextId,
      name: `Player ${nextId}`,
      emoji: '🎯',
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
  };

  const updatePlayer = (id: string, field: 'name' | 'emoji' | 'categoryId', value: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value === '' ? null : value } : p));
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

    // Initialize squares
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

    // Randomly place players on the board
    const availableSquares = [...initialSquares];
    const squaresWithPlayers = players.map(player => {
      const randomIndex = Math.floor(Math.random() * availableSquares.length);
      const square = availableSquares[randomIndex];
      availableSquares.splice(randomIndex, 1);
      return {
        ...square,
        ownerId: player.id,
        categoryId: player.categoryId
      };
    });

    // Merge with remaining empty squares
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
              <Input 
                type="number" 
                min="3" 
                max="10" 
                value={rows} 
                onChange={(e) => setRows(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Columns</Label>
              <Input 
                type="number" 
                min="3" 
                max="10" 
                value={cols} 
                onChange={(e) => setCols(Number(e.target.value))}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Players</h2>
            <Button onClick={addPlayer} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </div>
          {players.map(player => (
            <div key={player.id} className="flex gap-4 items-end">
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <Label>Emoji</Label>
                  <Input 
                    value={player.emoji} 
                    onChange={(e) => updatePlayer(player.id, 'emoji', e.target.value)}
                    maxLength={2}
                  />
                </div>
                <div className="col-span-3">
                  <Label>Name</Label>
                  <Input 
                    value={player.name} 
                    onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                  />
                </div>
              </div>
              {players.length > 2 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removePlayer(player.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Categories</h2>
          
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., World Capitals"
              />
            </div>
            <div>
              <Label>Questions (one per line, with optional images)</Label>
              <textarea 
                className="w-full min-h-32 p-3 rounded-md border bg-background text-foreground"
                value={newQuestions}
                onChange={(e) => setNewQuestions(e.target.value)}
                placeholder="Paris&#10;London&#10;Tokyo&#10;..."
              />
              {newQuestions.split('\n').filter(q => q.trim()).length > 0 && (
                <div className="mt-2 space-y-2">
                  {newQuestions.split('\n').filter(q => q.trim()).map((question, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <span className="text-sm flex-1 truncate">{question}</span>
                      <Label htmlFor={`image-${idx}`} className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>
                            {questionImages[idx] ? '✓ Image' : 'Add Image'}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id={`image-${idx}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(idx, file);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={addCategory} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {categories.length > 0 && (
            <div className="space-y-2 mt-6">
              <h3 className="font-semibold">Added Categories:</h3>
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div>
                    <div className="font-semibold">{cat.name}</div>
                    <div className="text-sm text-muted-foreground">{cat.questions.length} questions</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeCategory(cat.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {!showCategoryAssignment ? (
          <Button onClick={handleContinue} size="lg" className="w-full text-lg">
            Continue
          </Button>
        ) : (
          <>
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Assign Categories to Players</h2>
              <p className="text-sm text-muted-foreground">
                Each player chooses their own category to defend
              </p>
              {players.map(player => (
                <div key={player.id} className="space-y-2">
                  <Label>{player.emoji} {player.name}</Label>
                  <select
                    className="w-full p-2 rounded-md border bg-background text-foreground"
                    value={player.categoryId || ''}
                    onChange={(e) => updatePlayer(player.id, 'categoryId', e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </Card>
            <Button onClick={startGame} size="lg" className="w-full text-lg">
              Start Game
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
