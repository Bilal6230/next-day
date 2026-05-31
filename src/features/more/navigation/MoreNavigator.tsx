import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { MoreStackParamList } from '@/features/more/navigation/types';
import { MoreScreen } from '@/features/more/screens/MoreScreen';
import { NoteFormScreen } from '@/features/notes/screens/NoteFormScreen';
import { NotesScreen } from '@/features/notes/screens/NotesScreen';
import { colors } from '@/shared/theme';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MoreHome" component={MoreScreen} />
      <Stack.Screen name="NotesList" component={NotesScreen} />
      <Stack.Screen name="NoteForm" component={NoteFormScreen} />
    </Stack.Navigator>
  );
}
