import { View, Text } from "react-native";
import { Target } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function QuestsHeader({ title, insets }) {
  return (
    <View
      style={{
        paddingTop: insets.top + 24,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.carbonBlack,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.ironGrey,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.moltenEmber,
            borderRadius: 12,
            padding: 10,
            marginRight: 14,
            borderWidth: 1,
            borderColor: COLORS.forgeOrange,
          }}
        >
          <Target color="#fff" size={26} strokeWidth={2.5} />
        </View>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "900",
            color: "#fff",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
      </View>
      <View
        style={{
          width: 60,
          height: 3,
          backgroundColor: COLORS.forgeOrange,
          marginLeft: 60,
          borderRadius: 2,
        }}
      />
    </View>
  );
}
