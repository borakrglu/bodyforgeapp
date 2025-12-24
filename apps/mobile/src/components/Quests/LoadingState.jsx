import { View, Text, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/colors";

export function LoadingState({ language }) {
  return (
    <View style={{ alignItems: "center", marginTop: 60 }}>
      <ActivityIndicator color={COLORS.forgeOrange} size="large" />
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: COLORS.steelSilver,
          marginTop: 16,
        }}
      >
        {language === "tr" ? "Yükleniyor..." : "Loading..."}
      </Text>
    </View>
  );
}
