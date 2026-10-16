import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function PatientDashboard({ navigation, route }: { navigation: any, route: any }) {
  // ฟังก์ชันคำนวณอายุจากวันเกิด (dob)
  const calculateAge = (dobString: string) => {
    if (!dobString) return '-';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '-';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ปี`;
  };

  // ดึงข้อมูล patient ที่ส่งผ่านมา (รองรับอายุและผู้ดูแล)
  const patientData = route?.params?.patient || {
    name: 'กำลังรอข้อมูลผู้ป่วย...',
    id: '-',
    symptom: '-',
    age: '-',
    caregiver: '-',
  };

  const displayAge = patientData.age && patientData.age !== '-' 
    ? patientData.age 
    : calculateAge(patientData.dob || patientData.DOB);

  const displayCaregiver = patientData.caregiver || patientData.caregiverName || patientData.Caregiver_Name || '-';

  const [selectedTab, setSelectedTab] = useState<'day' | 'week' | 'month'>('day');
  const [dashboardData, setDashboardData] = useState<any[]>([]);

  // ฟังก์ชันแปลงเลข ID เช่น 1 หรือ 15 ให้เป็นรูปแบบ HN00001 หรือ HN00015
  const formatHN = (id: any) => {
    if (!id || id === '-') return '-';
    if (String(id).startsWith('HN')) return id;
    const paddedId = String(id).padStart(5, '0');
    return `HN${paddedId}`;
  };

  // ดึงข้อมูลผลการฝึกและสถิติจาก Backend ตามรหัสคนไข้
  useEffect(() => {
    if (patientData && patientData.id && patientData.id !== '-') {
      fetch(`http://localhost:3000/api/doctor/patient/${patientData.id}/dashboard`)
        .then((res) => res.json())
        .then((data) => {
          setDashboardData(data);
          console.log('ข้อมูลแดชบอร์ดคนไข้:', data);
        })
        .catch((err) => console.error('Error fetching dashboard data:', err));
    }
  }, [patientData.id]);

  const [searchText, setSearchText] = useState('');

  const yAxisLabels = selectedTab === 'day' 
    ? ['12', '9', '6', '3', '0'] 
    : ['100%', '75%', '50%', '25%', '0%'];

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
          <Pressable style={[styles.menuItem, styles.menuItemActive]}>
            <Text style={styles.menuItemTextActive}>📊 แดชบอร์ด</Text>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => navigation.navigate('Exercise', {
              patientName: patientData.name,
              hn: formatHN(patientData.id),
              patientId: patientData.id,
            })}
          >
            <Text style={styles.menuItemText}>
              📁 คลังท่ากายภาพ
            </Text>
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

      {/* MAIN CONTENT WRAPPER */}
      <View style={styles.mainContent}>
        
        {/* TOP NAVIGATION BAR */}
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
          <Pressable 
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
          </Pressable>
        </View>

        {/* SCROLLABLE DASHBOARD BODY */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* HEADER ACTION BAR */}
          <View style={styles.topBar}>
            <Pressable 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>&lt; กลับไปหน้ารายชื่อทั้งหมด</Text>
            </Pressable>

            <View style={styles.actionButtonGroup}>
              <Pressable
                style={styles.btnPrimary}
                onPress={() => navigation.navigate('Exercise', {
                  patientName: patientData.name,
                  hn: formatHN(patientData.id),
                  patientId: patientData.id,
                })}
              >
                <Text style={styles.btnPrimaryText}>
                  จัดโปรแกรมท่าทางกายภาพ
                </Text>
              </Pressable>

              <Pressable 
                style={styles.btnSecondary}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.btnSecondaryText}>
                  ✏️ แก้ไขข้อมูล
                </Text>
              </Pressable>
            </View>
          </View>

          {/* CARD 1: ข้อมูลส่วนตัว */}
          <View style={styles.card}>
            <View style={styles.patientInfoWrapper}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarIcon}>👩‍🦰</Text>
              </View>
              <View style={styles.patientDetails}>
                <Text style={styles.patientNameTitle}>
                  ข้อมูลส่วนตัว: <Text style={styles.highlightText}>{patientData.name}</Text> (HN: {formatHN(patientData.id)})
                </Text>
                <Text style={styles.patientSubText}>
                  อายุ: {displayAge}  |  อาการหลัก: {patientData.symptom}  |  ผู้ดูแล: {displayCaregiver}
                </Text>
              </View>
            </View>
          </View>

          {/* CARD 2: สรุปผลประเมิน */}
          <View style={styles.summaryGrid}>
            <View style={[styles.card, styles.summaryCard, { backgroundColor: '#FFF9C4' }]}>
              <Text style={styles.summaryLabel}>😁 ประเมินอาการ</Text>
              <Text style={styles.summaryValue}>รอดำเนินการ</Text>
            </View>
            <View style={[styles.card, styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.summaryLabel}>📅 ความสำเร็จในการฝึก</Text>
              <Text style={styles.summaryValue}>-</Text>
            </View>
          </View>

          {/* TAB CONTROLLER */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tabButton, selectedTab === 'day' && styles.tabButtonActive]}
              onPress={() => setSelectedTab('day')}
            >
              <Text style={[styles.tabText, selectedTab === 'day' && styles.tabTextActive]}>วัน</Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, selectedTab === 'week' && styles.tabButtonActive]}
              onPress={() => setSelectedTab('week')}
            >
              <Text style={[styles.tabText, selectedTab === 'week' && styles.tabTextActive]}>สัปดาห์</Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, selectedTab === 'month' && styles.tabButtonActive]}
              onPress={() => setSelectedTab('month')}
            >
              <Text style={[styles.tabText, selectedTab === 'month' && styles.tabTextActive]}>เดือน</Text>
            </Pressable>
          </View>

          {/* CARD 3: ส่วนแสดงกราฟ */}
          <View style={styles.card}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>
                  ผลการทำกายภาพบำบัด: ภาพรวม ({selectedTab.toUpperCase()})
                </Text>
                <Text style={styles.chartSubTitle}>
                  {selectedTab === 'day' 
                    ? 'แสดงผลเป็นจำนวนครั้ง (Repetitions) ในแต่ละท่า' 
                    : 'แสดงผลเป็นเปอร์เซ็นต์ (%) ความสำเร็จเฉลี่ย'}
                </Text>
              </View>
              <View style={styles.dropdownPlaceholder}>
                <Text style={styles.dropdownText}>📊 ภาพรวม (รอข้อมูล)</Text>
              </View>
            </View>

            {/* คำอธิบายสัญลักษณ์สี */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>สีเขียว = ทำสำเร็จ</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>สีแดง = ทำไม่สำเร็จ</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>สีน้ำเงิน = เป้าหมายที่กำหนด</Text>
              </View>
            </View>

            {/* โครงสร้างเส้นประแกน Y แบบ Custom */}
            <View style={styles.customGridContainer}>
              {yAxisLabels.map((label, index) => (
                <View key={index} style={styles.gridRow}>
                  <Text style={styles.yAxisText}>{label}</Text>
                  <View style={styles.dashedLine} />
                </View>
              ))}
            </View>
          </View>

          {/* CARD 4: บันทึกอาการจากคนไข้ */}
          <View style={styles.card}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>🗓️ รายงานและบันทึกอาการ</Text>
              <View style={styles.badgePlaceholder}>
                <Text style={styles.badgeText}>สถานะ: รอดำเนินการ</Text>
              </View>
            </View>

            <View style={styles.noteContentBox}>
              <Text style={styles.noteSubject}>
                💭 บันทึกอาการจากคนไข้ (หลังฝึก) <Text style={styles.tagPending}>รอข้อมูล</Text>
              </Text>
              <Text style={styles.noteDetail}>"ยังไม่มีบันทึกข้อมูลจากผู้ป่วยในระบบ"</Text>
            </View>

            <View style={styles.emptyHistoryBox}>
              <Text style={styles.emptyHistoryText}>
                ยังไม่มีประวัติการฝึกกายภาพในระบบสำหรับช่วงเวลานี้
              </Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#37474F',
    fontWeight: '600',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: '#0288D1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnSecondaryText: {
    color: '#37474F',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      } as any,
      default: {
        elevation: 3,
      },
    }),
  },
  patientInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarIcon: {
    fontSize: 32,
  },
  patientDetails: {
    flex: 1,
  },
  patientNameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
  },
  highlightText: {
    color: '#00838F',
  },
  patientSubText: {
    fontSize: 14,
    color: '#78909C',
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#546E7A',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
    marginTop: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECEFF1',
    borderRadius: 10,
    padding: 4,
    width: 240,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#0288D1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#546E7A',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  chartSubTitle: {
    fontSize: 12,
    color: '#90A4AE',
    marginTop: 2,
  },
  dropdownPlaceholder: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dropdownText: {
    fontSize: 13,
    color: '#37474F',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  customGridContainer: {
    height: 220,
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingRight: 10,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yAxisText: {
    width: 40,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#263238',
  },
  badgePlaceholder: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#607D8B',
  },
  noteContentBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginBottom: 12,
  },
  noteSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 4,
  },
  tagPending: {
    backgroundColor: '#FFF9C4',
    color: '#F57F17',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  noteDetail: {
    fontSize: 13,
    color: '#546E7A',
    fontStyle: 'italic',
  },
  emptyHistoryBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#9E9E9E',
  },
});