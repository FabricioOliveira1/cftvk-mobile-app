import { useRouter, useSegments, Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context';
import { Colors } from '../theme';
import LoadingScreen from '../components/LoadingScreen';

function RootLayoutNav() {
  const { firebaseUser, appUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inProtectedRoute =
      segments[0] === '(admin)' ||
      segments[0] === '(student)' ||
      segments[0] === 'member-profile' ||
      segments[0] === 'edit-member' ||
      segments[0] === 'class-detail' ||
      segments[0] === 'new-class';

    if (!firebaseUser && inProtectedRoute) {
      router.replace('/');
    } else if (firebaseUser && appUser && segments[0] === undefined) {
      if (appUser.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(student)/dashboard');
      }
    }
  }, [firebaseUser, appUser, loading, segments]);

  if (loading) return <LoadingScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.backgroundDark },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(student)" />
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
