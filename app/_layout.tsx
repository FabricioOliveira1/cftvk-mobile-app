import { useRouter, useSegments, Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context';
import { Colors } from '../theme';
import LoadingScreen from '../components/LoadingScreen';

function RootLayoutNav() {
  const { firebaseUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inProtectedRoute =
      segments[0] === '(tabs)' ||
      segments[0] === 'member-profile' ||
      segments[0] === 'edit-member' ||
      segments[0] === 'class-detail' ||
      segments[0] === 'new-class';

    if (!firebaseUser && inProtectedRoute) {
      router.replace('/');
    } else if (firebaseUser && segments[0] === undefined) {
      router.replace('/(tabs)/dashboard');
    }
  }, [firebaseUser, loading, segments]);

  if (loading) return <LoadingScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.backgroundDark },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="member-profile" />
      <Stack.Screen name="edit-member" />
      <Stack.Screen name="class-detail" />
      <Stack.Screen
        name="new-class"
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
