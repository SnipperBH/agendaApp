import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../services/api';
import { router } from 'expo-router';
import io from 'socket.io-client';
import { API_URL } from '@env';

export const AuthContext = createContext();
const socket = io(process.env.API_URL);

export default AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      const accessToken = response.data?.access_token;
      const userData = response.data?.user;

      if (!accessToken || !userData) {
        throw new Error('Resposta inválida do servidor.');
      }

      // Armazena token e usuário no AsyncStorage
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Atualiza estado do contexto
      setToken(accessToken);
      setUser(userData);

      // Navega para tela principal
      router.replace('/screens/HomeScreen');
    } catch (error) {
      Alert.alert('Erro no login', 'Verifique suas credenciais e tente novamente.');
    }
  };

  const updateUser = async () => {
    try {
      const response = await api.get(`/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;

      // Atualiza o estado global e o AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      console.log('Erro ao buscar dados do usuário:', err);
    }
  };

  useEffect(() => {
    socket.on('user-updated', updateUser);
    return () => {
      socket.off('user-updated', updateUser);
    };
  }, []);

  const logout = async (router) => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
