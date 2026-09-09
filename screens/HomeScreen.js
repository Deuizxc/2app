import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Animated, Alert, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, addDoc, onSnapshot, doc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppContext } from '../context/AppContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen({ navigation }) {
  const { userName, colors, fontSize, isAdmin, setIsSidebarOpen } = useContext(AppContext);
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(shimmerAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(shimmerAnim, { toValue: 0.3, duration: 800, useNativeDriver: true })
    ])).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0); slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();

      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
      return () => unsubscribe();
    }, [])
  );

  const toggleExpand = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const addAnnouncement = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!newTitle.trim() || !newBody.trim()) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        title: newTitle, body: newBody, author: 'Admin', date: new Date().toLocaleDateString(), createdAt: serverTimestamp()
      });
      setModalVisible(false); setNewTitle(''); setNewBody('');
    } catch (error) {
      Alert.alert("Error", "Could not post.");
    }
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete Post", "Remove this announcement?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, 'announcements', id)) }
    ]);
  };

  const isDark = colors.background === '#0F172A';
  const initial = (userName || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.bgBlobBlue} />
      <View style={styles.bgBlobCyan} />

      <Animated.ScrollView style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerArea}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={[colors.primary, '#60C5F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarBadge}>
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
            <View>
              <Text style={[styles.greetingText, { color: colors.text, fontSize: 24 * fontSize }]}>Hello, {userName} 👋</Text>
              <Text style={[styles.subGreeting, { color: colors.subtext, fontSize: 13 * fontSize }]}>SBIT-2A Student Hub</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsSidebarOpen(true); }} style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickGlanceRow}>
          <TouchableOpacity activeOpacity={0.85} style={styles.glanceCard} onPress={() => navigation.navigate('Planner')}>
            <LinearGradient colors={isDark ? ['#1E3A8A', '#1D4ED8'] : ['#DCEBFF', '#F0F7FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.glanceGlass, { borderColor: colors.border }]}>
              <View style={[styles.glanceIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(29,112,245,0.12)' }]}>
                <Ionicons name="calendar" size={22} color={isDark ? '#93C5FD' : colors.primary} />
              </View>
              <Text style={[styles.glanceTitle, { color: isDark ? '#FFF' : '#1E3A5F' }]}>Schedule</Text>
              <Text style={[styles.glanceSub, { color: isDark ? 'rgba(255,255,255,0.6)' : '#5B7CA0' }]}>View classes</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.glanceCard} onPress={() => navigation.navigate('Tasks')}>
            <LinearGradient colors={isDark ? ['#065F46', '#059669'] : ['#DFFAF0', '#F0FFF9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.glanceGlass, { borderColor: colors.border }]}>
              <View style={[styles.glanceIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(54,224,139,0.15)' }]}>
                <Ionicons name="checkbox" size={22} color={isDark ? '#6EE7B7' : '#1DA36A'} />
              </View>
              <Text style={[styles.glanceTitle, { color: isDark ? '#FFF' : '#1E3A5F' }]}>My Tasks</Text>
              <Text style={[styles.glanceSub, { color: isDark ? 'rgba(255,255,255,0.6)' : '#5B7CA0' }]}>Stay on track</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 18 * fontSize }]}>Latest Announcements</Text>
          <View style={[styles.sectionPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionPillText, { color: colors.subtext }]}>{announcements.length}</Text>
          </View>
        </View>

        {loading ? (
          [1, 2].map((key) => (
            <Animated.View key={key} style={[styles.card, { backgroundColor: colors.card, opacity: shimmerAnim, borderColor: colors.border, borderWidth: 1 }]}>
              <View style={{ width: '60%', height: 20, backgroundColor: colors.border, borderRadius: 10, marginBottom: 10 }} />
              <View style={{ width: '100%', height: 14, backgroundColor: colors.border, borderRadius: 5, marginBottom: 6 }} />
              <View style={{ width: '80%', height: 14, backgroundColor: colors.border, borderRadius: 5 }} />
            </Animated.View>
          ))
        ) : announcements.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="megaphone-outline" size={30} color={colors.subtext} />
            </View>
            <Text style={[styles.emptyText, { color: colors.subtext, fontSize: 14 * fontSize }]}>No announcements yet</Text>
          </View>
        ) : (
          announcements.map((post) => (
            <TouchableOpacity key={post.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]} activeOpacity={0.92} onPress={() => toggleExpand(post.id)}>
              <View style={styles.cardHeader}>
                <Text style={[styles.title, { color: colors.text, fontSize: 16 * fontSize }]}>{post.title}</Text>
                <View style={[styles.datePill, { backgroundColor: `${colors.primary}1A` }]}>
                  <Text style={[styles.date, { color: colors.primary }]}>{post.date}</Text>
                </View>
              </View>
              
              <Text style={[styles.body, { color: colors.subtext, fontSize: 14 * fontSize }]} numberOfLines={expandedId === post.id ? 0 : 3}>
                {post.body}
              </Text>
              
              {post.body.length > 100 && expandedId !== post.id && (
                <Text style={[styles.readMore, { color: colors.primary }]}>Read More <Ionicons name="chevron-down" size={11} /></Text>
              )}
              {expandedId === post.id && (
                <Text style={[styles.readMore, { color: colors.primary }]}>Show Less <Ionicons name="chevron-up" size={11} /></Text>
              )}

              {isAdmin && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(post.id)}>
                  <Ionicons name="trash-outline" size={12} color="#FF6B6B" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        )}
      </Animated.ScrollView>

      {isAdmin && (
        <TouchableOpacity activeOpacity={0.85} style={styles.fabWrap} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setModalVisible(true); }}>
          <LinearGradient colors={[colors.primary, '#60C5F1']} style={styles.fab}>
            <Ionicons name="add" size={30} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Post Update</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Title" placeholderTextColor={colors.subtext} value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, height: 100, textAlignVertical: 'top', borderColor: colors.border }]} placeholder="Message" placeholderTextColor={colors.subtext} value={newBody} onChangeText={setNewBody} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.border }]} onPress={() => setModalVisible(false)}><Text style={{color: colors.text, fontFamily: 'Poppins_700Bold'}}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtnWrap} onPress={addAnnouncement}>
                <LinearGradient colors={[colors.primary, '#60C5F1']} style={styles.submitBtn}>
                  <Text style={{color: '#FFF', fontFamily: 'Poppins_700Bold'}}>Post</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgBlobBlue: { position: 'absolute', top: -50, right: -100, width: 400, height: 400, backgroundColor: '#1D70F5', borderRadius: 200, opacity: 0.12 },
  bgBlobCyan: { position: 'absolute', top: 150, left: -100, width: 300, height: 300, backgroundColor: '#60C5F1', borderRadius: 150, opacity: 0.12 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 65, paddingHorizontal: 25, paddingBottom: 22 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  avatarBadge: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', shadowColor: '#1D70F5', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  avatarText: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 18 },
  greetingText: { fontFamily: 'Poppins_700Bold' },
  subGreeting: { fontFamily: 'Poppins_400Regular', marginTop: 2 },
  menuBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  quickGlanceRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 14, marginBottom: 28 },
  glanceCard: { flex: 1, borderRadius: 22, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  glanceGlass: { padding: 16, borderWidth: 1, minHeight: 118, justifyContent: 'center' },
  glanceIconCircle: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  glanceTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15 },
  glanceSub: { fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 25, marginBottom: 15 },
  sectionTitle: { fontFamily: 'Poppins_700Bold' },
  sectionPill: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  sectionPillText: { fontFamily: 'Poppins_700Bold', fontSize: 11 },
  card: { padding: 20, borderRadius: 22, marginHorizontal: 20, marginBottom: 15, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  title: { fontFamily: 'Poppins_700Bold', flex: 1 },
  datePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  date: { fontSize: 11, fontFamily: 'Poppins_700Bold' },
  body: { fontFamily: 'Poppins_400Regular', lineHeight: 22 },
  readMore: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, marginTop: 8 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255, 107, 107, 0.1)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 15 },
  deleteText: { color: '#FF6B6B', fontSize: 11, fontFamily: 'Poppins_700Bold' },
  emptyState: { alignItems: 'center', marginTop: 30, paddingVertical: 20 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 12 },
  emptyText: { fontFamily: 'Poppins_600SemiBold' },
  fabWrap: { position: 'absolute', bottom: 90, right: 20, shadowColor: '#1D70F5', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  fab: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { padding: 25, borderRadius: 26, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', marginBottom: 20 },
  input: { borderRadius: 14, padding: 15, marginBottom: 15, fontFamily: 'Poppins_400Regular', borderWidth: 1 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 14, alignItems: 'center' },
  submitBtnWrap: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  submitBtn: { flex: 1, padding: 15, borderRadius: 14, alignItems: 'center' }
});