
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import Icon from '../../components/Icon';
import { Colors } from '../../theme';

const TabBarIcon = ({ name, color }: { name: React.ComponentProps<typeof Icon>['name'], color: string }) => {
  return <Icon name={name} size={24} color={color} />;
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.backgroundDark,
          borderTopColor: Colors.border,
          height: 85,
          paddingBottom: 25,
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
