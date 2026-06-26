import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function GamesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
        animation: 'slide_from_bottom',
      }}
    />
  );
}