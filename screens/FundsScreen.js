import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useCallback, useRef, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function FundsScreen() {
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

  // Cleared out pending spreadsheet sync
  const transactions = [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, '#0F4FC7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>
        <View style={styles.circleVault} />
        <View style={styles.ringVault} />
        <View style={styles.squareVault} />
      </LinearGradient>

      <Animated.ScrollView style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerArea}>
          <Text style={[styles.headerTitle, { color: '#FFF', fontSize: 26 * fontSize }]}>Class Vault</Text>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsSidebarOpen(true); }} style={styles.menuBtn}>
            <Ionicons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceContainer}>
          <View style={styles.balanceLabelRow}>
            <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.75)" />
            <Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.8)', fontSize: 13 * fontSize }]}>Total SBIT-2A Funds</Text>
          </View>
          <Text style={[styles.balanceAmount, { color: '#FFF', fontSize: 42 * fontSize }]}>₱0.00</Text>
        </View>

        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.actionRow}>
            <TouchableOpacity activeOpacity={0.85} style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(54, 224, 139, 0.12)' }]}>
                <Ionicons name="arrow-down" size={20} color="#36E08B" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Collect</Text>
            </TouchableOpacity>
            
            <TouchableOpacity activeOpacity={0.85} style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(255, 107, 107, 0.12)' }]}>
                <Ionicons name="arrow-up" size={20} color="#FF6B6B" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Expense</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: colors.text, fontSize: 18 * fontSize }]}>Recent Transactions</Text>
            <TouchableOpacity><Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text></TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="sync" size={30} color={colors.subtext} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text, fontSize: 15 * fontSize }]}>All caught up</Text>
              <Text style={[styles.emptySubtext, { color: colors.subtext, fontSize: 13 * fontSize }]}>Syncing with spreadsheet soon...</Text>
            </View>
          ) : (
            transactions.map((t) => (
              <View key={t.id} style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.txIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name={t.icon} size={20} color={colors.text} />
                </View>
                <View style={styles.txDetails}>
                  <Text style={[styles.txTitle, { color: colors.text, fontSize: 15 * fontSize }]}>{t.title}</Text>
                  <Text style={[styles.txDate, { color: colors.subtext, fontSize: 12 * fontSize }]}>{t.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: t.type === 'in' ? '#36E08B' : '#FF6B6B', fontSize: 15 * fontSize }]}>
                  {t.amount}
                </Text>
              </View>
            ))
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 320, overflow: 'hidden' },
  circleVault: { position: 'absolute', top: -100, right: -60, width: width * 1.2, height: width * 1.2, borderRadius: width, backgroundColor: 'rgba(255,255,255,0.06)' },
  ringVault: { position: 'absolute', bottom: -80, right: 30, width: 160, height: 160, borderRadius: 80, borderWidth: 18, borderColor: 'rgba(255,255,255,0.06)' },
  squareVault: { position: 'absolute', top: 60, left: -30, width: 90, height: 90, borderRadius: 20, transform: [{ rotate: '35deg' }], backgroundColor: 'rgba(255,255,255,0.08)' },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 65, paddingHorizontal: 25, paddingBottom: 15 },
  headerTitle: { fontFamily: 'Poppins_700Bold' },
  menuBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  balanceContainer: { paddingHorizontal: 30, paddingTop: 5, paddingBottom: 45 },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  balanceLabel: { fontFamily: 'Poppins_600SemiBold' },
  balanceAmount: { fontFamily: 'Poppins_700Bold' },
  sheet: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 30, paddingHorizontal: 25, minHeight: 500, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: -8 } },
  actionRow: { flexDirection: 'row', gap: 15, marginBottom: 35 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  actionIconBg: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontFamily: 'Poppins_700Bold', fontSize: 15 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  historyTitle: { fontFamily: 'Poppins_700Bold' },
  seeAll: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 30, paddingVertical: 20 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 14 },
  emptyText: { fontFamily: 'Poppins_700Bold', marginBottom: 4 },
  emptySubtext: { fontFamily: 'Poppins_400Regular' },
  transactionCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  txIconContainer: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txDetails: { flex: 1 },
  txTitle: { fontFamily: 'Poppins_600SemiBold', marginBottom: 2 },
  txDate: { fontFamily: 'Poppins_400Regular' },
  txAmount: { fontFamily: 'Poppins_700Bold' }
});