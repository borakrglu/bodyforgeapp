import { View, Text, TouchableOpacity } from "react-native";
import { TrendingUp } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function LeaderboardCTA({ onPress, t, language }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 16,
        padding: 20,
        marginTop: 28,
        borderWidth: 2,
        borderColor: COLORS.forgeOrange,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            backgroundColor: COLORS.gold + "33",
            borderRadius: 10,
            padding: 10,
            borderWidth: 1,
            borderColor: COLORS.gold,
          }}
        >
          <TrendingUp color={COLORS.gold} size={24} strokeWidth={2.5} />
        </View>
        <View style={{ marginLeft: 14 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#fff",
              letterSpacing: 0.5,
            }}
          >
            {t("leaderboard")}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.steelSilver,
              marginTop: 2,
            }}
          >
            {language === "tr" ? "Sıralamayı görüntüle" : "View rankings"}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 24, color: COLORS.forgeOrange }}>→</Text>
    </TouchableOpacity>
  );
}
