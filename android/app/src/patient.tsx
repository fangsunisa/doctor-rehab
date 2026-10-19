import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type Patient = {
  id: string;
  name: string;
  hn: string;
  symptom: string;
  workoutTime: string;
  progress: number;
};

export default function PatientDashboardScreen({ navigation, route }: { navigation?: any; route?: any }) {
  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // 🟢 เพิ่ม State สำหรับดึงข้อมูลหมอจาก Database
  const [doctorName, setDoctorName] = useState('กำลังโหลด...');
  const [doctorAvatar, setDoctorAvatar] = useState<string | null>(null);

  // 🟢 ใช้ useFocusEffect เพื่อให้โหลดข้อมูลใหม่ทุกครั้งที่กลับมาหน้านี้
  useFocusEffect(
    useCallback(() => {
      fetchPatients();
      fetchDoctorProfile();
    }, [])
  );

  // 🟢 ดึงข้อมูลโปรไฟล์หมอจาก Backend (StaffID = 1 หรือตามที่ล็อกอิน)
  const fetchDoctorProfile = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/doctor/profile/1');
      const data = await response.json();
      if (response.ok && data.First_Name) {
        setDoctorName(`${data.First_Name} ${data.Last_Name || ''}`.trim());
        if (data.Profile_Image) {
          setDoctorAvatar(data.Profile_Image);
        }
      } else {
        setDoctorName('หมอดิน');
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      setDoctorName('หมอดิน');
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/doctor/patients');
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        const formattedData: Patient[] = data.map((item: any) => ({
          id: item.PatientID ? item.PatientID.toString() : '',
          name: `${item.First_Name || ''} ${item.Last_Name || ''}`.trim() || 'ไม่ระบุชื่อ',
          hn: item.PatientID ? `HN${String(item.PatientID).padStart(5, '0')}` : 'HN-----',
          symptom: item.Medical_Condition || 'ไม่ระบุอาการ',
          workoutTime: '10:00 น.',
          progress: 0,
        }));
        setPatients(formattedData);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const term = searchText.toLowerCase().trim();
    return (
      patient.name.toLowerCase().includes(term) ||
      patient.hn.toLowerCase().includes(term) ||
      patient.symptom.toLowerCase().includes(term)
    );
  });

  const goToDashboardView = (patient: Patient) => {
    if (navigation?.navigate) {
      navigation.navigate('Dashboard', {
        patientId: patient.id,
        patientName: patient.name,
        hn: patient.hn,
      });
    }
  };

  const goToExerciseManage = (patient: Patient) => {
    if (navigation?.navigate) {
      navigation.navigate('Exercise', {
        patientId: patient.id,
        patientName: patient.name,
        hn: patient.hn,
      });
    }
  };

  const goToProfileDoctor = () => {
    if (navigation?.navigate) {
      navigation.navigate('ProfileDoctor');
    }
  };

  const goToSignup = () => {
    if (navigation?.navigate) {
      navigation.navigate('Signup');
    }
  };

  const goToLogin = () => {
    if (navigation?.navigate) {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        {/* SIDEBAR */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarBrand}>
            <Image
              source={require('./img/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>ReMotion Rehab</Text>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.menuHeader}>เมนูระบบ</Text>

            <Pressable style={[styles.menuItem, styles.menuItemActive]}>
              <Text style={styles.menuItemTextActive}>📊 แดชบอร์ด</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={() => navigation?.navigate('Exercise')}>
              <Text style={styles.menuItemText}>📁 คลังท่ากายภาพ</Text>
            </Pressable>
          </View>

          <View style={styles.sidebarFooter}>
            <Pressable style={styles.logoutButton} onPress={goToLogin}>
              <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </Pressable>
          </View>
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.mainContent}>
          {/* TOP NAVBAR */}
          <View style={styles.topNavbar}>
            <View style={styles.searchBoxContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="ค้นหาชื่อ หรือ รหัสผู้ป่วย (เช่น HN00145)..."
                placeholderTextColor="#94A3B8"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* 🟢 แสดงชื่อและรูปหมอที่ดึงมาจาก Database ล่าสุด */}
            <Pressable style={styles.doctorProfile} onPress={goToProfileDoctor}>
              <View style={styles.doctorAvatar}>
                <Image
                  source={
                    doctorAvatar
                      ? { uri: doctorAvatar }
                      : require('./img/jenohighschool.jpg')
                  }
                  style={styles.doctorAvatarImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.doctorName}>{doctorName}</Text>
            </Pressable>
          </View>

          {/* SCROLLABLE BODY */}
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.card}>
              <View style={styles.pageHeader}>
                <View>
                  <Text style={styles.pageTitle}>👋 สวัสดีตอนเช้าครับ</Text>
                  <Text style={styles.pageSubTitle}>สรุปภาพรวมประจำวัน</Text>
                </View>

                <Pressable style={styles.primaryButton} onPress={goToSignup}>
                  <Text style={styles.primaryButtonText}>+ เพิ่มผู้ป่วยใหม่</Text>
                </Pressable>
              </View>

              {/* TABLE LIST */}
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>เวลาที่ออกกำลังกาย ชื่อ-นามสกุล</Text>
                <Text style={[styles.th, { flex: 1.5, textAlign: 'center' }]}>ความก้าวหน้า</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>อาการ</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>จัดการ</Text>
              </View>

              {filteredPatients.map((patient) => (
                <View key={patient.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.timeText}>{patient.workoutTime}</Text>
                    <Pressable onPress={() => goToExerciseManage(patient)}>
                      <Text style={styles.patientNameClickable}>{patient.name}</Text>
                    </Pressable>
                  </View>

                  <View style={{ flex: 1.5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${patient.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{patient.progress}%</Text>
                  </View>

                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.symptomText}>{patient.symptom}</Text>
                  </View>

                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Pressable style={styles.actionLink} onPress={() => goToDashboardView(patient)}>
                      <Text style={styles.actionLinkText}>ดูประวัติ</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              {filteredPatients.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>ไม่พบรายชื่อผู้ป่วยที่ค้นหา</Text>
                </View>
              )}

              <Pressable style={styles.refreshButton} onPress={fetchPatients}>
                <Text style={styles.refreshButtonText}>🔄 รีเฟรชข้อมูลรายชื่อผู้ป่วย</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  appContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    ...Platform.select({
      web: { minHeight: '100vh' } as any,
    }),
  },
  sidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    padding: 20,
    justifyContent: 'space-between',
    ...Platform.select({
      web: { height: '100vh', position: 'sticky', top: 0 } as any,
    }),
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  brandLogo: {
    width: 100,
    height: 100,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0288D1',
  },
  menuSection: {
    flex: 1,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 10,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  menuItemActive: {
    backgroundColor: '#E3F2FD',
  },
  menuItemText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  menuItemTextActive: {
    fontSize: 14,
    color: '#0288D1',
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 15,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  topNavbar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    width: 350,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    padding: 0,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  doctorProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  doctorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  doctorAvatarImage: {
    width: '100%',
    height: '100%',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  scrollContainer: {
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      } as any,
      default: {
        elevation: 3,
      },
    }),
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  pageSubTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#0077B6',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  th: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  patientNameClickable: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  progressBarBg: {
    width: 100,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0288D1',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  symptomText: {
    fontSize: 14,
    color: '#334155',
  },
  actionLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0288D1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  refreshButton: {
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    fontSize: 13,
    color: '#0288D1',
    fontWeight: '600',
  },
});