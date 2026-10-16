import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// นำเข้าไฟล์หน้าจอจากตำแหน่งจริงในโปรเจกต์
import LoginScreen from './login';
import SignupHnScreen from './signup';
import ProfileDoctorScreen from './profiledoctor';
import PatientDashboardScreen from './patient';
import PatientDashboard from './dashboard';
import ExerciseScreen from './exercise';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Signup"
          component={SignupHnScreen}
        />

        <Stack.Screen
          name="ProfileDoctor"
          component={ProfileDoctorScreen}
        />

        <Stack.Screen
          name="Patient"
          component={PatientDashboardScreen}
        />

        <Stack.Screen
          name="Dashboard"
          component={PatientDashboard}
        />

        <Stack.Screen
          name="Exercise"
          component={ExerciseScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
