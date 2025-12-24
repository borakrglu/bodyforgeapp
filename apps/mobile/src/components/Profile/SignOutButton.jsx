import { TouchableOpacity, Text } from "react-native";
import { LogOut } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function SignOutButton({ onPress, label }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: COLORS.forgedSteel,
        borderRadius: 16,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ef4444",
      }}
    >
      <LogOut color="#ef4444" size={20} strokeWidth={2.5} />
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#ef4444",
          marginLeft: 10,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
