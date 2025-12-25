import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Scale,
  Dumbbell,
  Bell,
  Palette,
  Database,
  Info,
  Trash2,
  Download,
  FileText,
  Shield,
  Mail,
  Crown,
  CreditCard,
  RefreshCw,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useLanguage } from "../../utils/i18n";
import { useAuth } from "../../utils/auth/useAuth";
import usePremium from "../../utils/use-premium";
import { useUser } from "../../utils/auth/useUser";

const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { isPremium, subscriptionInfo, restore, loading: premiumLoading } = usePremium();

  // Settings State
  const [units, setUnits] = useState("metric");
  const [defaultRestTimer, setDefaultRestTimer] = useState(60);
  const [autoStartTimer, setAutoStartTimer] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [questReminders, setQuestReminders] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [keepScreenOn, setKeepScreenOn] = useState(false);
  const [restoringPurchases, setRestoringPurchases] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [
        savedUnits,
        savedRestTimer,
        savedAutoStart,
        savedVibration,
        savedWorkoutReminders,
        savedQuestReminders,
        savedProgressUpdates,
      ] = await Promise.all([
        AsyncStorage.getItem("units"),
        AsyncStorage.getItem("defaultRestTimer"),
        AsyncStorage.getItem("autoStartTimer"),
        AsyncStorage.getItem("vibrationEnabled"),
        AsyncStorage.getItem("workoutReminders"),
        AsyncStorage.getItem("questReminders"),
        AsyncStorage.getItem("progressUpdates"),
      ]);

      if (savedUnits) setUnits(savedUnits);
      if (savedRestTimer) setDefaultRestTimer(parseInt(savedRestTimer));
      if (savedAutoStart) setAutoStartTimer(savedAutoStart === "true");
      if (savedVibration) setVibrationEnabled(savedVibration === "true");
      if (savedWorkoutReminders)
        setWorkoutReminders(savedWorkoutReminders === "true");
      if (savedQuestReminders)
        setQuestReminders(savedQuestReminders === "true");
      if (savedProgressUpdates)
        setProgressUpdates(savedProgressUpdates === "true");
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
      if (vibrationEnabled && Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleUnitsChange = async (newUnits) => {
    setUnits(newUnits);
    await saveSettings("units", newUnits);
  };

  const handleRestTimerChange = (seconds) => {
    setDefaultRestTimer(seconds);
    saveSettings("defaultRestTimer", seconds);
  };

  const handleAutoStartTimerToggle = (value) => {
    setAutoStartTimer(value);
    saveSettings("autoStartTimer", value);
  };

  const handleVibrationToggle = (value) => {
    setVibrationEnabled(value);
    saveSettings("vibrationEnabled", value);
    if (value && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleWorkoutRemindersToggle = (value) => {
    setWorkoutReminders(value);
    saveSettings("workoutReminders", value);
  };

  const handleMealRemindersToggle = (value) => {
    setMealReminders(value);
    saveSettings("mealReminders", value);
  };

  const handleQuestRemindersToggle = (value) => {
    setQuestReminders(value);
    saveSettings("questReminders", value);
  };

  const handleProgressUpdatesToggle = (value) => {
    setProgressUpdates(value);
    saveSettings("progressUpdates", value);
  };

  const handleKeepScreenOnToggle = (value) => {
    setKeepScreenOn(value);
    saveSettings("keepScreenOn", value);
  };

  const handleLanguageChange = async (newLanguage) => {
    await setLanguage(newLanguage);
    if (vibrationEnabled && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClearCache = () => {
    Alert.alert(t("clearCache"), t("clearCacheConfirm") || "Are you sure?", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirmDelete"),
        style: "destructive",
        onPress: async () => {
          try {
            // Keep essential keys (auth, language, units)
            const essentialKeys = [
              "language",
              "units",
              "isGuest",
              "languageSelected",
            ];
            const allKeys = await AsyncStorage.getAllKeys();
            const keysToRemove = allKeys.filter(
              (key) => !essentialKeys.includes(key),
            );
            await AsyncStorage.multiRemove(keysToRemove);
            Alert.alert(t("success") || "Success", t("cacheCleared"));
          } catch (error) {
            console.error("Error clearing cache:", error);
            Alert.alert(
              t("error") || "Error",
              t("errorClearing") || "Failed to clear cache",
            );
          }
        },
      },
    ]);
  };

  const handleExportData = async () => {
    Alert.alert(
      t("exportData"),
      t("exportDataInfo") || "Your data will be exported as JSON",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("export") || "Export",
          onPress: async () => {
            try {
              // In a real app, this would export user data
              Alert.alert(t("success") || "Success", t("dataExported"));
            } catch (error) {
              console.error("Error exporting data:", error);
              Alert.alert(
                t("error") || "Error",
                t("errorExporting") || "Failed to export data",
              );
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("confirmDeleteAccount"),
      t("deleteAccountWarning"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirmDelete"),
          style: "destructive",
          onPress: async () => {
            try {
              // In a real app, this would call an API to delete the account
              await AsyncStorage.clear();
              await signOut();
              router.replace("/auth");
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                t("error") || "Error",
                t("errorDeleting") || "Failed to delete account",
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "800",
          color: COLORS.steelSilver,
          marginBottom: 14,
          paddingHorizontal: 20,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: COLORS.forgedSteel,
          borderRadius: 16,
          marginHorizontal: 20,
          borderWidth: 1,
          borderColor: COLORS.ironGrey,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );

  const SettingRow = ({
    icon: Icon,
    label,
    value,
    valueColor,
    onPress,
    showChevron = true,
    isLast = false,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.ironGrey,
      }}
    >
      <View
        style={{
          backgroundColor: COLORS.carbonBlack,
          borderRadius: 10,
          padding: 8,
          marginRight: 14,
        }}
      >
        <Icon color={COLORS.forgeOrange} size={20} strokeWidth={2.5} />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "600",
          color: "#fff",
        }}
      >
        {label}
      </Text>
      {value && (
        <Text
          style={{
            fontSize: 14,
            color: valueColor || COLORS.steelSilver,
            marginRight: 8,
            fontWeight: "600",
          }}
        >
          {value}
        </Text>
      )}
      {showChevron && (
        <ChevronRight color={COLORS.steelSilver} size={20} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );

  const SettingToggleRow = ({
    icon: Icon,
    label,
    value,
    onToggle,
    isLast = false,
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.ironGrey,
      }}
    >
      <View
        style={{
          backgroundColor: COLORS.carbonBlack,
          borderRadius: 10,
          padding: 8,
          marginRight: 14,
        }}
      >
        <Icon color={COLORS.forgeOrange} size={20} strokeWidth={2.5} />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "600",
          color: "#fff",
        }}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.ironGrey, true: COLORS.orangeRimLight }}
        thumbColor={value ? COLORS.forgeOrange : "#f4f3f4"}
        ios_backgroundColor={COLORS.ironGrey}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 14 }}
          >
            <ChevronLeft color="#fff" size={28} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: "#fff",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("settings")}
          </Text>
        </View>
        <View
          style={{
            width: 60,
            height: 3,
            backgroundColor: COLORS.forgeOrange,
            marginLeft: 42,
            borderRadius: 2,
          }}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: 24,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription */}
        <SettingSection title={t("subscription") || "Subscription"}>
          <SettingRow
            icon={Crown}
            label={t("currentPlan") || "Current Plan"}
            value={isPremium ? "Premium" : "Free"}
            valueColor={isPremium ? COLORS.forgeOrange : COLORS.steelSilver}
            showChevron={!isPremium}
            onPress={() => {
              if (!isPremium) {
                router.push("/premium");
              }
            }}
          />
          {isPremium && subscriptionInfo && (
            <SettingRow
              icon={CreditCard}
              label={t("manageBilling") || "Manage Billing"}
              onPress={() => {
                Alert.alert(
                  t("manageBilling") || "Manage Billing",
                  t("billingInfo") || "To manage your subscription, visit the app store where you purchased it or contact support@bodyforge.com",
                );
              }}
            />
          )}
          <SettingRow
            icon={RefreshCw}
            label={t("restorePurchases") || "Restore Purchases"}
            onPress={async () => {
              if (restoringPurchases) return;
              setRestoringPurchases(true);
              try {
                if (restore) {
                  await restore();
                } else {
                  Alert.alert(
                    t("restorePurchases") || "Restore Purchases",
                    t("restoreNotAvailable") || "Purchase restoration is only available on mobile devices",
                  );
                }
              } catch (error) {
                console.error("Restore error:", error);
                Alert.alert(
                  t("error") || "Error",
                  t("restoreError") || "Failed to restore purchases. Please try again.",
                );
              } finally {
                setRestoringPurchases(false);
              }
            }}
            isLast
          />
        </SettingSection>

        {/* Language */}
        <SettingSection title={t("language")}>
          <SettingRow
            icon={Globe}
            label={t("language")}
            value={
              language === "en"
                ? "English"
                : language === "tr"
                  ? "Türkçe"
                  : language === "es"
                    ? "Español"
                    : language === "de"
                      ? "Deutsch"
                      : "Français"
            }
            onPress={() => {
              Alert.alert(
                t("chooseLanguage"),
                "",
                [
                  {
                    text: "English",
                    onPress: () => handleLanguageChange("en"),
                  },
                  {
                    text: "Türkçe",
                    onPress: () => handleLanguageChange("tr"),
                  },
                  {
                    text: "Español",
                    onPress: () => handleLanguageChange("es"),
                  },
                  {
                    text: "Deutsch",
                    onPress: () => handleLanguageChange("de"),
                  },
                  {
                    text: "Français",
                    onPress: () => handleLanguageChange("fr"),
                  },
                  { text: t("cancel"), style: "cancel" },
                ],
                { cancelable: true },
              );
            }}
            isLast
          />
        </SettingSection>

        {/* Units */}
        <SettingSection title={t("units")}>
          <SettingRow
            icon={Scale}
            label={t("weightUnit")}
            value={units === "metric" ? t("metric") : t("imperial")}
            onPress={() => {
              Alert.alert(
                t("weightUnit"),
                "",
                [
                  {
                    text: t("metric"),
                    onPress: () => handleUnitsChange("metric"),
                  },
                  {
                    text: t("imperial"),
                    onPress: () => handleUnitsChange("imperial"),
                  },
                  { text: t("cancel"), style: "cancel" },
                ],
                { cancelable: true },
              );
            }}
            isLast
          />
        </SettingSection>

        {/* Workout Preferences */}
        <SettingSection title={t("workoutPreferences")}>
          <SettingRow
            icon={Dumbbell}
            label={t("defaultRestTimer")}
            value={`${defaultRestTimer}s`}
            onPress={() => {
              Alert.alert(
                t("defaultRestTimer"),
                "",
                [
                  { text: "30s", onPress: () => handleRestTimerChange(30) },
                  { text: "60s", onPress: () => handleRestTimerChange(60) },
                  { text: "90s", onPress: () => handleRestTimerChange(90) },
                  { text: "120s", onPress: () => handleRestTimerChange(120) },
                  { text: t("cancel"), style: "cancel" },
                ],
                { cancelable: true },
              );
            }}
          />
          <SettingToggleRow
            icon={Dumbbell}
            label={t("autoStartTimer")}
            value={autoStartTimer}
            onToggle={handleAutoStartTimerToggle}
          />
          <SettingToggleRow
            icon={Dumbbell}
            label={t("vibration")}
            value={vibrationEnabled}
            onToggle={handleVibrationToggle}
            isLast
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title={t("notifications")}>
          <SettingToggleRow
            icon={Bell}
            label={t("workoutReminders")}
            value={workoutReminders}
            onToggle={handleWorkoutRemindersToggle}
          />
          <SettingToggleRow
            icon={Bell}
            label={t("mealReminders")}
            value={mealReminders}
            onToggle={handleMealRemindersToggle}
          />
          <SettingToggleRow
            icon={Bell}
            label={t("questReminders")}
            value={questReminders}
            onToggle={handleQuestRemindersToggle}
          />
          <SettingToggleRow
            icon={Bell}
            label={t("progressUpdates")}
            value={progressUpdates}
            onToggle={handleProgressUpdatesToggle}
            isLast
          />
        </SettingSection>

        {/* Display */}
        <SettingSection title={t("display")}>
          <SettingRow
            icon={Palette}
            label={t("theme")}
            value={t("darkMode")}
            onPress={() => {
              Alert.alert(
                t("theme"),
                t("themeInfo") ||
                  "Dark mode is always enabled for optimal viewing",
              );
            }}
          />
          <SettingToggleRow
            icon={Dumbbell}
            label={t("keepScreenOn")}
            value={keepScreenOn}
            onToggle={handleKeepScreenOnToggle}
            isLast
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title={t("dataManagement")}>
          <SettingRow
            icon={Download}
            label={t("exportData")}
            onPress={handleExportData}
          />
          <SettingRow
            icon={Database}
            label={t("clearCache")}
            onPress={handleClearCache}
          />
          <SettingRow
            icon={Trash2}
            label={t("deleteAccount")}
            onPress={handleDeleteAccount}
            isLast
          />
        </SettingSection>

        {/* About */}
        <SettingSection title={t("about")}>
          <SettingRow
            icon={Info}
            label={t("version")}
            value="1.0.0"
            showChevron={false}
          />
          <SettingRow
            icon={FileText}
            label={t("termsOfService")}
            onPress={() => {
              Alert.alert(
                t("termsOfService"),
                t("termsInfo") || "Visit bodyforge.com/terms for full terms",
              );
            }}
          />
          <SettingRow
            icon={Shield}
            label={t("privacyPolicy")}
            onPress={() => {
              Alert.alert(
                t("privacyPolicy"),
                t("privacyInfo") ||
                  "Visit bodyforge.com/privacy for full privacy policy",
              );
            }}
          />
          <SettingRow
            icon={Mail}
            label={t("contactSupport")}
            onPress={() => {
              Alert.alert(
                t("contactSupport"),
                t("supportInfo") || "Email: support@bodyforge.com",
              );
            }}
            isLast
          />
        </SettingSection>
      </ScrollView>
    </View>
  );
}
