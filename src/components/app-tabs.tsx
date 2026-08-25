import { Tabs } from 'expo-router';

export default function AppTabs() {
  return (
    <Tabs>
      <Tabs.Screen
        name="boards"
        options={{
          title: 'Panolarım',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Keşfet',
        }}
      />
    </Tabs>
  );
}