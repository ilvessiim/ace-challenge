export type Player = {
  id: string;
  name: string;
  emoji: string;
  color: 'player1' | 'player2';
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

export type GameState = 'setup' | 'playing' | 'duel';

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
