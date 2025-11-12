export type Player = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  categoryId: string | null;
  winStreak: number;
};

export type Question = {
  id: string;
  text: string;
};

export type Category = {
  id: string;
  name: string;
  questions: Question[];
};

export type Square = {
  id: string;
  row: number;
  col: number;
  categoryId: string | null;
  ownerId: string | null;
};

export type GameState = 'setup' | 'draft' | 'playing' | 'duel' | 'continue';

export type ActiveTurn = {
  playerId: string;
  territory: string[];
  availableChallenges: string[];
};

export type DuelState = {
  player1: Player;
  player2: Player;
  square: Square;
  category: Category;
  currentPlayer: string;
  player1Time: number;
  player2Time: number;
  currentQuestionIndex: number;
};
