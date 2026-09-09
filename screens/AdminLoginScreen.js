import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function AdminLoginScreen({ navigation }) {
  const { setIsAdmin, colors } = useContext(AppContext);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Hardcoded master password for SBIT-2A admins
    if (password === 'sbit2admin') {
      setIsAdmin(true);
      navigation.goBack();
      setTimeout(() => Alert.alert("Admin Access Granted", "You can now delete posts and make announcements."), 500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Access Denied", "Incorrect admin password.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.blobTop, { backgroundColor: colors.primary }]} />

      <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        <LinearGradient colors={[colors.primary, '#60C5F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconBadge}>
          <Ionicons name="shield-checkmark" size={38} color="#FFF" />
        </LinearGradient>
        <Text style={[styles.title, { color: colors.text }]}>Admin Authentication</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Restricted to SBIT-2A Class Officers</Text>
        
        <TextInput 
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} 
          placeholder="Enter Master Password" 
          placeholderTextColor={colors.subtext}
          secureTextEntry 
          value={password} 
          onChangeText={setPassword} 
          autoCapitalize="none"
        />
        
        <TouchableOpacity activeOpacity={0.88} style={styles.btnWrap} onPress={handleLogin}>
          <LinearGradient colors={[colors.primary, '#0F4FC7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
            <Text style={styles.btnText}>Authenticate</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobTop: { position: 'absolute', top: -120, left: -60, width: 260, height: 260, borderRadius: 130, opacity: 0.08 },
  backBtn: { position: 'absolute', top: 50, right: 25, zIndex: 10, padding: 10, borderRadius: 14, borderWidth: 1 },
  center: { flex: 1, justifyContent: 'center', padding: 30 },
  iconBadge: { width: 84, height: 84, borderRadius: 26, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 22, shadowColor: '#1D70F5', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', textAlign: 'center', marginTop: 6, marginBottom: 36 },
  input: { padding: 19, borderRadius: 16, fontFamily: 'Poppins_600SemiBold', marginBottom: 20, borderWidth: 1.5, fontSize: 16, textAlign: 'center' },
  btnWrap: { borderRadius: 16, overflow: 'hidden' },
  btn: { padding: 19, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 16 }
});