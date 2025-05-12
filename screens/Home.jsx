import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import colors from "../colors";

const userProfilePlaceholder = "https://www.w3schools.com/howto/img_avatar.png";

const Home = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: "OpenSpace",
      headerLeft: () => (
        <FontAwesome
          name="search"
          size={24}
          color={colors.gray}
          style={{ marginLeft: 15 }}
        />
      ),
      headerRight: () => (
        <TouchableOpacity
          testID="goToProfile"
          accessibilityRole="button"
          accessible={true}
          onPress={() => navigation.navigate("UserProfile")}
        >
          <Image
            source={{ uri: userProfilePlaceholder }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Witaj w OpenSpace!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Scanner")}
        testID="scannerButton"
      >
        <Text style={styles.buttonText}>📷 SKANUJ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("GraphicReservation")}
      >
        <Text style={styles.buttonText}>📌 ZAREZERWUJ MIEJSCE</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MyReservations")}
      >
        <Text style={styles.buttonText}>📅 MOJE REZERWACJE</Text>
      </TouchableOpacity>

      {/* Główna ikona czatu (widoczna) */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Chat")}
        style={styles.chatButton}
      >
        <Entypo name="chat" size={24} color={colors.lightGray} />
      </TouchableOpacity>

      {/* Ukryty przycisk do czatu – dla Maestro */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Chat")}
        testID="chatButton"
        style={styles.invisibleButton}
      >
        <Text style={styles.invisibleText}>Czat</Text>
      </TouchableOpacity>

      {/* Ukryty przycisk do profilu – dla Maestro */}
      <TouchableOpacity
        onPress={() => navigation.navigate("UserProfile")}
        testID="profileButton"
        style={styles.invisibleButton}
      >
        <Text style={styles.invisibleText}>Mój profil</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#633a8a",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#633a8a",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: "#6A0DAD",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatButton: {
    backgroundColor: "#633a8a",
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6A0DAD",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    position: "absolute",
    bottom: 50,
    right: 20,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#633a8a",
  },
  invisibleButton: {
    position: "absolute",
    width: 1,
    height: 1,
    bottom: 0,
    left: 0,
    opacity: 0.01,
  },
  invisibleText: {
    fontSize: 1,
    color: "transparent",
  },
});
