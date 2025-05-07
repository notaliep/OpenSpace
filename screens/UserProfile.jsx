import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  signOut,
} from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Funkcja do przesyłania obrazu do Firebase Storage
const uploadImage = async (uri) => {
  const storage = getStorage();
  const imageRef = ref(storage, "profile_pictures/" + new Date().getTime());

  const response = await fetch(uri);
  const blob = await response.blob();

  const snapshot = await uploadBytes(imageRef, blob);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

const UserProfile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();

  const [email, setEmail] = useState(user?.email || "");
  const [photoURL, setPhotoURL] = useState(
    user?.photoURL || "https://www.w3schools.com/howto/img_avatar.png"
  );
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setPhotoURL(
        user.photoURL || "https://www.w3schools.com/howto/img_avatar.png"
      );
    }

    navigation.setOptions({
      title: "Profil użytkownika",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 20,
      },
    });
  }, [user, navigation]);

  const checkPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Błąd", "Brak uprawnień do galerii");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const permissionGranted = await checkPermission();
    if (!permissionGranted) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (user) {
        const photoURLToUse = photoURL.startsWith("http")
          ? photoURL
          : await uploadImage(photoURL);
        await updateProfile(user, { photoURL: photoURLToUse });
        Alert.alert("Sukces", "Profil został zaktualizowany!");
      }
    } catch (error) {
      Alert.alert("Błąd", error.message);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      if (user) {
        await updateEmail(user, email);
        Alert.alert("Sukces", "E-mail został zaktualizowany!");
      }
    } catch (error) {
      Alert.alert("Błąd", error.message);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (newPassword.length < 6) {
        Alert.alert("Błąd", "Hasło musi mieć co najmniej 6 znaków!");
        return;
      }
      await updatePassword(user, newPassword);
      Alert.alert("Sukces", "Hasło zostało zmienione!");
      await auth.signOut();
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Błąd", error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Sukces", "Zostałeś wylogowany!");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Błąd", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: photoURL }} style={styles.profileImage} />
      </TouchableOpacity>

      <Text style={styles.label}>Nowy e-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Podaj nowy e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
        <Text style={styles.buttonText}>Zmień e-mail</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />

      <Text style={styles.label}>Nowe hasło</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Podaj nowe hasło"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Zmień hasło</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Zapisz zmiany</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutButtonText}>Wyloguj się</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Powrót</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#6A0DAD",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    width: "85%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  spacer: {
    height: 20,
  },
  button: {
    backgroundColor: "#633a8a",
    paddingVertical: 12,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButtonText: {
    color: "#6A0DAD",
    fontSize: 16,
    marginTop: 20,
  },
});
