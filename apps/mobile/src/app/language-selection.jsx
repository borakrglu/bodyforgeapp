import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useLanguage } from "../utils/i18n";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Check, Globe } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

const LANGUAGES = [
  { code: "en", label: "ENG", flag: "🇺🇸", name: "English" },
  { code: "tr", label: "TR", flag: "🇹🇷", name: "Türkçe" },
  { code: "es", label: "ESP", flag: "🇪🇸", name: "Español" },
  { code: "de", label: "DEU", flag: "🇩🇪", name: "Deutsch" },
  { code: "fr", label: "FRA", flag: "🇫🇷", name: "Français" },
];

export default function LanguageSelection() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleSelect = async (code) => {
    try {
      await setLanguage(code);
      await AsyncStorage.setItem("languageSelected", "true");
      // Redirect to root to let index.jsx handle the next step (auth or home)
      router.replace("/");
    } catch (error) {
      console.error("Language selection error:", error);
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Globe color="#FF6A1A" size={32} />
          </View>
          <Text style={styles.title}>{t("chooseLanguage")}</Text>
          <Text style={styles.subtitle}>{t("selectLanguage")}</Text>
        </View>

        <View style={styles.grid}>
          {LANGUAGES.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[styles.card, language === item.code && styles.activeCard]}
              onPress={() => handleSelect(item.code)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.flagCircle,
                  language === item.code && styles.activeFlagCircle,
                ]}
              >
                <Text style={styles.flagEmoji}>{item.flag}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text
                  style={[
                    styles.languageName,
                    language === item.code && styles.activeText,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.languageCode}>{item.label}</Text>
              </View>
              {language === item.code && (
                <View style={styles.checkIcon}>
                  <Check size={16} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {language === "en"
              ? "You can change your language anytime in settings."
              : t("settings")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 106, 26, 0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 106, 26, 0.2)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  grid: {
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#222222",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  activeCard: {
    borderColor: "#FF6A1A",
    backgroundColor: "#1A1410",
  },
  flagCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#333333",
  },
  activeFlagCircle: {
    borderColor: "rgba(255, 106, 26, 0.4)",
    backgroundColor: "#2A1F18",
  },
  flagEmoji: {
    fontSize: 32,
    // Some platforms render flags as text codes, making them bigger helps
    lineHeight: 40,
  },
  infoContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  activeText: {
    color: "#FF6A1A",
  },
  languageCode: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600",
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF6A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#444444",
    textAlign: "center",
    fontWeight: "500",
  },
});
