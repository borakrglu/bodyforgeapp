import { View, Text } from "react-native";
import { TrendingUp, Award, Calendar, CheckCircle } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function StatsGrid({ stats, t }) {
  if (!stats) return null;

  const weightChange = stats.startWeight
    ? (stats.currentWeight - stats.startWeight).toFixed(1)
    : 0;

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#fff",
          marginBottom: 16,
          letterSpacing: 0.5,
        }}
      >
        {t("yourStats")}
      </Text>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.forgedSteel,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.ironGrey,
            borderTopWidth: 3,
            borderTopColor: COLORS.forgeOrange,
          }}
        >
          <TrendingUp color={COLORS.forgeOrange} size={22} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#fff",
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            {stats.currentWeight || 0}kg
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("currentWeight")}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.forgedSteel,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.ironGrey,
            borderTopWidth: 3,
            borderTopColor: COLORS.forgeOrange,
          }}
        >
          <Award color={COLORS.orangeRimLight} size={22} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#fff",
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            {stats.currentBodyFat || 0}%
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("bodyFatPercent")}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.forgedSteel,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.ironGrey,
            borderTopWidth: 3,
            borderTopColor: COLORS.forgeOrange,
          }}
        >
          <Calendar color={COLORS.forgeOrange} size={22} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#fff",
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            {stats.totalEntries || 0}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("checkIns")}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.forgedSteel,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.ironGrey,
            borderTopWidth: 3,
            borderTopColor: weightChange >= 0 ? "#10b981" : "#ef4444",
          }}
        >
          <CheckCircle
            color={weightChange >= 0 ? "#10b981" : "#ef4444"}
            size={22}
            strokeWidth={2.5}
          />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#fff",
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            {weightChange >= 0 ? "+" : ""}
            {weightChange}kg
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: COLORS.steelSilver,
              fontWeight: "600",
            }}
          >
            {t("weightChange")}
          </Text>
        </View>
      </View>
    </View>
  );
}
