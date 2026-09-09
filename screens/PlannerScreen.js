import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useCallback, useRef, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import * as Haptics from 'expo-haptics';

const TYPE_STYLES = {
  Lecture: { color: '#1D70F5', bg: 'rgba(29, 112, 245, 0.1)', icon: 'book-outline' },
  Laboratory: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', icon: 'flask-outline' },
  Activity: { color: '#36E08B', bg: 'rgba(54, 224, 139, 0.12)', icon: 'fitness-outline' }
};

export default function PlannerScreen() {
  const { colors, fontSize, setIsSidebarOpen } = useContext(AppContext);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0); slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();
    }, [])
  );

  const schedule = [
    // MONDAY
    { id: 1, day: 'MONDAY', subject: 'Object-Oriented Programming (PF 101)', time: '07:30 AM - 09:30 AM', room: 'IL603a', type: 'Lecture' },
    { id: 2, day: 'MONDAY', subject: 'Object-Oriented Programming (PF 101)', time: '11:00 AM - 02:00 PM', room: 'IK504 F1', type: 'Laboratory' },
    { id: 3, day: 'MONDAY', subject: 'Discrete Mathematics (MS 101)', time: '06:00 PM - 09:00 PM', room: 'IL304a', type: 'Lecture' },

    // TUESDAY
    { id: 4, day: 'TUESDAY', subject: 'Information Management (CC 105)', time: '07:00 AM - 09:00 AM', room: 'IL604a', type: 'Lecture' },
    { id: 5, day: 'TUESDAY', subject: 'Information Management (CC 105)', time: '10:30 AM - 01:30 PM', room: 'IE207c', type: 'Laboratory' },
    { id: 6, day: 'TUESDAY', subject: 'Technopreneurship (TECHNO 1)', time: '02:30 PM - 05:30 PM', room: 'IL503a', type: 'Lecture' },
    { id: 7, day: 'TUESDAY', subject: 'IS Project Management (IS 106)', time: '06:00 PM - 09:00 PM', room: 'IL603a', type: 'Lecture' },

    // WEDNESDAY
    { id: 8, day: 'WEDNESDAY', subject: 'Networking 1 (NET 101)', time: '07:00 AM - 10:00 AM', room: 'IK504 F1', type: 'Laboratory' },
    { id: 9, day: 'WEDNESDAY', subject: 'Networking 1 (NET 101)', time: '11:30 AM - 01:30 PM', room: 'IL604a', type: 'Lecture' },

    // THURSDAY
    { id: 10, day: 'THURSDAY', subject: 'Data Structures and Algorithms (CC 104)', time: '07:00 AM - 09:00 AM', room: 'IL604a', type: 'Lecture' },
    { id: 11, day: 'THURSDAY', subject: 'Data Structures and Algorithms (CC 104)', time: '10:30 AM - 01:30 PM', room: 'IE207c', type: 'Laboratory' },

    // SATURDAY
    { id: 12, day: 'SATURDAY', subject: 'Physical Activities Toward Health and Fitness 3 (PATHFIT 3)', time: '02:30 PM - 04:30 PM', room: 'SB OG', type: 'Activity' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerArea}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: 26 * fontSize }]}>Class Planner</Text>
            <Text style={[styles.headerSub, { color: colors.subtext, fontSize: 13 * fontSize }]}>Your weekly schedule</Text>
          </View>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsSidebarOpen(true); }} style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {schedule.map((item, index) => {
            const showDayHeader = index === 0 || schedule[index - 1].day !== item.day;
            const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.Lecture;
            return (
              <View key={item.id}>
                {showDayHeader && (
                  <View style={styles.dayHeaderRow}>
                    <View style={[styles.dayHeaderDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.dayHeaderTitle, { color: colors.text, fontSize: 15 * fontSize }]}>
                      {item.day}
                    </Text>
                  </View>
                )}
                <View style={styles.ticketWrapper}>
                  <View style={[styles.ticketTop, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
                        <Ionicons name={typeStyle.icon} size={12} color={typeStyle.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.typeText, { color: typeStyle.color }]}>{item.type}</Text>
                      </View>
                    </View>
                    <Text style={[styles.subjectText, { color: colors.text, fontSize: 17 * fontSize }]} numberOfLines={2}>{item.subject}</Text>
                  </View>
                  
                  <View style={styles.ticketDividerRow}>
                    <View style={[styles.cutoutLeft, { backgroundColor: colors.background }]} />
                    <View style={[styles.dashedLine, { borderColor: colors.border }]} />
                    <View style={[styles.cutoutRight, { backgroundColor: colors.background }]} />
                  </View>

                  <View style={[styles.ticketBottom, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.infoCol}>
                      <View style={styles.infoLabelRow}>
                        <Ionicons name="time-outline" size={11} color={colors.subtext} />
                        <Text style={[styles.infoLabel, { color: colors.subtext, fontSize: 11 * fontSize }]}>TIME</Text>
                      </View>
                      <Text style={[styles.infoValue, { color: typeStyle.color, fontSize: 13 * fontSize }]}>{item.time}</Text>
                    </View>
                    <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
                      <View style={styles.infoLabelRow}>
                        <Text style={[styles.infoLabel, { color: colors.subtext, fontSize: 11 * fontSize }]}>ROOM</Text>
                        <Ionicons name="location-outline" size={11} color={colors.subtext} />
                      </View>
                      <Text style={[styles.infoValue, { color: colors.text, fontSize: 13 * fontSize }]}>{item.room}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 65, paddingHorizontal: 25, paddingBottom: 22 },
  headerTitle: { fontFamily: 'Poppins_700Bold' },
  headerSub: { fontFamily: 'Poppins_400Regular', marginTop: 2 },
  menuBtn: { padding: 10, borderRadius: 14, borderWidth: 1 },
  content: { paddingHorizontal: 20 },
  dayHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 12 },
  dayHeaderDot: { width: 6, height: 6, borderRadius: 3 },
  dayHeaderTitle: { fontFamily: 'Poppins_700Bold', letterSpacing: 1.2 },
  ticketWrapper: { marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  ticketTop: { padding: 20, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1 },
  badgeRow: { flexDirection: 'row', marginBottom: 10 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  typeText: { fontFamily: 'Poppins_700Bold', fontSize: 11, textTransform: 'uppercase' },
  subjectText: { fontFamily: 'Poppins_700Bold' },
  ticketDividerRow: { flexDirection: 'row', alignItems: 'center', height: 20, overflow: 'hidden', position: 'relative' },
  cutoutLeft: { position: 'absolute', left: -10, width: 20, height: 20, borderRadius: 10, zIndex: 2 },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderStyle: 'dashed', marginHorizontal: 15 },
  cutoutRight: { position: 'absolute', right: -10, width: 20, height: 20, borderRadius: 10, zIndex: 2 },
  ticketBottom: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1 },
  infoCol: { flex: 1 },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  infoLabel: { fontFamily: 'Poppins_600SemiBold', letterSpacing: 0.5 },
  infoValue: { fontFamily: 'Poppins_700Bold' }
});