import { View, Text } from "react-native";
import { Image } from "expo-image";
import { User } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export function ProfileHeader({ user, t, insets }) {
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
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              style={{ width: 26, height: 26, borderRadius: 13 }}
            />
          ) : (
            <User color="#fff" size={26} strokeWidth={2.5} />
          )}
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
          {user?.name || t("profile")}
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
