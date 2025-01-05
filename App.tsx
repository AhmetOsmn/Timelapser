import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import VideoCreationScreen from './src/screens/VideoCreationScreen';
import VideoListScreen from './src/screens/VideoListScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  VideoCreation: undefined;
  VideoList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#f4511e',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ title: 'Giriş' }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Ana Sayfa' }}
          />
          <Stack.Screen 
            name="VideoCreation" 
            component={VideoCreationScreen}
            options={{ title: 'Video Oluştur' }}
          />
          <Stack.Screen 
            name="VideoList" 
            component={VideoListScreen}
            options={{ title: 'Videolarım' }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
