import { TouchableOpacity, View, Text } from "react-native";
import { COLORS } from "@/constants/colors";

export function ProfileActionButton({
  icon: Icon,
  label,
  onPress,
  iconColor = COLORS.steelSilver,
  borderColor = COLORS.ironGrey,
  borderLeftWidth = 1,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 16,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        borderWidth: 1,
        borderColor: borderColor,
        borderLeftWidth: borderLeftWidth,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Icon color={iconColor} size={22} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#fff",
            marginLeft: 12,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: 18, color: iconColor }}>→</Text>
    </TouchableOpacity>
  );
}
