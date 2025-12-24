import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Plus,
  Image as ImageIcon,
  Calendar,
  X,
  Trash2,
  ArrowLeftRight,
  Maximize2,
} from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "../utils/auth/useUser";
import { useUpload } from "../utils/useUpload";
import useLanguage from "../utils/i18n";

const COLORS = {
  forgeOrange: "#FF6A1A",
  moltenEmber: "#FF3A00",
  carbonBlack: "#0D0D0D",
  forgedSteel: "#1A1A1A",
  ironGrey: "#2E2E2E",
  steelSilver: "#C7C7C7",
  orangeRimLight: "#FFA45A",
};

const { width } = Dimensions.get("window");
const imageSize = (width - 60) / 3; // 3 columns with spacing

export default function ProgressPhotosPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const [upload, { loading: uploading }] = useUpload();
  const { t, language } = useLanguage();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadPhotos();
    }
  }, [user]);

  const loadPhotos = async () => {
    try {
      const response = await fetch(`/api/progress?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const photosData = data.entries
          .filter((e) => e.photo_url)
          .map((e) => ({
            id: e.id,
            url: e.photo_url,
            date: e.entry_date,
            weight: e.weight_kg,
            bodyFat: e.body_fat_percentage,
            notes: e.notes,
          }))
          .reverse(); // Newest first
        setPhotos(photosData);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload photos",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUpload(result.assets[0]);
    }
  };

  const handleUpload = async (asset) => {
    try {
      const uploadResult = await upload({
        reactNativeAsset: {
          uri: asset.uri,
          name: asset.fileName || "progress-photo.jpg",
          mimeType: asset.mimeType || "image/jpeg",
        },
      });

      if (uploadResult.error) {
        Alert.alert("Upload Failed", uploadResult.error);
        return;
      }

      // Save to progress entries
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          photoUrl: uploadResult.url,
        }),
      });

      if (response.ok) {
        await loadPhotos();
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "Failed to upload photo");
    }
  };

  const deletePhoto = async (photoId) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`/api/progress/${photoId}`, {
              method: "DELETE",
            });
            if (response.ok) {
              setSelectedPhoto(null);
              await loadPhotos();
            }
          } catch (error) {
            console.error("Error deleting photo:", error);
          }
        },
      },
    ]);
  };

  const enterComparisonMode = () => {
    if (photos.length < 2) {
      Alert.alert("Not Enough Photos", "You need at least 2 photos to compare");
      return;
    }
    setComparisonMode(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.carbonBlack }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: COLORS.carbonBlack,
          borderBottomWidth: 2,
          borderBottomColor: COLORS.ironGrey,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 12 }}
        >
          <ChevronLeft color="#fff" size={28} strokeWidth={2.5} />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              PROGRESS PHOTOS
            </Text>
            <View
              style={{
                width: 80,
                height: 3,
                backgroundColor: COLORS.forgeOrange,
                marginTop: 8,
                borderRadius: 2,
              }}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={enterComparisonMode}
              style={{
                backgroundColor: COLORS.forgedSteel,
                borderRadius: 12,
                width: 48,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.ironGrey,
              }}
            >
              <ArrowLeftRight
                color={COLORS.forgeOrange}
                size={24}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading}
              style={{
                backgroundColor: COLORS.forgeOrange,
                borderRadius: 12,
                width: 48,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.moltenEmber,
              }}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Plus color="#fff" size={24} strokeWidth={3} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {loading ? (
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
                Loading Photos...
              </Text>
            </View>
          ) : photos.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 18,
                  padding: 32,
                  borderWidth: 2,
                  borderColor: COLORS.ironGrey,
                  borderTopWidth: 4,
                  borderTopColor: COLORS.forgeOrange,
                  alignItems: "center",
                }}
              >
                <ImageIcon
                  color={COLORS.forgeOrange}
                  size={48}
                  strokeWidth={2.5}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#fff",
                    marginTop: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  No Photos Yet
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: COLORS.steelSilver,
                    marginTop: 8,
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Start tracking your transformation with progress photos
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    backgroundColor: COLORS.forgeOrange,
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 12,
                    marginTop: 24,
                    borderWidth: 1,
                    borderColor: COLORS.moltenEmber,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: "#fff",
                      letterSpacing: 0.5,
                    }}
                  >
                    Upload First Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: COLORS.forgeOrange,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 40,
                        fontWeight: "900",
                        color: COLORS.forgeOrange,
                        letterSpacing: -1,
                      }}
                    >
                      {photos.length}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: COLORS.steelSilver,
                        marginTop: -4,
                        letterSpacing: 0.5,
                      }}
                    >
                      Progress Photos
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: COLORS.steelSilver,
                        fontWeight: "600",
                      }}
                    >
                      First Photo
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "800",
                        color: "#fff",
                        marginTop: 2,
                      }}
                    >
                      {formatDate(photos[photos.length - 1].date)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Photo Grid */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {photos.map((photo) => (
                  <TouchableOpacity
                    key={photo.id}
                    onPress={() => setSelectedPhoto(photo)}
                    style={{
                      width: imageSize,
                      height: imageSize * 1.3,
                      borderRadius: 12,
                      overflow: "hidden",
                      backgroundColor: COLORS.forgedSteel,
                      borderWidth: 2,
                      borderColor: COLORS.ironGrey,
                    }}
                  >
                    <Image
                      source={photo.url}
                      contentFit="cover"
                      style={{ width: "100%", height: "100%" }}
                      transition={200}
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        padding: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#fff",
                          textAlign: "center",
                        }}
                      >
                        {formatDate(photo.date)}
                      </Text>
                      {photo.weight && (
                        <Text
                          style={{
                            fontSize: 10,
                            color: COLORS.forgeOrange,
                            textAlign: "center",
                            marginTop: 2,
                            fontWeight: "600",
                          }}
                        >
                          {photo.weight} kg
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Full Screen Photo Modal */}
      {selectedPhoto && !comparisonMode && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.95)",
            }}
          >
            <View
              style={{
                paddingTop: insets.top + 16,
                paddingHorizontal: 20,
                paddingBottom: 16,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                <X color="#fff" size={28} strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deletePhoto(selectedPhoto.id)}>
                <Trash2 color="#ef4444" size={24} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
              <Image
                source={selectedPhoto.url}
                contentFit="contain"
                style={{ width: "100%", height: "70%" }}
                transition={200}
              />

              <View
                style={{
                  backgroundColor: COLORS.forgedSteel,
                  borderRadius: 16,
                  padding: 20,
                  marginTop: 20,
                  borderWidth: 2,
                  borderColor: COLORS.ironGrey,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Calendar color={COLORS.forgeOrange} size={20} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: "#fff",
                      marginLeft: 10,
                      letterSpacing: 0.3,
                    }}
                  >
                    {formatDate(selectedPhoto.date)}
                  </Text>
                </View>

                {selectedPhoto.weight && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.steelSilver,
                        fontWeight: "600",
                      }}
                    >
                      Weight
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: "#fff",
                      }}
                    >
                      {selectedPhoto.weight} kg
                    </Text>
                  </View>
                )}

                {selectedPhoto.bodyFat && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.steelSilver,
                        fontWeight: "600",
                      }}
                    >
                      Body Fat
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: "#fff",
                      }}
                    >
                      {selectedPhoto.bodyFat}%
                    </Text>
                  </View>
                )}

                {selectedPhoto.notes && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.steelSilver,
                      marginTop: 8,
                      fontStyle: "italic",
                      fontWeight: "600",
                    }}
                  >
                    "{selectedPhoto.notes}"
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Comparison Mode Modal */}
      {comparisonMode && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setComparisonMode(false);
            setBeforePhoto(null);
            setAfterPhoto(null);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.carbonBlack,
            }}
          >
            <View
              style={{
                paddingTop: insets.top + 16,
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 2,
                borderBottomColor: COLORS.ironGrey,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setComparisonMode(false);
                  setBeforePhoto(null);
                  setAfterPhoto(null);
                }}
                style={{ marginBottom: 12 }}
              >
                <X color="#fff" size={28} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "900",
                  color: "#fff",
                  letterSpacing: 0.5,
                }}
              >
                BEFORE & AFTER
              </Text>
              <View
                style={{
                  width: 80,
                  height: 3,
                  backgroundColor: COLORS.forgeOrange,
                  marginTop: 8,
                  borderRadius: 2,
                }}
              />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
              <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: COLORS.steelSilver,
                    marginBottom: 16,
                    letterSpacing: 0.3,
                  }}
                >
                  Select Before Photo
                </Text>

                {/* Before Photo Selection */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 32,
                  }}
                >
                  {photos.map((photo) => (
                    <TouchableOpacity
                      key={photo.id}
                      onPress={() => setBeforePhoto(photo)}
                      style={{
                        width: imageSize,
                        height: imageSize * 1.3,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: COLORS.forgedSteel,
                        borderWidth: 3,
                        borderColor:
                          beforePhoto?.id === photo.id
                            ? COLORS.forgeOrange
                            : COLORS.ironGrey,
                      }}
                    >
                      <Image
                        source={photo.url}
                        contentFit="cover"
                        style={{ width: "100%", height: "100%" }}
                        transition={200}
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor:
                            beforePhoto?.id === photo.id
                              ? COLORS.forgeOrange
                              : "rgba(0, 0, 0, 0.8)",
                          padding: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: "#fff",
                            textAlign: "center",
                          }}
                        >
                          {formatDate(photo.date)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: COLORS.steelSilver,
                    marginBottom: 16,
                    letterSpacing: 0.3,
                  }}
                >
                  Select After Photo
                </Text>

                {/* After Photo Selection */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 32,
                  }}
                >
                  {photos.map((photo) => (
                    <TouchableOpacity
                      key={photo.id}
                      onPress={() => setAfterPhoto(photo)}
                      style={{
                        width: imageSize,
                        height: imageSize * 1.3,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: COLORS.forgedSteel,
                        borderWidth: 3,
                        borderColor:
                          afterPhoto?.id === photo.id
                            ? "#10b981"
                            : COLORS.ironGrey,
                      }}
                    >
                      <Image
                        source={photo.url}
                        contentFit="cover"
                        style={{ width: "100%", height: "100%" }}
                        transition={200}
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor:
                            afterPhoto?.id === photo.id
                              ? "#10b981"
                              : "rgba(0, 0, 0, 0.8)",
                          padding: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: "#fff",
                            textAlign: "center",
                          }}
                        >
                          {formatDate(photo.date)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Comparison View */}
                {beforePhoto && afterPhoto && (
                  <View
                    style={{
                      backgroundColor: COLORS.forgedSteel,
                      borderRadius: 18,
                      padding: 20,
                      borderWidth: 2,
                      borderColor: COLORS.forgeOrange,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "900",
                        color: "#fff",
                        marginBottom: 20,
                        textAlign: "center",
                        letterSpacing: 0.5,
                      }}
                    >
                      YOUR TRANSFORMATION
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        marginBottom: 20,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: COLORS.forgeOrange,
                            marginBottom: 8,
                            textAlign: "center",
                            letterSpacing: 0.3,
                          }}
                        >
                          BEFORE
                        </Text>
                        <Image
                          source={beforePhoto.url}
                          contentFit="cover"
                          style={{
                            width: "100%",
                            height: 280,
                            borderRadius: 12,
                          }}
                          transition={200}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.steelSilver,
                            textAlign: "center",
                            marginTop: 8,
                            fontWeight: "600",
                          }}
                        >
                          {formatDate(beforePhoto.date)}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: "#10b981",
                            marginBottom: 8,
                            textAlign: "center",
                            letterSpacing: 0.3,
                          }}
                        >
                          AFTER
                        </Text>
                        <Image
                          source={afterPhoto.url}
                          contentFit="cover"
                          style={{
                            width: "100%",
                            height: 280,
                            borderRadius: 12,
                          }}
                          transition={200}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.steelSilver,
                            textAlign: "center",
                            marginTop: 8,
                            fontWeight: "600",
                          }}
                        >
                          {formatDate(afterPhoto.date)}
                        </Text>
                      </View>
                    </View>

                    {/* Stats Comparison */}
                    <View
                      style={{
                        backgroundColor: COLORS.carbonBlack,
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      {beforePhoto.weight && afterPhoto.weight && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: COLORS.steelSilver,
                            }}
                          >
                            Weight Change
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "900",
                              color:
                                afterPhoto.weight < beforePhoto.weight
                                  ? "#10b981"
                                  : COLORS.forgeOrange,
                              letterSpacing: 0.3,
                            }}
                          >
                            {afterPhoto.weight > beforePhoto.weight ? "+" : ""}
                            {(afterPhoto.weight - beforePhoto.weight).toFixed(
                              1,
                            )}{" "}
                            kg
                          </Text>
                        </View>
                      )}

                      {beforePhoto.bodyFat && afterPhoto.bodyFat && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: COLORS.steelSilver,
                            }}
                          >
                            Body Fat Change
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "900",
                              color:
                                afterPhoto.bodyFat < beforePhoto.bodyFat
                                  ? "#10b981"
                                  : COLORS.forgeOrange,
                              letterSpacing: 0.3,
                            }}
                          >
                            {afterPhoto.bodyFat > beforePhoto.bodyFat
                              ? "+"
                              : ""}
                            {(afterPhoto.bodyFat - beforePhoto.bodyFat).toFixed(
                              1,
                            )}
                            %
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}
