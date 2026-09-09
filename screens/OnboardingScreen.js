import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function OnboardingScreen() {
  const { completeOnboarding } = useContext(AppContext);
  const [name, setName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedFont, setSelectedFont] = useState(1);

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (name.trim()) completeOnboarding(name.trim(), selectedTheme, selectedFont);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.content}>
        <View style={styles.header}>
          <LinearGradient colors={['#1D70F5', '#60C5F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconBadge}>
            <Ionicons name="rocket" size={36} color="#FFF" />
          </LinearGradient>
          <Text style={styles.title}>Welcome to SBIT-2A Hub!</Text>
          <Text style={styles.subtitle}>Let's customize your workspace.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.label}>What should we call you?</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your nickname..." 
              placeholderTextColor="#A0AEC0"
              value={name} 
              onChangeText={setName} 
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Choose your theme</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setSelectedTheme('light')} style={[styles.optionBtn, selectedTheme === 'light' && styles.optionActive]}>
                <Ionicons name="sunny" size={20} color={selectedTheme === 'light' ? '#1D70F5' : '#7F8C8D'} />
                <Text style={[styles.optionText, selectedTheme === 'light' && styles.textActive]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedTheme('dark')} style={[styles.optionBtn, selectedTheme === 'dark' && styles.optionActive]}>
                <Ionicons name="moon" size={20} color={selectedTheme === 'dark' ? '#1D70F5' : '#7F8C8D'} />
                <Text style={[styles.optionText, selectedTheme === 'dark' && styles.textActive]}>Dark</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Choose text size</Text>
            <View style={styles.row}>
              {[0.9, 1, 1.15].map(size => (
                <TouchableOpacity key={size} onPress={() => setSelectedFont(size)} style={[styles.optionBtn, selectedFont === size && styles.optionActive]}>
                  <Text style={[styles.optionText, selectedFont === size && styles.textActive, { fontSize: 14 * size }]}>
                    {size === 0.9 ? 'Aa' : size === 1 ? 'AA' : 'AAA'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            activeOpacity={0.88}
            style={styles.btnWrap} 
            onPress={handleFinish} 
            disabled={!name.trim()}
          >
            <LinearGradient
              colors={name.trim() ? ['#1D70F5', '#0F4FC7'] : ['#B8C7E0', '#B8C7E0']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Enter Hub</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F9FF' },
  blobTop: { position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: '#1D70F5', opacity: 0.1 },
  blobBottom: { position: 'absolute', bottom: -100, left: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: '#60C5F1', opacity: 0.12 },
  content: { flex: 1, justifyContent: 'center', padding: 26 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconBadge: { width: 84, height: 84, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#1D70F5', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  title: { fontSize: 23, fontFamily: 'Poppins_700Bold', color: '#2C3E50', textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#7F8C8D', marginTop: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 28, padding: 24, shadowColor: '#1D70F5', shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  section: { marginBottom: 22 },
  label: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: '#2C3E50', marginBottom: 10 },
  input: { backgroundColor: '#F7FAFF', padding: 17, borderRadius: 15, fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#2C3E50', borderWidth: 1.5, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', gap: 10 },
  optionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F7FAFF', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  optionActive: { borderColor: '#1D70F5', backgroundColor: '#EFF6FF' },
  optionText: { fontFamily: 'Poppins_600SemiBold', color: '#7F8C8D' },
  textActive: { color: '#1D70F5' },
  btnWrap: { marginTop: 6, borderRadius: 15, overflow: 'hidden' },
  btn: { padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 17 }
});