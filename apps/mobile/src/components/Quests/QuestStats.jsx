import { View, Text } from "react-native";
import { Target, Trophy } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function QuestStats({
  completedDaily,
  totalDaily,
  completedWeekly,
  totalWeekly,
  language,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.forgedSteel,
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: COLORS.ironGrey,
          borderTopWidth: 3,
          borderTopColor: "#3b82f6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Target color="#3b82f6" size={18} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: COLORS.steelSilver,
              marginLeft: 6,
              textTransform: "uppercase",
            }}
          >
            {language === "tr" ? "Günlük" : "Daily"}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: "#fff",
            letterSpacing: -1,
          }}
        >
          {completedDaily}/{totalDaily}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.forgedSteel,
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: COLORS.ironGrey,
          borderTopWidth: 3,
          borderTopColor: "#f59e0b",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Trophy color="#f59e0b" size={18} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: COLORS.steelSilver,
              marginLeft: 6,
              textTransform: "uppercase",
            }}
          >
            {language === "tr" ? "Haftalık" : "Weekly"}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: "#fff",
            letterSpacing: -1,
          }}
        >
          {completedWeekly}/{totalWeekly}
        </Text>
      </View>
    </View>
  );
}
