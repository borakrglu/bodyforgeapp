import { View, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  TrendingUp,
  Settings,
  History,
  Image as ImageIcon,
  Ruler,
  Trophy,
  Award,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useUser } from "../../utils/auth/useUser";
import { useAuth } from "../../utils/auth/useAuth";
import useLanguage from "../../utils/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "@/constants/colors";
import { useProfileData } from "@/hooks/useProfileData";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { PremiumStatusCard } from "@/components/Profile/PremiumStatusCard";
import { StatsGrid } from "@/components/Profile/StatsGrid";
import { UserDetailsCard } from "@/components/Profile/UserDetailsCard";
import { ProfileActionButton } from "@/components/Profile/ProfileActionButton";
import { SignOutButton } from "@/components/Profile/SignOutButton";

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const { signOut: authSignOut } = useAuth();
  const { profileData, stats, loading } = useProfileData(user?.id);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.multiRemove(["isGuest", "languageSelected"]);
      authSignOut();
      router.replace("/language-selection");
    } catch (error) {
      console.error("Sign out error:", error);
      authSignOut();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      <ProfileHeader user={user} t={t} insets={insets} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {userLoading || loading ? (
            <ActivityIndicator
              color={COLORS.forgeOrange}
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : (
            <>
              <PremiumStatusCard
                isPremium={profileData?.premium_active}
                t={t}
                onUpgrade={() => router.push("/premium")}
              />

              <StatsGrid stats={stats} t={t} />

              <UserDetailsCard profileData={profileData} t={t} />

              <ProfileActionButton
                icon={TrendingUp}
                label={t("viewProgress")}
                onPress={() => router.push("/progress")}
              />

              <ProfileActionButton
                icon={ImageIcon}
                label="Progress Photos"
                onPress={() => router.push("/progress-photos")}
                iconColor={COLORS.forgeOrange}
                borderColor={COLORS.forgeOrange}
                borderLeftWidth={3}
              />

              <ProfileActionButton
                icon={Ruler}
                label="Body Measurements"
                onPress={() => router.push("/body-measurements")}
                iconColor="#8b5cf6"
                borderColor="#8b5cf6"
                borderLeftWidth={3}
              />

              <ProfileActionButton
                icon={Trophy}
                label="Personal Records"
                onPress={() => router.push("/personal-records")}
                iconColor={COLORS.gold}
                borderColor={COLORS.gold}
                borderLeftWidth={3}
              />

              <ProfileActionButton
                icon={Award}
                label={t("badges")}
                onPress={() => router.push("/badges")}
                iconColor="#8b5cf6"
                borderColor="#8b5cf6"
                borderLeftWidth={3}
              />

              <ProfileActionButton
                icon={History}
                label={t("workoutHistory")}
                onPress={() => router.push("/workout-history")}
              />

              <ProfileActionButton
                icon={Settings}
                label={t("settings")}
                onPress={() => router.push("/settings")}
              />

              <SignOutButton onPress={handleSignOut} label={t("signOut")} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
