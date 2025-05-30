// components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) {
        router.replace("../screens/LoginScreen"); // redireciona se não estiver logado
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#CA1F76" />
      </View>
    );
  }

  return <>{children}</>;
}
