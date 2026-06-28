import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card as CardType } from '../app/type';
import { ELEMENTS } from '../constants/constant';

interface Props {
  card: CardType;
  size?: number;
  opacity?: number;
}

export const PlayingCard: React.FC<Props> = ({ card, size = 72, opacity = 1 }) => {
  const scale = size / 72;
  const el = ELEMENTS[card.element];

  return (
    <View style={[styles.container, { width: size, height: size * 1.4, opacity }]}>
      {/* Top border glow */}
      <View style={[styles.borderTop, { backgroundColor: el.color }]} />
      <View style={[styles.borderBottom, { backgroundColor: `${el.color}66` }]} />
      
      {/* Element Icon */}
      <View style={[styles.iconWrap, { top: 6 * scale, left: 6 * scale }]}>
        <Text style={{ color: el.color, fontSize: 13 * scale }}>🔥</Text>
      </View>

      {/* Name */}
      <Text style={[styles.name, { fontSize: 9 * scale, top: 22 * scale }]}>
        {card.name}
      </Text>

      {/* Stats */}
      <View style={[styles.stats, { bottom: 14 * scale }]}>
        <Text style={[styles.atk, { fontSize: 13 * scale }]}>⚔️ {card.atk}</Text>
        <Text style={[styles.def, { fontSize: 13 * scale }]}>🛡️ {card.def}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: '#12122a',
    overflow: 'hidden',
    position: 'relative',
  },
  borderTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  borderBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, opacity: 0.4 },
  iconWrap: { position: 'absolute' },
  name: {
    position: 'absolute',
    left: 0, right: 0,
    textAlign: 'center',
    fontFamily: 'Cinzel', // Fallback to system default if not installed
    fontWeight: '700',
    color: '#e8dcc8',
  },
  stats: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  atk: { color: '#ff8866', fontWeight: '700' },
  def: { color: '#66aaff', fontWeight: '700' },
});