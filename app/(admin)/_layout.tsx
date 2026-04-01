
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { useAuth } from '../../src/context';
import { Colors } from '../../theme';

const TabBarIcon = ({ name, color }: { name: React.ComponentProps<typeof Icon>['name'], color: string }) => {
  return <Icon name={name} size={24} color={color} />;
};

export default function TabLayout() {
  const { appUser, loading } = useAuth();
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && appUser && appUser.role !== 'admin') {
      router.replace('/(student)/dashboard');
    }
  }, [appUser, loading, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.backgroundDark,
          borderTopColor: Colors.border,
          height: 60 + bottom,
          paddingBottom: Math.max(bottom, 8),
        },
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Membros',
          tabBarIcon: ({ color }) => <TabBarIcon name="person-search" color={color} />,
        }}
      />
       <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    tabLabel: {
        fontSize: 10,
        fontWeight: 'bold',
    }
});
