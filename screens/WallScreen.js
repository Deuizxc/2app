import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Animated, Alert } from 'react-native';
import { useState, useCallback, useRef, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import * as Haptics from 'expo-haptics';

export default function WallScreen() {
  const { colors, fontSize, isAdmin, setIsSidebarOpen } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0); slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();
      
      const q = query(collection(db, 'wall'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      
      return () => unsubscribe();
    }, [])
  );

  const postMessage = async () => {
    if (!newMessage.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const safeTime = `${hours}:${minutes} ${ampm}`;

    try {
      await addDoc(collection(db, 'wall'), {
        text: newMessage,
        author: 'Anonymous',
        time: safeTime,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      Alert.alert("Error", "Could not post message. Check your connection.");
    }
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete Post", "Are you sure you want to wipe this message?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, 'wall', id)) }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.blobViolet} />
      <View style={styles.blobGreen} />
      <View style={styles.blobBlue} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.headerArea}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: 26 * fontSize }]}>Freedom Wall</Text>
            <Text style={[styles.headerSub, { color: colors.subtext, fontSize: 13 * fontSize }]}>Say it anonymously</Text>
          </View>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsSidebarOpen(true); }} style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.subtext} />
              </View>
              <Text style={[styles.emptyText, { color: colors.subtext, fontSize: 14 * fontSize }]}>Be the first to whisper something</Text>
            </View>
          )}
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.bubbleTopRow}>
                <View style={[styles.avatarChip, { backgroundColor: colors.background }]}>
                  <Text style={styles.avatarEmoji}>👻</Text>
                </View>
                <Text style={[styles.metaText, { color: colors.subtext }]}>{msg.author} • {msg.time}</Text>
              </View>
              <Text style={[styles.msgText, { color: colors.text, fontSize: 16 * fontSize }]}>{msg.text}</Text>
              {isAdmin && (
                <TouchableOpacity style={styles.wipeBtn} onPress={() => confirmDelete(msg.id)}>
                  <Ionicons name="trash-outline" size={11} color="#FF6B6B" />
                  <Text style={styles.delText}>Wipe</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      <View style={[styles.inputArea, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Whisper something..."
          placeholderTextColor={colors.subtext}
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity activeOpacity={0.85} style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={postMessage}>
          <Ionicons name="paper-plane" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobViolet: { position: 'absolute', top: -50, right: -50, width: 350, height: 350, backgroundColor: '#6D5AED', borderRadius: 175, opacity: 0.2 },
  blobGreen: { position: 'absolute', bottom: 100, left: -100, width: 300, height: 300, backgroundColor: '#36E08B', borderRadius: 150, opacity: 0.2 },
  blobBlue: { position: 'absolute', top: '30%', left: '20%', width: 250, height: 250, backgroundColor: '#1D70F5', borderRadius: 125, opacity: 0.15 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 65, paddingHorizontal: 25, paddingBottom: 20 },
  headerTitle: { fontFamily: 'Poppins_700Bold' },
  headerSub: { fontFamily: 'Poppins_400Regular', marginTop: 2 },
  menuBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyIconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 12 },
  emptyText: { fontFamily: 'Poppins_500Medium' },
  bubble: { padding: 18, borderRadius: 24, marginBottom: 14, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  bubbleTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  avatarChip: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 14 },
  msgText: { fontFamily: 'Poppins_600SemiBold', lineHeight: 24, marginBottom: 4 },
  metaText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  wipeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 6 },
  delText: { color: '#FF6B6B', fontSize: 12, fontFamily: 'Poppins_700Bold' },
  inputArea: { position: 'absolute', bottom: 85, left: 15, right: 15, flexDirection: 'row', padding: 10, borderRadius: 30, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 20, marginRight: 10, fontSize: 15, fontFamily: 'Poppins_400Regular' },
  sendBtn: { width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});