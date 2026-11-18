import React, { Suspense, lazy, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, Alert, InteractionManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFinance } from '../FinanceContext';

const AuthScreen = lazy(() => import('../screens/AuthScreen'));
const loadDashboardScreen = () => import('../screens/DashboardScreen');
const DashboardScreen = lazy(loadDashboardScreen);
const TransactionsScreen = lazy(() => import('../screens/TransactionsScreen'));
const TransactionFormScreen = lazy(() => import('../screens/TransactionFormScreen'));
const ProfileScreen = lazy(() => import('../screens/ProfileScreen'));

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading, error, refreshTransactions } = useFinance();

  useEffect(() => {
    if (!user) {
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      void loadDashboardScreen().catch(preloadError => {
        console.error('Não foi possível pré-carregar o painel.', preloadError);
      });
    });

    return () => task.cancel();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#e36b3d" />
        <Text style={styles.loadingText}>Preparando seu espaço...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorTitle}>Não foi possível carregar seus dados.</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retry}
          onPress={() => {
            refreshTransactions().catch(retryError => {
              Alert.alert(
                'Falha ao atualizar',
                retryError instanceof Error ? retryError.message : 'Tente novamente.',
              );
            });
          }}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Suspense fallback={<View style={styles.loading}><ActivityIndicator color="#e36b3d" /><Text style={styles.loadingText}>Carregando tela...</Text></View>}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Transactions" component={TransactionsScreen} />
              <Stack.Screen name="TransactionForm" component={TransactionFormScreen} options={{ headerShown: true, title: 'Transação', headerTintColor: '#18352f', headerStyle: { backgroundColor: '#f4f0e8' } }} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          )}
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f0e8', padding: 28 }, loadingText: { color: '#18352f', marginTop: 12, fontWeight: '700' }, errorTitle: { color: '#18352f', fontSize: 18, fontWeight: '800', textAlign: 'center' }, errorMessage: { color: '#60716b', marginTop: 12, textAlign: 'center' }, retry: { backgroundColor: '#18352f', borderRadius: 12, marginTop: 22, paddingHorizontal: 20, paddingVertical: 13 }, retryText: { color: '#fffdf9', fontWeight: '800' } });

export default AppNavigator;