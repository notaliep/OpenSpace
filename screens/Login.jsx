import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

const backImage = require("../assets/backImage.png");

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onHandleLogin = () => {
    setErrorMessage("");
    if (email !== "" && password !== "") {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => console.log("Login success"))
        .catch(() =>
          setErrorMessage("Niepoprawny email lub hasło. Spróbuj ponownie.")
        );
    } else {
      setErrorMessage("Proszę wypełnić wszystkie pola.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Logowanie</Text>
        <TextInput
          style={styles.input}
          placeholder="Wpisz email"
          accessibilityLabel="loginEmail"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus
          value={email}
          onChangeText={setEmail}
        />
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            placeholder="Wpisz hasło"
            accessibilityLabel="loginPassword"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showPassword}
            textContentType="password"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={{ position: "absolute", right: 16, top: 16 }}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel="togglePasswordVisibility"
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={onHandleLogin}
          accessibilityLabel="loginButton"
        >
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
            Zaloguj
          </Text>
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Nie masz konta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            accessibilityLabel="goToSignup"
          >
            <Text style={styles.linkAction}> Zarejestruj się</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#633a8a",
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
    paddingRight: 44,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  backImage: {
    width: "100%",
    height: 340,
    position: "absolute",
    top: 0,
    resizeMode: "cover",
  },
  whiteSheet: {
    width: "100%",
    height: "75%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: "#633a8a",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  linkContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  linkText: {
    color: "gray",
    fontWeight: "600",
    fontSize: 14,
  },
  linkAction: {
    color: "#633a8a",
    fontWeight: "600",
    fontSize: 14,
  },
});
