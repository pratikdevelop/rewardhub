/**
 * ChessPieces.tsx
 * SVG-based chess piece components for React Native.
 * Uses unicode chess glyphs as a fallback-free, dependency-light renderer
 * that looks crisp at any size and supports both light/dark themes.
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Piece, Color, PieceType } from './chessEngine';

const GLYPH: Record<PieceType, string> = {
  // Solid glyphs for white pieces (rendered as outline + fill)
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

interface PieceViewProps {
  piece: Piece;
  size: number;
}

export const PieceView: React.FC<PieceViewProps> = ({ piece, size }) => {
  const isWhite = piece.color === 'w';
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text
        style={[
          styles.glyph,
          {
            fontSize: size * 0.78,
            color: isWhite ? '#FFFFFF' : '#1F2937',
            textShadowColor: isWhite ? '#1F2937' : '#000000',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: isWhite ? 2 : 1,
          },
        ]}
      >
        {GLYPH[piece.type]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontWeight: '400',
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default PieceView;
