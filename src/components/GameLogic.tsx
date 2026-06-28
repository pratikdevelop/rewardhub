import { Card, Element } from '../app/type';
import { ELEMENTS } from '../constants/constant';

export function getAdvantage(atkEl: Element, defEl: Element): 'strong' | 'weak' | 'neutral' {
  if (ELEMENTS[atkEl].strong === defEl) return 'strong';
  if (ELEMENTS[atkEl].weak === defEl) return 'weak';
  return 'neutral';
}

export function calcDamage(attacker: Card, defender: Card) {
  let raw = attacker.atk - defender.def;
  if (raw < 1) raw = 1;
  const advantage = getAdvantage(attacker.element, defender.element);
  let mult = 1;
  if (advantage === 'strong') mult = 1.5;
  else if (advantage === 'weak') mult = 0.5;
  return { damage: Math.max(1, Math.round(raw * mult)), advantage, raw };
}

export function aiChooseCard(aiHand: Card[], playerCard: Card | null): number {
  if (aiHand.length === 0) return -1;
  
  if (playerCard && Math.random() < 0.75) {
    let bestIdx = -1, bestScore = -1;
    aiHand.forEach((c, i) => {
      const adv = getAdvantage(c.element, playerCard.element);
      let score = c.atk;
      if (adv === 'strong') score += 10;
      else if (adv === 'weak') score -= 5;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    });
    return bestIdx;
  }
  
  let bestIdx = 0;
  aiHand.forEach((c, i) => { if (c.atk > aiHand[bestIdx].atk) bestIdx = i; });
  return bestIdx;
}