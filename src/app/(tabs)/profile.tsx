import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type User = {
  id: number;
  email: string;
  name?: string | null;
};

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const token =
        await SecureStore.getItemAsync("token");

      if (!token) {
        router.replace("/");
        return;
      }

      const response = await fetch(
        "http://192.168.1.126:3000/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Hata",
          data.message ||
            "Profil bilgileri alınamadı."
        );
        return;
      }

      setUser(data.user || data);
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Bağlantı hatası",
        "Backend sunucusuna bağlanamadı."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const logout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkmak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync(
              "token"
            );

            router.replace("/");
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (!user?.name) {
      return "?";
    }

    const parts = user.name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 1)
        .toUpperCase();
    }

    return (
      parts[0].substring(0, 1) +
      parts[parts.length - 1].substring(0, 1)
    ).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Profil yükleniyor...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Profil bilgileri bulunamadı.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Profil
      </Text>

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials()}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.name}>
            {user.name ||
              "İsimsiz Kullanıcı"}
          </Text>

          <Text style={styles.email}>
            {user.email}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Ad Soyad
          </Text>

          <Text style={styles.value}>
            {user.name ||
              "Belirtilmemiş"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            E-posta
          </Text>

          <Text
            style={styles.value}
            numberOfLines={1}
          >
            {user.email}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>
            Kullanıcı ID
          </Text>

          <Text style={styles.value}>
            #{user.id}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutButtonText}>
          Çıkış Yap
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  avatarText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
  },

  headerInfo: {
    flex: 1,
  },

  name: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 5,
  },

  email: {
    fontSize: 14,
    color: "#666",
  },

  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },

  infoRow: {
    paddingVertical: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#777",
    marginBottom: 6,
  },

  value: {
    fontSize: 17,
    color: "#222",
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
  },

  logoutButton: {
    marginTop: 25,
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  errorText: {
    fontSize: 18,
  },
});