import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    login(email, password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Input email com ícone */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={24}
            color="#fff"
            style={styles.icon}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#fff"
            style={styles.input}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Input senha com ícone e botão mostrar/ocultar */}
        <View style={styles.inputContainer}>
          <Feather name="key" size={24} color="#fff" style={styles.icon} />
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#fff"
            secureTextEntry={!showPassword}
            style={styles.input}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconButton}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Botões registrar e recuperar senha */}
        <View style={styles.row}>
          <TouchableOpacity onPress={() => router.replace("./RegisterScreen")}>
            <Text style={styles.link}>Registrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("./RecoveryPasswordScreen")}
          >
            <Text style={styles.link}>Recuperar Senha</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#CA1F76",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  logo: { width: 350, height: 350, marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    width: "80%",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  iconButton: {
    padding: 4,
  },

  input: {
    flex: 1,
    color: "#fff",
    height: 40,
  },
  button: {
    backgroundColor: "#D2568D",
    paddingVertical: 14,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    marginTop: 20,

    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    // Sombra para Android
    elevation: 8,
  },

  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },
  link: {
    color: "#fff",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
