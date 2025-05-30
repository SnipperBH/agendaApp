import { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/screens/LoginScreen');
      //router.replace('/screens/HomeScreen');
      //router.push('/screens/UserScreen')
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CA1F76',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { width: 350, height: 350, marginBottom: 20 },
  text: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
});
