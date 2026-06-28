
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// --- TYPES ---
type Element = 'fire' | 'water' | 'earth' | 'shadow';

interface Card {
  id: number;
  element: Element;
  name: string;
  atk: number;
  def: number;
}

interface Player {
  hp: number;
  deck: Card[];
  hand: Card[];
  playedCard: Card | null;
}

type GamePhase = 'player' | 'animating' | 'gameover';

interface GameStats {
  dealt: number;
  received: number;
  played: number;
  advantages: number;
  rounds: number;
}

// --- CONSTANTS ---
const MAX_HP = 20;
const HAND_LIMIT = 5;

const ELEMENTS: Record<Element, { strong: Element; weak: Element; color: string; icon: string }> = {
  fire:   { strong: 'earth', weak: 'shadow', color: '#e84430', icon: '🔥' },
  water:  { strong: 'shadow',weak: 'fire',   color: '#3088e8', icon: '💧' },
  earth:  { strong: 'water', weak: 'fire',   color: '#48a848', icon: '⛰️' },
  shadow: { strong: 'fire',  weak: 'water',  color: '#8844cc', icon: '👻' },
};

const CARD_NAMES: Record<Element, string[]> = {
  fire:   ['Inferno', 'Blaze', 'Ember', 'Pyre', 'Wildfire'],
  water:  ['Tide', 'Torrent', 'Surge', 'Ripple', 'Deluge'],
  earth:  ['Boulder', 'Quake', 'Thorn', 'Granite', 'Tremor'],
  shadow: ['Phantom', 'Void', 'Wraith', 'Shade', 'Eclipse'],
};

const ADJ = ['Ancient', 'Fierce', 'Wild', 'Dark', 'Mystic', 'Primal', 'Storm', 'Iron', 'Crimson', 'Frost'];

const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(400, width - 32);

// --- HELPERS ---
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  (['fire', 'water', 'earth', 'shadow'] as Element[]).forEach(el => {
    for (let i = 0; i < 5; i++) {
      const names = CARD_NAMES[el];
      const adj = ADJ[Math.floor(Math.random() * ADJ.length)];
      deck.push({
        id: id++, element: el,
        name: `${adj} ${names[Math.floor(Math.random() * names.length)]}`,
        atk: Math.floor(Math.random() * 7) + 2,
        def: Math.floor(Math.random() * 4) + 1,
      });
    }
  });
  return shuffle(deck);
}

function getAdvantage(atkEl: Element, defEl: Element): 'strong' | 'weak' | 'neutral' {
  if (ELEMENTS[atkEl].strong === defEl) return 'strong';
  if (ELEMENTS[atkEl].weak === defEl) return 'weak';
  return 'neutral';
}

function calcDamage(attacker: Card, defender: Card) {
  let raw = attacker.atk - defender.def;
  if (raw < 1) raw = 1;
  const advantage = getAdvantage(attacker.element, defender.element);
  let mult = 1;
  if (advantage === 'strong') mult = 1.5;
  else if (advantage === 'weak') mult = 0.5;
  return { damage: Math.max(1, Math.round(raw * mult)), advantage };
}

function aiChooseCard(aiHand: Card[], playerCard: Card | null): number {
  if (aiHand.length === 0) return -1;
  if (playerCard && Math.random() < 0.75) {
    let bestIdx = -1, bestScore = -1;
    aiHand.forEach((c, i) => {
      const adv = getAdvantage(c.element, playerCard.element);
      let score = c.atk + (adv === 'strong' ? 10 : 0) - (adv === 'weak' ? 5 : 0);
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    });
    return bestIdx;
  }
  let bestIdx = 0;
  aiHand.forEach((c, i) => { if (c.atk > aiHand[bestIdx].atk) bestIdx = i; });
  return bestIdx;
}

// --- SUB-COMPONENTS ---
const PlayingCard = ({ card, size = 72 }: { card: Card; size?: number }) => {
  const el = ELEMENTS[card.element];
  return (
    <View style={[styles.cardContainer, { width: size, height: size * 1.4, borderColor: `${el.color}88` }]}>
      <View style={[styles.cardBorderTop, { backgroundColor: el.color }]} />
      <Text style={[styles.cardIcon, { top: 6 * (size/72), left: 6 * (size/72), fontSize: 13 * (size/72) }]}>{el.icon}</Text>
      <Text style={[styles.cardName, { fontSize: 9 * (size/72), top: 22 * (size/72) }]} numberOfLines={1}>{card.name}</Text>
      <View style={[styles.cardStats, { bottom: 14 * (size/72) }]}>
        <Text style={{ color: '#ff8866', fontSize: 13 * (size/72), fontWeight: '700' }}>⚔️{card.atk}</Text>
        <Text style={{ color: '#66aaff', fontSize: 13 * (size/72), fontWeight: '700' }}>🛡️{card.def}</Text>
      </View>
    </View>
  );
};

const HealthBar = ({ hp, maxHp }: { hp: number; maxHp: number }) => {
  const pct = (hp / maxHp) * 100;
  const color = pct > 50 ? '#48a848' : pct > 25 ? '#c9a84c' : '#e84430';
  return (
    <View style={styles.hpOuter}>
      <View style={[styles.hpInner, { width: `${pct}%`, backgroundColor: color }]}>
        <View style={styles.hpShine} />
      </View>
    </View>
  );
};

// --- INSTRUCTIONS POPUP ---
const InstructionsPopup = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} animationType="fade" transparent={true}>
    <View style={popupStyles.overlay}>
      <View style={popupStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Top Graphic Area */}
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop' }}
            style={popupStyles.imageBg}
            imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
          >
            <View style={popupStyles.imageOverlay}>
              <Text style={popupStyles.title}>ARCANE DUEL</Text>
              <Text style={popupStyles.subtitle}>CARD BATTLE GUIDE</Text>
            </View>
          </ImageBackground>

          <View style={popupStyles.content}>
            {/* Cycle Image/Graphic */}
            <View style={popupStyles.cycleBox}>
              <Text style={popupStyles.cycleRow}>🔥 {'>'} ⛰️ {'>'} 💧 {'>'} 👻 {'>'} 🔥</Text>
              <Text style={popupStyles.cycleText}>Memorize the elemental cycle. Each element defeats the next one!</Text>
            </View>

            {/* Rules */}
            <Text style={popupStyles.sectionTitle}>HOW TO PLAY</Text>
            
            <View style={popupStyles.ruleRow}>
              <Text style={popupStyles.ruleIcon}>🃏</Text>
              <Text style={popupStyles.ruleText}>You start with 5 cards and 20 HP.</Text>
            </View>

            <View style={popupStyles.ruleRow}>
              <Text style={popupStyles.ruleIcon}>👆</Text>
              <Text style={popupStyles.ruleText}>Tap a card from your hand to play it against the AI.</Text>
            </View>

            <View style={popupStyles.ruleRow}>
              <Text style={popupStyles.ruleIcon}>⚔️</Text>
              <Text style={popupStyles.ruleText}>Your Attack (⚔️) minus Enemy Defense (🛡️) equals base damage.</Text>
            </View>

            <View style={popupStyles.ruleRow}>
              <Text style={popupStyles.ruleIcon}>✨</Text>
              <Text style={popupStyles.ruleText}>If your element beats the enemy's element, you deal +50% BONUS damage!</Text>
            </View>

            <View style={popupStyles.ruleRow}>
              <Text style={popupStyles.ruleIcon}>💀</Text>
              <Text style={popupStyles.ruleText}>Reduce the enemy's HP to 0 to win coins!</Text>
            </View>

            {/* Start Button */}
            <TouchableOpacity 
              style={popupStyles.button} 
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClose();
              }}
            >
              <Text style={popupStyles.buttonText}>BEGIN DUEL</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#12122a',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  imageBg: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    backgroundColor: 'rgba(8,8,16,0.7)',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: '#f0d078',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    color: '#e8dcc8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  cycleBox: {
    backgroundColor: 'rgba(136,68,204,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(136,68,204,0.3)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  cycleRow: {
    color: '#e8dcc8',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cycleText: {
    color: '#aa66ee',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#c9a84c',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 12,
  },
  ruleIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  ruleText: {
    color: '#e8dcc8',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#c9a84c',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#080810',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});


// --- MAIN SCREEN ---
export default function ArcaneDuel() {
  const [showInstructions, setShowInstructions] = useState(true); // Starts true to show immediately
  const [phase, setPhase] = useState<GamePhase>('player');
  const [round, setRound] = useState(1);
  const [player, setPlayer] = useState<Player>({ hp: MAX_HP, deck: [], hand: [], playedCard: null });
  const [ai, setAi] = useState<Player>({ hp: MAX_HP, deck: [], hand: [], playedCard: null });
  const [stats, setStats] = useState<GameStats>({ dealt: 0, received: 0, played: 0, advantages: 0, rounds: 1 });
  
  const [pSlotCard, setPSlotCard] = useState<Card | null>(null);
  const [aSlotCard, setASlotCard] = useState<Card | null>(null);
  const [showAiBack, setShowAiBack] = useState(false);
  const [pDmgVal, setPDmgVal] = useState(0);
  const [aDmgVal, setADmgVal] = useState(0);
  const [battleText, setBattleText] = useState('');
  
  const slideFromBottom = useState(new Animated.Value(80))[0];
  const slideFromTop = useState(new Animated.Value(-80))[0];
  const pSlotOpacity = useState(new Animated.Value(0))[0];
  const aSlotOpacity = useState(new Animated.Value(0))[0];
  const pDmgY = useState(new Animated.Value(0))[0];
  const pDmgOpacity = useState(new Animated.Value(0))[0];
  const aDmgY = useState(new Animated.Value(0))[0];
  const aDmgOpacity = useState(new Animated.Value(0))[0];

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const drawCards = (target: Player, count: number): Player => {
    const p = { ...target, hand: [...target.hand], deck: [...target.deck] };
    for (let i = 0; i < count; i++) {
      if (p.hand.length >= HAND_LIMIT || p.deck.length === 0) break;
      p.hand.push(p.deck.pop()!);
    }
    return p;
  };

  const initGame = useCallback(() => {
    let p: Player = { hp: MAX_HP, deck: generateDeck(), hand: [], playedCard: null };
    let a: Player = { hp: MAX_HP, deck: generateDeck(), hand: [], playedCard: null };
    p = drawCards(p, HAND_LIMIT);
    a = drawCards(a, HAND_LIMIT);
    setPlayer(p); setAi(a); setRound(1);
    setStats({ dealt: 0, received: 0, played: 0, advantages: 0, rounds: 1 });
    setPhase('player'); setPSlotCard(null); setASlotCard(null); setBattleText('');
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const animateDamage = (isPlayer: boolean, value: number) => {
    const yVal = isPlayer ? pDmgY : aDmgY;
    const opVal = isPlayer ? pDmgOpacity : aDmgOpacity;
    if (isPlayer) setPDmgVal(value); else setADmgVal(value);
    yVal.setValue(0); opVal.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(yVal, { toValue: -60, duration: 800, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opVal, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(opVal, { toValue: 0, duration: 650, useNativeDriver: true }),
        ])
      ])
    ]).start();
  };

  const handlePlayCard = async (index: number) => {
    if (phase !== 'player') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('animating');

    let currPlayer = { ...player, hand: [...player.hand] };
    let currAi = { ...ai, hand: [...ai.hand] };
    
    const pCard = currPlayer.hand.splice(index, 1)[0];
    currPlayer.playedCard = pCard;
    setPlayer(currPlayer);
    
    setPSlotCard(pCard);
    slideFromBottom.setValue(80); pSlotOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(slideFromBottom, { toValue: 0, useNativeDriver: true }),
      Animated.timing(pSlotOpacity, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();

    await delay(400);

    const aiIdx = aiChooseCard(currAi.hand, pCard);
    if (aiIdx >= 0) {
      const aCard = currAi.hand.splice(aiIdx, 1)[0];
      currAi.playedCard = aCard;
      setAi(currAi);
      setShowAiBack(true);
      slideFromTop.setValue(-80); aSlotOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(slideFromTop, { toValue: 0, useNativeDriver: true }),
        Animated.timing(aSlotOpacity, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(400);
      setShowAiBack(false); setASlotCard(aCard);
      await delay(300);
    }

    await delay(200);
    let newStats = { ...stats, played: stats.played + 1 };
    
    if (pCard && currAi.playedCard) {
      const pRes = calcDamage(pCard, currAi.playedCard);
      const aRes = calcDamage(currAi.playedCard, pCard);

      if (pRes.advantage === 'strong') {
        setBattleText('SUPER EFFECTIVE'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); newStats.advantages++;
      } else if (pRes.advantage === 'weak') {
        setBattleText('NOT EFFECTIVE');
      }
      setTimeout(() => setBattleText(''), 800);

      await delay(300);
      currPlayer.hp = Math.max(0, currPlayer.hp - aRes.damage);
      currAi.hp = Math.max(0, currAi.hp - pRes.damage);
      newStats.dealt += pRes.damage; newStats.received += aRes.damage;

      animateDamage(false, pRes.damage);
      await delay(150);
      animateDamage(true, aRes.damage);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (!currAi.playedCard) {
      currAi.hp = Math.max(0, currAi.hp - 2); newStats.dealt += 2;
      animateDamage(false, 2); setBattleText('NO CARDS'); setTimeout(() => setBattleText(''), 800);
    }

    setPlayer(currPlayer); setAi(currAi); setStats(newStats);
    await delay(1000);

    setPSlotCard(null); setASlotCard(null); setShowAiBack(false);

    if (currPlayer.hp <= 0 || currAi.hp <= 0) {
      await delay(300);
      Haptics.notificationAsync(currPlayer.hp <= 0 ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Success);
      setPhase('gameover');
      Alert.alert(
        currPlayer.hp <= 0 ? 'DEFEAT' : 'VICTORY',
        `Rounds: ${newStats.rounds}\nDamage Dealt: ${newStats.dealt}\nAdvantages: ${newStats.advantages}`,
        [{ text: 'DUEL AGAIN', onPress: initGame }]
      );
      return;
    }

    const updatedP = drawCards(currPlayer, 1);
    const updatedA = drawCards(currAi, 1);
    setPlayer({ ...updatedP, playedCard: null });
    setAi({ ...updatedA, playedCard: null });
    
    const newRound = round + 1;
    setRound(newRound);
    newStats.rounds = newRound;
    setStats(newStats);

    await delay(200);
    setPhase('player');
  };

  const renderPlayerHand = () => {
    const count = player.hand.length;
    if (count === 0) return <Text style={styles.emptyHand}>No cards left</Text>;
    const gap = count > 4 ? 4 : 6;
    let cardW = Math.min(72, (MAX_WIDTH - (count - 1) * gap) / count);
    cardW = Math.max(48, cardW);

    return (
      <View style={styles.handContainer}>
        {player.hand.map((card, i) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.7}
            style={[styles.handCardWrap, { width: cardW, height: cardW * 1.4, marginLeft: i === 0 ? 0 : gap }]}
            onPress={() => handlePlayCard(i)}
            disabled={phase !== 'player'}
          >
            <PlayingCard card={card} size={cardW} />
            {phase === 'player' && <View style={[styles.playableGlow, { borderColor: ELEMENTS[card.element].color }]} />}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* INSTRUCTIONS MODAL */}
      <InstructionsPopup 
        visible={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />

      {/* AI Section */}
      <View style={styles.barContainer}>
        <Text style={styles.name}>ARCANE AI</Text>
        <HealthBar hp={ai.hp} maxHp={MAX_HP} />
        <Text style={styles.hpText}>{ai.hp}/{MAX_HP}</Text>
      </View>
      
      <View style={styles.aiHand}>
        {ai.hand.map((_, i) => (
          <View key={i} style={styles.cardBack}><Text style={styles.cardBackIcon}>✦</Text></View>
        ))}
      </View>

      {/* Battle Zone */}
      <View style={styles.battleZone}>
        <View style={styles.slot}>
          <Text style={styles.slotLabel}>ENEMY</Text>
          {showAiBack && !aSlotCard && (
            <Animated.View style={[styles.cardBackLg, { transform: [{ translateY: slideFromTop }], opacity: aSlotOpacity }]}>
              <Text style={{ color: 'rgba(201,168,76,0.3)', fontSize: 24 }}>✦</Text>
            </Animated.View>
          )}
          {aSlotCard && (
            <Animated.View style={{ transform: [{ translateY: slideFromTop }], opacity: aSlotOpacity }}>
              <PlayingCard card={aSlotCard} size={80} />
            </Animated.View>
          )}
          <Animated.View style={[styles.dmgFloat, { transform: [{ translateY: aDmgY }], opacity: aDmgOpacity }]}>
            <Text style={styles.dmgText}>-{aDmgVal}</Text>
          </Animated.View>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.slot}>
          <Text style={[styles.slotLabel, { bottom: -18, top: 'auto' }]}>YOU</Text>
          {pSlotCard && (
            <Animated.View style={{ transform: [{ translateY: slideFromBottom }], opacity: pSlotOpacity }}>
              <PlayingCard card={pSlotCard} size={80} />
            </Animated.View>
          )}
          <Animated.View style={[styles.dmgFloat, { transform: [{ translateY: pDmgY }], opacity: pDmgOpacity }]}>
            <Text style={styles.dmgText}>-{pDmgVal}</Text>
          </Animated.View>
        </View>

        {battleText !== '' && (
          <View style={styles.battleTextWrap}>
            <Text style={styles.battleText}>{battleText}</Text>
          </View>
        )}
      </View>

      {/* Player Section */}
      {renderPlayerHand()}
      
      <View style={styles.barContainer}>
        <Text style={styles.name}>YOU</Text>
        <HealthBar hp={player.hp} maxHp={MAX_HP} />
        <Text style={styles.hpText}>{player.hp}/{MAX_HP}</Text>
      </View>
      
      {phase === 'player' && <Text style={styles.turnIndicator}>YOUR TURN - TAP A CARD</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 },
  barContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, gap: 8, marginBottom: 6 },
  name: { fontWeight: '700', fontSize: 12, color: '#c9a84c', width: 70 },
  hpOuter: { flex: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 7, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  hpInner: { height: '100%', borderRadius: 7 },
  hpShine: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 7 },
  hpText: { fontSize: 12, fontWeight: '700', color: '#e8dcc8', width: 45, textAlign: 'right' },
  aiHand: { flexDirection: 'row', justifyContent: 'center', gap: 4, minHeight: 52, marginBottom: 10 },
  cardBack: { width: 36, height: 52, borderRadius: 5, backgroundColor: '#0e0e20', borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.2)', alignItems: 'center', justifyContent: 'center' },
  cardBackIcon: { color: 'rgba(201,168,76,0.2)', fontSize: 12 },
  cardBackLg: { width: 80, height: 112, borderRadius: 8, backgroundColor: '#0e0e20', borderWidth: 2, borderColor: 'rgba(201,168,76,0.3)', alignItems: 'center', justifyContent: 'center' },
  battleZone: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, maxHeight: 180 },
  slot: { width: 80, height: 112, borderWidth: 2, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed', borderRadius: 10, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  slotLabel: { position: 'absolute', top: -18, left: 0, right: 0, textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#5a5470', letterSpacing: 2, textTransform: 'uppercase' },
  vsText: { fontSize: 20, fontWeight: '900', color: '#c9a84c', opacity: 0.4 },
  dmgFloat: { position: 'absolute', top: '30%', left: '50%', marginLeft: -20 },
  dmgText: { fontSize: 26, fontWeight: '700', color: '#ffffff', textShadowColor: '#ffffff', textShadowRadius: 10 },
  battleTextWrap: { position: 'absolute', top: '50%', left: '50%', marginTop: -10, marginLeft: -70, width: 140 },
  battleText: { fontSize: 13, fontWeight: '900', color: '#f0d078', textAlign: 'center', letterSpacing: 1, textShadowColor: '#f0d078', textShadowRadius: 10 },
  handContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, minHeight: 100 },
  handCardWrap: { position: 'relative', borderRadius: 8, overflow: 'hidden' },
  playableGlow: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, borderRadius: 10, borderWidth: 2, opacity: 0.6 },
  emptyHand: { color: '#5a5470', fontSize: 14, marginTop: 20, fontWeight: '700' },
  turnIndicator: { textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#c9a84c', letterSpacing: 3, marginTop: 8, textTransform: 'uppercase' },
  
  // Card Styles
  cardContainer: { borderRadius: 8, backgroundColor: '#12122a', overflow: 'hidden', position: 'relative', borderWidth:2 },
  cardBorderTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  cardIcon: { position: 'absolute' },
  cardName: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: '700', color: '#e8dcc8' },
  cardStats: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
});