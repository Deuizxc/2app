import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Animated, Platform, Alert } from 'react-native';
import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { AppContext } from '../context/AppContext';

const EMOJI_CATEGORIES = [
  { title: 'Study & Work', emojis: ['💻', '📝', '📚', '📂', '📊', '📐', '🧠', '💡', '📌', '📎', '✏️', '📖', '📅', '💼', '🔎'] },
  { title: 'Activities & Fitness', emojis: ['🏋️', '🏃', '🚴', '⚽', '🏀', '🥊', '🧗', '🚶', '🎯', '🧘', '🏊', '🎾', '🥇', '🏆', '🥋'] },
  { title: 'Gaming & Fun', emojis: ['🎮', '🕹️', '👾', '🎧', '🎬', '🍿', '🎨', '🎸', '🎲', '🔥', '🧩', '🎳', '🎤', '🎫', '🎭'] },
  { title: 'Daily & Vibes', emojis: ['☕', '🍔', '🍕', '🚗', '🚌', '✨', '⚡', '🌙', '⭐', '🚀', '🛒', '💸', '📱', '🛌', '🚿'] },
  { title: 'Expressions', emojis: ['😎', '🤖', '🫡', '🥳', '😴', '😤', '👻', '💀', '💯', '✅', '🤔', '😭', '🤯', '🤩', '🤬'] },
  { title: 'Nature & Travel', emojis: ['🌍', '✈️', '🏝️', '🏕️', '🌲', '☀️', '🌧️', '❄️', '🐾', '🦋', '🌊', '🍁', '🌵', '🌋', '⛺'] }
];

const getSafeDate = (d) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
const getSafeTime = (d) => {
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export default function TasksScreen() {
  const { colors, fontSize, setIsSidebarOpen } = useContext(AppContext);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [weekDates, setWeekDates] = useState([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const totalActive = tasks.filter(t => t.status === 'active' || t.status === 'completed').length;
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = totalActive === 0 ? 0 : (totalCompleted / totalActive) * 100;

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progressPercentage, duration: 800, useNativeDriver: false }).start();
  }, [progressPercentage]);

  useEffect(() => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = new Date();
    let week = [];
    for (let i = -3; i <= 3; i++) {
      let d = new Date(today);
      d.setDate(today.getDate() + i);
      week.push({ dayStr: days[d.getDay()], dateNum: d.getDate(), isToday: i === 0 });
    }
    setWeekDates(week);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0); slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    const saved = await AsyncStorage.getItem('@tasks');
    if (saved) setTasks(JSON.parse(saved));
  };

  const saveTasks = async (data) => {
    setTasks(data);
    await AsyncStorage.setItem('@tasks', JSON.stringify(data));
  };

  const handleSelectEmoji = (emoji) => {
    Haptics.selectionAsync();
    setSelectedEmoji(emoji);
    setEmojiPickerVisible(false);
  };

  const addTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (newTask.trim()) {
      const isPast = date < new Date();
      saveTasks([{ 
        id: Math.random().toString(), 
        title: newTask, 
        emoji: selectedEmoji || '📝', 
        deadline: `${getSafeDate(date)} • ${getSafeTime(date)}`, 
        raw: date.toISOString(), status: isPast ? 'missed' : 'active' 
      }, ...tasks]);
      setModalVisible(false); setNewTask(''); setDate(new Date()); setSelectedEmoji('');
    } else {
      Alert.alert("Missing Detail", "Please enter a task name.");
    }
  };

  const updateStatus = async (id, st) => {
    Haptics.notificationAsync(st === 'completed' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    const newData = tasks.map(t => t.id === id ? { ...t, status: st } : t);
    saveTasks(newData);
  };

  const removeTask = (id) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const confirmDelete = (id) => {
    Alert.alert("Remove Task", "Delete this task from the list?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeTask(id) }
    ]);
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const displayedTasks = tasks.filter(t => t.status === activeTab);

  const TAB_META = {
    active: { icon: 'flash-outline', color: '#48C9B0' },
    completed: { icon: 'checkmark-done-outline', color: colors.primary },
    missed: { icon: 'alert-circle-outline', color: '#FF6B6B' }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <LinearGradient colors={[colors.primary, '#0F4FC7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.blueHeader}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.monthText, { fontSize: 22 * fontSize }]}>My Schedule</Text>
            <Text style={styles.monthSub}>{displayedTasks.length === 0 ? 'Nothing due' : `${displayedTasks.length} ${activeTab} task${displayedTasks.length === 1 ? '' : 's'}`}</Text>
          </View>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsSidebarOpen(true); }} style={styles.menuBtn}>
            <Ionicons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarStrip}>
          {weekDates.map((d, index) => (
            <View key={index} style={[styles.dateBlock, d.isToday && styles.dateBlockActive]}>
              <Text style={[styles.dayText, d.isToday && { color: colors.primary }]}>{d.dayStr}</Text>
              <Text style={[styles.dateText, d.isToday && { color: colors.primary }]}>{d.dateNum}</Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Daily Goal</Text>
            <Text style={styles.progressLabel}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={styles.progressFillWrap0}>
              <Animated.View style={[styles.progressFillWrap, { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
                <LinearGradient colors={['#36E08B', '#22C55E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.progressFill} />
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.whiteContainer, { backgroundColor: colors.background, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.tabContainer}>
          <BlurView intensity={20} tint={colors.background === '#0F172A' ? 'dark' : 'light'} style={[styles.tabGlass, { backgroundColor: colors.card }]}>
            {['active', 'completed', 'missed'].map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabButton, activeTab === tab && [styles.activeTabButton, { backgroundColor: colors.background }]]} 
                onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
              >
                <Ionicons name={TAB_META[tab].icon} size={13} color={activeTab === tab ? TAB_META[tab].color : colors.subtext} style={{ marginRight: 5 }} />
                <Text style={[styles.tabText, activeTab === tab ? { color: colors.text } : { color: colors.subtext }]}>
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </BlurView>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {displayedTasks.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="sparkles" size={28} color={colors.subtext} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text, fontSize: 15 * fontSize }]}>You're all caught up!</Text>
            </View>
          )}
          {displayedTasks.map(task => (
            <View key={task.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              <View style={[styles.cardIndicator, { backgroundColor: activeTab === 'active' ? '#48C9B0' : activeTab === 'completed' ? colors.primary : '#FF6B6B' }]} />
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <View style={[styles.emojiBadge, { backgroundColor: colors.background }]}>
                    <Text style={styles.taskEmoji}>{task.emoji}</Text>
                  </View>
                  <Text style={[styles.taskTitle, { color: colors.text, fontSize: 16 * fontSize }, activeTab === 'completed' && [styles.taskTitleDone, { color: colors.subtext }]]} numberOfLines={1}>
                    {task.title}
                  </Text>
                </View>
                <Text style={[styles.taskDate, { color: colors.subtext }]}><Ionicons name="time-outline" size={12} /> {task.deadline}</Text>
              </View>
              
              <View style={styles.actionGroup}>
                {activeTab === 'active' && (
                  <TouchableOpacity activeOpacity={0.85} style={styles.iconBtnDone} onPress={() => updateStatus(task.id, 'completed')}>
                    <Ionicons name="checkmark" size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.threeDotBtn} onPress={() => confirmDelete(task.id)}>
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.subtext} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      <TouchableOpacity activeOpacity={0.85} style={styles.fabWrap} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setModalVisible(true); }}>
        <LinearGradient colors={[colors.primary, '#60C5F1']} style={styles.fab}>
          <Ionicons name="add" size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Task</Text>
            
            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={[styles.emojiPickerTrigger, { backgroundColor: colors.background, borderColor: colors.border }]} 
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEmojiPickerVisible(true); }}
              >
                {selectedEmoji ? (
                  <Text style={styles.selectedEmojiText}>{selectedEmoji}</Text>
                ) : (
                  <View style={styles.emojiPlaceholderContainer}>
                    <Ionicons name="happy-outline" size={24} color={colors.subtext} />
                    <Ionicons name="add" size={12} color={colors.primary} style={styles.miniPlus} />
                  </View>
                )}
              </TouchableOpacity>

              <TextInput 
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
                placeholder="What needs to be done?" 
                placeholderTextColor={colors.subtext} 
                value={newTask} 
                onChangeText={setNewTask} 
              />
            </View>
            
            <View style={styles.pickerRow}>
              <TouchableOpacity style={[styles.pickerBtn, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => { setPickerMode('date'); setShowPicker(true); }}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} /><Text style={[styles.pickerText, { color: colors.text }]}>{getSafeDate(date)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pickerBtn, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => { setPickerMode('time'); setShowPicker(true); }}>
                <Ionicons name="time-outline" size={18} color={colors.primary} /><Text style={[styles.pickerText, { color: colors.text }]}>{getSafeTime(date)}</Text>
              </TouchableOpacity>
            </View>
            
            {showPicker && <DateTimePicker value={date} mode={pickerMode} display="default" onChange={onChangeDate} />}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.background }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.btnText, { color: colors.subtext }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtnWrap} onPress={addTask}>
                <LinearGradient colors={[colors.primary, '#0F4FC7']} style={styles.submitBtn}>
                  <Text style={styles.btnTextSubmit}>Save Task</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={emojiPickerVisible} animationType="slide" transparent={true}>
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.sheetHeader, { borderColor: colors.border }]}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose an Icon</Text>
              <TouchableOpacity onPress={() => setEmojiPickerVisible(false)} style={[styles.sheetCloseBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.sheetScroll}>
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <View key={idx} style={styles.categorySection}>
                  <Text style={[styles.categoryTitle, { color: colors.subtext }]}>{cat.title}</Text>
                  <View style={styles.emojiGrid}>
                    {cat.emojis.map((emoji, eIdx) => (
                      <TouchableOpacity 
                        key={eIdx} 
                        style={[styles.gridEmojiItem, { backgroundColor: colors.background, borderColor: colors.border }]} 
                        onPress={() => handleSelectEmoji(emoji)}
                      >
                        <Text style={styles.gridEmojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blueHeader: { paddingTop: 58, paddingBottom: 30 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  monthText: { fontFamily: 'Poppins_700Bold', color: '#FFF' },
  monthSub: { fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  menuBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  calendarStrip: { paddingHorizontal: 15 },
  dateBlock: { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 18, borderRadius: 25, marginHorizontal: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
  dateBlockActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  dayText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins_700Bold', marginBottom: 5 },
  dateText: { fontSize: 18, color: '#FFF', fontFamily: 'Poppins_700Bold' },
  progressContainer: { paddingHorizontal: 25, marginTop: 25 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  progressFillWrap0: { flex: 1 },
  progressFillWrap: { height: '100%', borderRadius: 4, overflow: 'hidden' },
  progressFill: { flex: 1 },
  whiteContainer: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 25 },
  tabContainer: { paddingHorizontal: 20, marginBottom: 20 },
  tabGlass: { flexDirection: 'row', borderRadius: 30, padding: 5 },
  tabButton: { flex: 1, flexDirection: 'row', paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 25 },
  activeTabButton: { elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  tabText: { fontSize: 12, fontFamily: 'Poppins_700Bold' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 12 },
  emptyText: { fontFamily: 'Poppins_700Bold' },
  card: { flexDirection: 'row', borderRadius: 20, marginBottom: 14, overflow: 'hidden', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  cardIndicator: { width: 5, height: '100%' },
  cardContent: { flex: 1, padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 10 },
  emojiBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  taskEmoji: { fontSize: 16 },
  taskTitle: { flex: 1, fontFamily: 'Poppins_600SemiBold' },
  taskTitleDone: { textDecorationLine: 'line-through' },
  taskDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', marginLeft: 42 },
  actionGroup: { flexDirection: 'row', paddingRight: 10, alignItems: 'center' },
  iconBtnDone: { backgroundColor: '#48C9B0', padding: 10, borderRadius: 12, marginRight: 5 },
  threeDotBtn: { padding: 8 },
  fabWrap: { position: 'absolute', bottom: 90, right: 20, shadowColor: '#1D70F5', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  fab: { width: 65, height: 65, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { padding: 25, borderRadius: 26, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  modalTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', marginBottom: 18 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20, alignItems: 'center' },
  emojiPickerTrigger: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  emojiPlaceholderContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  miniPlus: { position: 'absolute', top: -3, right: -4 },
  selectedEmojiText: { fontSize: 26 },
  textInput: { flex: 1, borderRadius: 15, paddingHorizontal: 18, fontSize: 16, fontFamily: 'Poppins_400Regular', height: 60, borderWidth: 1 },
  pickerRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  pickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 15, gap: 8, borderWidth: 1 },
  pickerText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 15, alignItems: 'center' },
  submitBtnWrap: { flex: 1, borderRadius: 15, overflow: 'hidden' },
  submitBtn: { flex: 1, padding: 16, borderRadius: 15, alignItems: 'center' },
  btnText: { fontFamily: 'Poppins_700Bold', fontSize: 15 },
  btnTextSubmit: { color: '#FFFFFF', fontFamily: 'Poppins_700Bold', fontSize: 15 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetContainer: { borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '60%', paddingBottom: 30 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1 },
  sheetTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold' },
  sheetCloseBtn: { padding: 6, borderRadius: 20 },
  sheetScroll: { paddingHorizontal: 20, paddingTop: 15 },
  categorySection: { marginBottom: 20 },
  categoryTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridEmojiItem: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  gridEmojiText: { fontSize: 24 }
});