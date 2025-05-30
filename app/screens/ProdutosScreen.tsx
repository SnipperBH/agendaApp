import React, { useContext, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProtectedRoute from '../context/ProtectdRoute';

export default function PtodutosScreen() {
  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Text>Produtos</Text>
        <TouchableOpacity onPress={() => router.replace('./HomeScreen')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#C91F75',
    alignItems: 'center',
    paddingVertical: 80,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    color: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  half: {
    width: '48%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    marginBottom: 12,
    justifyContent: 'center',
  },
  picker: {
    color: '#fff',
    height: 50,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    color: '#fff',
    marginRight: 8,
  },
  button: {
    backgroundColor: '#D2568D',
    paddingVertical: 14,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,

    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    // Sombra para Android
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 30,
    marginBottom: 10,
  },
  backText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 6,
  },
  hr: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginBottom: 20,
  },
});
