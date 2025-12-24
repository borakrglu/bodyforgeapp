import { Tabs } from "expo-router";
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  Pill,
  MessageCircle,
  User,
  Target,
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 1,
          borderColor: "#1a1a1a",
          paddingTop: 4,
        },
        tabBarActiveTintColor: "#FF6A1A",
        tabBarInactiveTintColor: "#6B6B6B",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Training",
          tabBarIcon: ({ color }) => <Dumbbell color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color }) => (
            <UtensilsCrossed color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: "Supplements",
          tabBarIcon: ({ color }) => <Pill color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: "Quests",
          tabBarIcon: ({ color }) => <Target color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="coaching"
        options={{
          title: "Coaching",
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
