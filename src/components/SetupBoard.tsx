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
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [players, setPlayers] = useState<Player[]>(
    existingPlayers && existingPlayers.length > 0
      ? existingPlayers.map(p => ({ ...p, winStreak: 0 }))
      : [
          { id: '1', name: 'Player 1', emoji: '😎', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '2', name: 'Player 2', emoji: '🎮', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '3', name: 'Player 3', emoji: '👍', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '4', name: 'Player 4', emoji: '🐶', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '5', name: 'Player 5', emoji: '💀', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '6', name: 'Player 6', emoji: '🐔', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '7', name: 'Player 7', emoji: '🐍', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '8', name: 'Player 8', emoji: '🐣', color: 'player1', categoryId: null, winStreak: 0 },
          { id: '9', name: 'Player 9', emoji: '☀️', color: 'player1', categoryId: null, winStreak: 0 }
        ]
  );
  const [categories, setCategories] = useState<Category[]>(existingCategories || []);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newQuestionTexts, setNewQuestionTexts] = useState<{ [key: number]: string }>({});
  const [questionImages, setQuestionImages] = useState<{ [key: number]: string }>({});
  const [playerImages, setPlayerImages] = useState<{ [key: string]: string }>({});
  const [nextQuestionId, setNextQuestionId] = useState(0);
  const [showCategoryAssignment, setShowCategoryAssignment] = useState(false);

  const handleQuestionImageUpload = (questionId: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setQuestionImages(prev => ({
        ...prev,
        [questionId]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePlayerImageUpload = (playerId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setPlayerImages(prev => ({
        ...prev,
        [playerId]: imageUrl
      }));
      // Immediately set the imageUrl on the player
      setPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, imageUrl } : p
      ));
    };
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    const id = nextQuestionId;
    setNextQuestionId(id + 1);
    setNewQuestionTexts(prev => ({ ...prev, [id]: '' }));
  };

  const removeQuestion = (id: number) => {
    setNewQuestionTexts(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setQuestionImages(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const updateQuestionText = (id: number, text: string) => {
    setNewQuestionTexts(prev => ({ ...prev, [id]: text }));
  };

  
  
  const addCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Category name required", variant: "destructive" });
      return;
    }
    
    const questionIds = Object.keys(newQuestionTexts).map(Number);
    const questions: Question[] = [];
    
    questionIds.forEach(id => {
      const text = newQuestionTexts[id]?.trim() || '';
      const imageUrl = questionImages[id];
      
      if (text || imageUrl) {
        questions.push({
          id: `q${Date.now()}-${id}`,
          text,
          imageUrl
        });
      }
    });

    if (questions.length === 0) {
      toast({ title: "Add at least one question with text or image", variant: "destructive" });
      return;
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      questions
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewQuestionTexts({});
    setQuestionImages({});
    setNextQuestionId(0);
    toast({ title: "Category added!" });
  };

  const createHardcodedCategory = () => {
    setNewCategoryName("Animals");
    
    setNewQuestionTexts({
      0: "What is this animal?",
      1: "Can it fly?",
    });
    
    setQuestionImages({
      0: "https://example.com/dog.jpg",
    });
    
    setNextQuestionId(2);
    
    addCategory();
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

  const applyPlayerImage = (id: string) => {
    const imageUrl = playerImages[id];
    if (imageUrl) {
      setPlayers(players.map(p => p.id === id ? { ...p, imageUrl } : p));
    }
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
            <div key={player.id} className="space-y-2">
              <div className="flex gap-4 items-end">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div><Label>Emoji</Label><Input value={player.emoji} onChange={(e) => updatePlayer(player.id, 'emoji', e.target.value)} maxLength={2} /></div>
                  <div className="col-span-3"><Label>Name</Label><Input value={player.name} onChange={(e) => updatePlayer(player.id, 'name', e.target.value)} /></div>
                </div>
                {players.length > 2 && <Button variant="ghost" size="sm" onClick={() => removePlayer(player.id)}><X className="w-4 h-4" /></Button>}
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`player-image-${player.id}`} className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>{player.imageUrl || playerImages[player.id] ? '✓ Picture Set' : 'Upload Picture (Optional)'}</span>
                  </Button>
                </Label>
                <input id={`player-image-${player.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { handlePlayerImageUpload(player.id, file); } }} />
                {(player.imageUrl || playerImages[player.id]) && <img src={player.imageUrl || playerImages[player.id]} alt={player.name} className="w-10 h-10 rounded-full object-cover" />}
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Categories</h2>
          <div className="space-y-4">
            <div><Label>Category Name</Label><Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., World Capitals" /></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Questions (text or image)</Label>
                <Button onClick={addQuestion} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Question</Button>
              </div>
              {Object.keys(newQuestionTexts).length === 0 && <p className="text-sm text-muted-foreground">Click “Add Question” to start adding questions</p>}
              <div className="space-y-2">
                {Object.keys(newQuestionTexts).map(key => {
                  const id = Number(key);
                  return (
                    <div key={id} className="flex items-start gap-2 p-3 bg-muted/50 rounded">
                      <div className="flex-1 space-y-2">
                        <Input placeholder="Question text (optional)" value={newQuestionTexts[id] || ''} onChange={(e) => updateQuestionText(id, e.target.value)} />
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`q-image-${id}`} className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" asChild><span>{questionImages[id] ? '✓ Image' : 'Upload Image (Optional)'}</span></Button>
                          </Label>
                          <input id={`q-image-${id}`} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleQuestionImageUpload(id, file); }} />
                          {questionImages[id] && <img src={questionImages[id]} alt="Question" className="w-12 h-12 rounded object-cover" />}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(id)}><X className="w-4 h-4" /></Button>
                    </div>
                  );
                })}
              </div>
            </div>
            <Button onClick={createHardcodedCategory}>Create Hardcoded Category</Button>
            <Button onClick={addCategory} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Category</Button>
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
                <div key={player.id} className="space-y-2">
                  <Label>{player.emoji} {player.name}</Label>
                  <select className="w-full p-2 rounded-md border bg-background text-foreground" value={player.categoryId || ''} onChange={(e) => updatePlayer(player.id, 'categoryId', e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
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
