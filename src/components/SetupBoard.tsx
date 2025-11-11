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
};

export const SetupBoard = ({ onStartGame }: SetupBoardProps) => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', emoji: '😎', color: 'player1' },
    { id: '2', name: 'Player 2', emoji: '🎮', color: 'player2' }
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newQuestions, setNewQuestions] = useState('');

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Category name required", variant: "destructive" });
      return;
    }
    
    const questions: Question[] = newQuestions
      .split('\n')
      .filter(q => q.trim())
      .map((text, idx) => ({ id: `q${Date.now()}-${idx}`, text: text.trim() }));

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
    toast({ title: "Category added!" });
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updatePlayer = (id: string, field: 'name' | 'emoji', value: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleStartGame = () => {
    if (categories.length === 0) {
      toast({ title: "Add at least one category", variant: "destructive" });
      return;
    }

    const squares: Square[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        squares.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          categoryId: null,
          ownerId: null
        });
      }
    }

    onStartGame(rows, cols, players, categories, squares);
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
          <h2 className="text-2xl font-bold">Players</h2>
          {players.map(player => (
            <div key={player.id} className="grid grid-cols-3 gap-4">
              <div>
                <Label>Emoji</Label>
                <Input 
                  value={player.emoji} 
                  onChange={(e) => updatePlayer(player.id, 'emoji', e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Name</Label>
                <Input 
                  value={player.name} 
                  onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                />
              </div>
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
              <Label>Questions (one per line)</Label>
              <textarea 
                className="w-full min-h-32 p-3 rounded-md border bg-background text-foreground"
                value={newQuestions}
                onChange={(e) => setNewQuestions(e.target.value)}
                placeholder="Paris&#10;London&#10;Tokyo&#10;..."
              />
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

        <Button onClick={handleStartGame} size="lg" className="w-full text-lg">
          Start Game
        </Button>
      </div>
    </div>
  );
};
