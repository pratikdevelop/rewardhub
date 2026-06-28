export type Element = 'fire' | 'water' | 'earth' | 'shadow';

export interface Card {
  id: number;
  element: Element;
  name: string;
  atk: number;
  def: number;
}

export interface Player {
  hp: number;
  deck: Card[];
  hand: Card[];
  playedCard: Card | null;
}

export type GamePhase = 'player' | 'animating' | 'gameover';
export type TurnResult = 'win' | 'lose';

export interface GameStats {
  dealt: number;
  received: number;
  played: number;
  advantages: number;
  rounds: number;
}