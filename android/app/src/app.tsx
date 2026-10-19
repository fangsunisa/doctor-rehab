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
import RegisterDoctorScreen from './registerdoctor';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['http://localhost:3001', 'http://localhost:3000'],
  config: {
    screens: {
      Login: '', // 👈 ตั้งค่าเป็นค่าว่าง เพื่อให้ URL หลัก (เช่น http://localhost:3001/) เปิดหน้า Login ทันที
      Signup: 'signup',
      ProfileDoctor: 'profile-doctor',
      Patient: 'patient',
      Dashboard: 'dashboard',
      Exercise: 'exercise',
      RegisterDoctor: 'register-doctor',
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
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

        <Stack.Screen
          name="RegisterDoctor"
          component={RegisterDoctorScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}