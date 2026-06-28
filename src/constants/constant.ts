import { Card, Element } from '../app/type';

export const MAX_HP = 20;
export const HAND_LIMIT = 5;
export const DECK_SIZE = 20;

export const ELEMENTS: Record<Element, { strong: Element; weak: Element; icon: string; color: string; glow: string }> = {
  fire:   { strong: 'earth', weak: 'shadow', icon: 'fire',   color: '#e84430', glow: '#ff6644' },
  water:  { strong: 'shadow',weak: 'fire',   icon: 'water',  color: '#3088e8', glow: '#44aaff' },
  earth:  { strong: 'water', weak: 'fire',   icon: 'mountain',color: '#48a848', glow: '#66cc66' },
  shadow: { strong: 'fire',  weak: 'water',  icon: 'ghost',  color: '#8844cc', glow: '#aa66ee' },
};

export const CARD_NAMES: Record<Element, string[]> = {
  fire:   ['Inferno', 'Blaze', 'Ember', 'Pyre', 'Wildfire'],
  water:  ['Tide', 'Torrent', 'Surge', 'Ripple', 'Deluge'],
  earth:  ['Boulder', 'Quake', 'Thorn', 'Granite', 'Tremor'],
  shadow: ['Phantom', 'Void', 'Wraith', 'Shade', 'Eclipse'],
};

export const ADJ = ['Ancient', 'Fierce', 'Wild', 'Dark', 'Mystic', 'Primal', 'Storm', 'Iron', 'Crimson', 'Frost'];

export function generateCard(id: number, element: Element): Card {
  const names = CARD_NAMES[element];
  const adj = ADJ[Math.floor(Math.random() * ADJ.length)];
  return {
    id, element,
    name: `${adj} ${names[Math.floor(Math.random() * names.length)]}`,
    atk: Math.floor(Math.random() * 7) + 2, // 2-8
    def: Math.floor(Math.random() * 4) + 1, // 1-4
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  (['fire', 'water', 'earth', 'shadow'] as Element[]).forEach(el => {
    for (let i = 0; i < 5; i++) deck.push(generateCard(id++, el));
  });
  return shuffle(deck);
}