import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  hp: number;
  maxHp: number;
}

export const HealthBar: React.FC<Props> = ({ hp, maxHp }) => {
  const pct = (hp / maxHp) * 100;
  const color = pct > 50 ? '#48a848' : pct > 25 ? '#c9a84c' : '#e84430';

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, { width: `${pct}%`, backgroundColor: color }]}>
        <View style={styles.shine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inner: {
    height: '100%',
    borderRadius: 7,
  },
  shine: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 7,
  }
});