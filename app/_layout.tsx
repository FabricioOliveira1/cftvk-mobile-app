import { useRouter, useSegments, Stack } from 'expo-router';
import { useEffect } from 'react';
import OfflineBanner from '../components/OfflineBanner';
import { AuthProvider, useAuth } from '../src/context';
import { NetworkProvider } from '../src/context/NetworkContext';
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
      segments[0] === 'new-class' ||
      segments[0] === 'prs' ||
      segments[0] === 'set-password';

    if (!firebaseUser && inProtectedRoute) {
      router.replace('/');
      return;
    }

    if (firebaseUser && appUser) {
      // Primeiro acesso: forçar troca de senha antes de entrar no app
      if (appUser.mustChangePassword && segments[0] !== 'set-password') {
        router.replace('/set-password');
        return;
      }
      // Já trocou a senha mas ainda está na tela de troca → redireciona ao dashboard
      if (segments[0] === 'set-password' && !appUser.mustChangePassword) {
        router.replace(appUser.role === 'admin' ? '/(admin)/dashboard' : '/(student)/dashboard');
        return;
      }
      // Login normal: redireciona ao dashboard
      if (segments[0] === undefined) {
        router.replace(appUser.role === 'admin' ? '/(admin)/dashboard' : '/(student)/dashboard');
      }
    }
  }, [firebaseUser, appUser, loading, segments, router]);

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
      <Stack.Screen name="prs" />
      <Stack.Screen name="set-password" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <NetworkProvider>
      <AuthProvider>
        <RootLayoutNav />
        <OfflineBanner />
      </AuthProvider>
    </NetworkProvider>
  );
}
