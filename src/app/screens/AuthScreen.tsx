import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFinance } from '../FinanceContext';

const getAuthErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: string }).code)
    : '';
  const messages: Record<string, string> = {
    'auth/operation-not-allowed': 'Ative o provedor E-mail/senha em Firebase Console > Authentication > Método de login.',
    'auth/email-already-in-use': 'Este e-mail já possui uma conta. Entre ou use outro e-mail.',
    'auth/invalid-email': 'O e-mail informado é inválido.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'Não existe uma conta com este e-mail.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/network-request-failed': 'Não foi possível conectar ao Firebase. Verifique a internet.',
  };
  return messages[code] || (error instanceof Error ? error.message : 'Tente novamente.');
};

const AuthScreen = () => {
  const { signIn, signUp, isFirebaseEnabled } = useFinance();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.includes('@') || password.length < 6 || (mode === 'signup' && name.trim().length < 2)) {
      Alert.alert('Revise seus dados', mode === 'signup' ? 'Informe nome, e-mail válido e senha com 6 caracteres.' : 'Informe e-mail válido e senha com 6 caracteres.');
      return;
    }
    try {
      setBusy(true);
      if (mode === 'signup') await signUp(name, email, password);
      else await signIn(email, password);
    } catch (error) {
      Alert.alert(mode === 'signup' ? 'Não foi possível criar a conta' : 'Não foi possível entrar', getAuthErrorMessage(error));
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.brand}><Text style={styles.kicker}>FINANCEIRO</Text><Text style={styles.title}>Clareza para cada escolha.</Text><Text style={styles.subtitle}>Organize seu dinheiro com calma, contexto e controle.</Text></View>
        <View style={styles.form}>
          {mode === 'signup' && <TextInput style={styles.input} placeholder="Seu nome" placeholderTextColor="#87918d" value={name} onChangeText={setName} />}
          <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#87918d" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#87918d" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity style={styles.primary} onPress={submit} disabled={busy}><Text style={styles.primaryText}>{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}><Text style={styles.switch}>{mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}</Text></TouchableOpacity>
          {!isFirebaseEnabled && <Text style={styles.localNote}></Text>}
        </View>
        {busy && <ActivityIndicator color="#e36b3d" />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#f4f0e8' }, container: { flex: 1, padding: 28, justifyContent: 'space-between' }, brand: { marginTop: 72 }, kicker: { color: '#e36b3d', fontSize: 12, letterSpacing: 2, fontWeight: '700' }, title: { color: '#18352f', fontSize: 38, lineHeight: 42, fontWeight: '800', marginTop: 14 }, subtitle: { color: '#60716b', fontSize: 16, lineHeight: 23, marginTop: 14, maxWidth: 300 }, form: { gap: 14, marginBottom: 20 }, input: { backgroundColor: '#fffdf9', borderWidth: 1, borderColor: '#ded8cb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 15, color: '#18352f', fontSize: 16 }, primary: { backgroundColor: '#18352f', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4 }, primaryText: { color: '#fffdf9', fontSize: 16, fontWeight: '800' }, switch: { color: '#e36b3d', textAlign: 'center', fontWeight: '700', padding: 8 }, localNote: { color: '#8a7d68', textAlign: 'center', fontSize: 12, lineHeight: 17 }, });

export default AuthScreen;