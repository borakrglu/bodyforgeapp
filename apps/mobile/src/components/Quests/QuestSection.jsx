import { View, Text } from "react-native";
import { Target, Trophy } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { QuestItem } from "./QuestItem";

export function QuestSection({
  title,
  quests,
  questType,
  icon: Icon,
  iconColor,
  completedCount,
  onComplete,
  t,
  language,
}) {
  const allComplete = completedCount === quests.length && quests.length > 0;
  const badgeColor = questType === "daily" ? "#10b981" : COLORS.forgeOrange;

  return (
    <View style={{ marginBottom: 32 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon color={iconColor} size={24} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#fff",
              marginLeft: 10,
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Text>
        </View>
        {allComplete && (
          <View
            style={{
              backgroundColor: badgeColor + "33",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: badgeColor,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: badgeColor,
              }}
            >
              ✓ ALL COMPLETE
            </Text>
          </View>
        )}
      </View>

      {quests.map((quest) => (
        <QuestItem
          key={quest.id}
          quest={quest}
          questType={questType}
          onComplete={onComplete}
          t={t}
          language={language}
        />
      ))}
    </View>
  );
}
