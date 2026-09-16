import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFinance } from '../FinanceContext';

const ProfileScreen = () => {
  const { user, logout, isFirebaseEnabled } = useFinance();
  return <SafeAreaView style={styles.screen}><View style={styles.content}><View style={styles.avatar}><Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text></View><Text style={styles.name}>{user?.name}</Text><Text style={styles.email}>{user?.email}</Text><View style={styles.info}><Text style={styles.infoLabel}>CONTA</Text><Text style={styles.infoText}>{isFirebaseEnabled ? 'Firebase Authentication' : 'Modo demonstração local'}</Text></View><TouchableOpacity style={styles.logout} onPress={() => Alert.alert('Sair da conta?', undefined, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: logout }])}><Text style={styles.logoutText}>Sair da conta</Text></TouchableOpacity></View></SafeAreaView>;
};

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#f4f0e8' }, content: { padding: 26, alignItems: 'center' }, avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#d9e6d7', alignItems: 'center', justifyContent: 'center', marginTop: 28 }, avatarText: { color: '#18352f', fontSize: 36, fontWeight: '800' }, name: { color: '#18352f', fontSize: 25, fontWeight: '800', marginTop: 18 }, email: { color: '#89918a', marginTop: 5 }, info: { alignSelf: 'stretch', backgroundColor: '#fffdf9', borderRadius: 14, padding: 18, marginTop: 42, borderWidth: 1, borderColor: '#e4ddcf' }, infoLabel: { color: '#e36b3d', fontSize: 11, letterSpacing: 1, fontWeight: '800' }, infoText: { color: '#18352f', marginTop: 8, fontWeight: '700' }, logout: { alignSelf: 'stretch', borderRadius: 12, borderWidth: 1, borderColor: '#c95832', padding: 15, alignItems: 'center', marginTop: 24 }, logoutText: { color: '#c95832', fontWeight: '800' } });

export default ProfileScreen;
