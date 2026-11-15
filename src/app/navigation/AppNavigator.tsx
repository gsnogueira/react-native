import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFinance } from '../FinanceContext';

const AuthScreen = lazy(() => import('../screens/AuthScreen'));
const DashboardScreen = lazy(() => import('../screens/DashboardScreen'));
const TransactionsScreen = lazy(() => import('../screens/TransactionsScreen'));
const TransactionFormScreen = lazy(() => import('../screens/TransactionFormScreen'));
const ProfileScreen = lazy(() => import('../screens/ProfileScreen'));

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useFinance();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#e36b3d" />
        <Text style={styles.loadingText}>Preparando seu espaço...</Text>
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

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f0e8' }, loadingText: { color: '#18352f', marginTop: 12, fontWeight: '700' } });

export default AppNavigator;