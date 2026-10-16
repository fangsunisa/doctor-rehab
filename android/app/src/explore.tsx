import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

export default function ExploreScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>หน้าจัดการข้อมูลเพิ่มเติม (Explore)</Text>
      
      {/* ตัวอย่างปุ่มย้อนกลับ */}
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.btnText}>ย้อนกลับ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bde0fe',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#0077b6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});