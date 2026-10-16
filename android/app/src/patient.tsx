import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Patient {
  id: string;
  time: string;
  name: string;
  progress: number;
  progressColor: string;
  symptom: string;
}

export default function PatientDashboardScreen({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/doctor/patients');
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        const formattedData: Patient[] = data.map((item: any) => ({
          id: item.PatientID ? item.PatientID.toString() : '',
          time: '10:00 น.',
          name: `${item.First_Name || ''} ${item.Last_Name || ''}`.trim() || 'ไม่ระบุชื่อ',
          progress: 0,
          progressColor: '#0288D1',
          symptom: item.Medical_Condition || item.Baseline_Assessment || 'ไม่ระบุอาการ',
          dob: item.DOB || '',
          caregiver: item.Caregiver_Name || '',
        }));
        setPatientList(formattedData);
      } else {
        console.error('Failed to fetch patients:', data);
      }
    } catch (error) {
      console.error('Error fetching patient list:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patientList.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.includes(searchQuery)
  );

  const goToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.appContainer}>
      {/* 1. SIDEBAR MENU */}
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

          <Pressable
            style={[styles.menuItem, styles.menuItemActive]}
            onPress={goToDashboard}
          >
            <Text style={[styles.menuItemText, styles.menuItemTextActive]}>
              📊 แดชบอร์ด
            </Text>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => navigation.navigate('Exercise')}
          >
            <Text style={styles.menuItemText}>📁 คลังท่ากายภาพ</Text>
          </Pressable>
        </View>

        <View style={styles.sidebarFooter}>
          <Pressable
            style={styles.logoutButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. MAIN CONTENT WRAPPER */}
      <View style={styles.mainContent}>
        {/* TOP NAVIGATION BAR */}
        <View style={styles.topNavbar}>
          <View style={styles.searchBoxContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหาชื่อ หรือ รหัสผู้ป่วย..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.doctorProfile}
            onPress={() => navigation.navigate('ProfileDoctor')}
          >
            <View style={styles.doctorAvatar}>
              <Image
                source={require('./img/jenohighschool.jpg')}
                style={styles.doctorAvatarImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.doctorName}>หมอดิน</Text>
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE BODY CONTENT */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.pageHeaderRow}>
              <View>
                <Text style={styles.greetingTitle}>
                  👋 สวัสดีตอนเช้าครับ
                </Text>
                <Text style={styles.greetingSub}>
                  สรุปภาพรวมประจำวัน
                </Text>
              </View>

              <TouchableOpacity
                style={styles.btnAddPatient}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.btnAddPatientText}>+ เพิ่มผู้ป่วยใหม่</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tableContainer}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableHeaderCell, { width: 130 }]}>
                    เวลาที่ออกกำลังกาย
                  </Text>
                  <Text style={[styles.tableHeaderCell, { width: 200 }]}>
                    ชื่อ-นามสกุล
                  </Text>
                  <Text style={[styles.tableHeaderCell, { width: 200 }]}>
                    ความก้าวหน้า
                  </Text>
                  <Text style={[styles.tableHeaderCell, { width: 140 }]}>
                    อาการ
                  </Text>
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      { width: 100, textAlign: 'center' },
                    ]}
                  >
                    จัดการ
                  </Text>
                </View>

                {loading ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>กำลังโหลดข้อมูลผู้ป่วย...</Text>
                  </View>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((item, index) => (
                    <View
                      key={item.id || index.toString()}
                      style={[
                        styles.tableRow,
                        styles.tableBodyRow,
                        index === filteredPatients.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <Text style={[styles.tableCellText, { width: 130 }]}>
                        {item.time}
                      </Text>

                      <Text
                        style={[
                          styles.tableCellText,
                          { width: 200, fontWeight: '600', color: '#1E293B' },
                        ]}
                      >
                        {item.name}
                      </Text>

                      <View
                        style={[
                          styles.tableCellContainer,
                          {
                            width: 200,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                          },
                        ]}
                      >
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${item.progress}%`,
                                backgroundColor: item.progressColor,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>{item.progress}%</Text>
                      </View>

                      <Text style={[styles.tableCellText, { width: 140 }]}>
                        {item.symptom}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.tableCellContainer,
                          { width: 100, alignItems: 'center' },
                        ]}
                        onPress={() => navigation.navigate('Dashboard', { patient: item })}
                      >
                        <Text style={styles.btnActionText}>ดูประวัติ</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>ยังไม่มีข้อมูลผู้ป่วยในระบบ</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.footerLinkWrapper}>
              <TouchableOpacity onPress={fetchPatients}>
                <Text style={styles.btnViewAllText}>
                  🔄 รีเฟรชข้อมูลรายชื่อผู้ป่วย
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#E0F2FE',
  },
  menuItemText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#0288D1',
    fontWeight: '700',
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
  },
  doctorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
  pageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  greetingSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  btnAddPatient: {
    backgroundColor: '#0288D1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnAddPatientText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tableContainer: {
    minWidth: 770,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  tableHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableHeaderCell: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  tableBodyRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tableCellText: {
    fontSize: 14,
    color: '#334155',
  },
  tableCellContainer: {
    justifyContent: 'center',
  },
  progressBarTrack: {
    width: 120,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  btnActionText: {
    color: '#0288D1',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  footerLinkWrapper: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnViewAllText: {
    color: '#0288D1',
    fontSize: 13,
    fontWeight: '600',
  },
});