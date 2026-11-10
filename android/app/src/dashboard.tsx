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

export default function PatientDashboard({ navigation, route }: { navigation: any, route: any }) {
  const paramPatientId = route?.params?.patientId || route?.params?.patient?.id;
  const initialPatient = route?.params?.patient;

  const getStaffId = () => {
    if (route?.params?.staffId) return route.params.staffId;
    if (Platform.OS === 'web' && typeof globalThis !== 'undefined') {
      const urlParams = new URLSearchParams((globalThis as any).location.search);
      const idFromUrl = urlParams.get('staffId');
      if (idFromUrl) return parseInt(idFromUrl, 10);
      const savedId = (globalThis as any).localStorage?.getItem('currentStaffId');
      if (savedId) return parseInt(savedId, 10);
    }
    return 1;
  };

  const staffId = getStaffId();

  const [doctorName, setDoctorName] = useState('กำลังโหลด...');
  const [doctorAvatar, setDoctorAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (staffId) {
      fetch(`http://localhost:3000/api/doctor/profile/${staffId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            const fullName = `${data.First_Name || ''} ${data.Last_Name || ''}`.trim();
            setDoctorName(fullName || 'แพทย์ผู้ใช้งาน');
            if (data.Profile_Image) {
              setDoctorAvatar(data.Profile_Image);
            }
          }
        })
        .catch(() => {
          setDoctorName('แพทย์ผู้ใช้งาน');
        });
    }
  }, [staffId]);

  const [patientData, setPatientData] = useState<any>({
    id: paramPatientId || '-',
    name: initialPatient?.name || route?.params?.patientName || 'วิมลรัตน์ ตันเติ้ง',
    hn: initialPatient?.hn || route?.params?.hn || '15',
    symptom: initialPatient?.symptom || 'ตึงข้อขา',
    age: '22 ปี',
    caregiver: 'ภิมกลอย',
    caregiverPhone: '0943333333',
    profileImage: null,
    startDate: '2026-10-27T17:00:00.000Z', 
    endDate: '2026-11-29T17:00:00.000Z',   
  });

  const [latestAssessment, setLatestAssessment] = useState({
    feeling: 'รอดำเนินการ',
    note: 'ยังไม่มีบันทึกอาการจากผู้ป่วยในระบบ...',
    timeSpent: '-',
    statusBadge: 'รอดำเนินการ',
  });
  
  const [weeklySummaryData, setWeeklySummaryData] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'day' | 'week' | 'month'>('day');
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [monthlyWeekData, setMonthlyWeekData] = useState<any[]>([]); 
  const [searchText, setSearchText] = useState('');
  
  const [selectedWeekView, setSelectedWeekView] = useState<'all' | string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [trainingSummary, setTrainingSummary] = useState({ completedCount: 0, totalCount: 0 });

  const calculateAge = (dobString: string) => {
    if (!dobString) return '22 ปี';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '22 ปี';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return `${age} ปี`;
  };

  const formatHN = (id: any, rawHn?: string) => {
    if (rawHn && rawHn !== '-') return rawHn;
    if (!id || id === '-') return '15';
    if (String(id).startsWith('HN')) return id;
    return `${String(id)}`;
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString.split('T')[0];
    
    const day = d.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    
    return `${day} ${month} ${year}`;
  };

  const parseExerciseItem = (item: any, index: number) => {
    return {
      id: String(item?.ProgramExerciseID || index + 1),
      name: item?.Exercise_Name || item?.name || `ท่ากายภาพที่ ${index + 1}`,
      code: item?.Category || item?.code || '',
      done: Number(item?.Completed_Reps || item?.done || 0),
      target: Number(item?.Target_Reps || item?.target || 10),
    };
  };

  const defaultExercises = [
    { id: '1', name: 'งอเข่าไปด้านหลัง', code: 'Standing Hamstring Curl', done: 0, target: 10 },
    { id: '2', name: 'ยืดขาออกไปด้านข้าง', code: 'Standing Side Leg Raise', done: 0, target: 10 },
  ];

  useEffect(() => {
    const targetId = paramPatientId;
    if (targetId && targetId !== '-') {
      fetch(`http://localhost:3000/api/doctor/patient/${targetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            const fullName = `${data.First_Name || ''} ${data.Last_Name || ''}`.trim();
            setPatientData({
              id: data.PatientID || targetId,
              name: fullName || 'วิมลรัตน์ ตันเติ้ง',
              hn: data.HN || formatHN(data.PatientID || targetId),
              symptom: data.Medical_Condition || 'ตึงข้อขา',
              age: calculateAge(data.DOB),
              caregiver: data.Caregiver_Name || 'ภิมกลอย',
              caregiverPhone: data.Caregiver_Phone || '0943333333',
              profileImage: data.Profile_Image || null,
              startDate: data.Start_Date || '2026-10-27T17:00:00.000Z',
              endDate: data.End_Date || '2026-11-29T17:00:00.000Z',
            });
          }
        })
        .catch((err) => console.error('Error fetching patient profile:', err));

      fetch(`http://localhost:3000/api/doctor/patient/${targetId}/weekly-summary`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.weeklyData) {
            setWeeklySummaryData(data.weeklyData);
          }
        })
        .catch((err) => console.error('Error fetching weekly summary:', err));

      fetch(`http://localhost:3000/api/patient/progress/${targetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.weeklyChartData) {
            setMonthlyWeekData(data.weeklyChartData);
          }
        })
        .catch((err) => console.error('Error fetching progress weekly data:', err));

      const dateQuery = selectedDate ? `?date=${selectedDate}` : '';
      fetch(`http://localhost:3000/api/doctor/patient/${targetId}/dashboard${dateQuery}`)
        .then((res) => res.json())
        .then((data) => {
          const exercisesArray = Array.isArray(data) ? data : (data.exercises || []);
          const summaryObj = data.summary || { completedCount: 0, totalCount: exercisesArray.length };

          if (exercisesArray.length > 0) {
            const parsed = exercisesArray.map((item: any, idx: number) => parseExerciseItem(item, idx));
            setDashboardData(parsed);
          } else {
            setDashboardData([]);
          }
          setTrainingSummary(summaryObj);
        })
        .catch(() => setDashboardData([]));

      fetch(`http://localhost:3000/api/doctor/patient/${targetId}/history`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.history && data.history.length > 0) {
            const allLogs = data.history.flatMap((group: any) => group.logs || []);
            
            const enrichedLogs = allLogs.map((log: any) => ({
              ...log,
              percentage: log.percentage !== undefined ? log.percentage : 100,
              isSuccess: log.isSuccess !== undefined ? log.isSuccess : true
            }));

            setHistoryLogs(enrichedLogs);

            if (enrichedLogs.length > 0) {
              const log = enrichedLogs[0];
              setLatestAssessment({
                feeling: log.status || 'บันทึกแล้ว',
                note: log.detail || 'ไม่มีบันทึกเพิ่มเติม',
                timeSpent: log.date || '-',
                statusBadge: log.isSuccess ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์',
              });
            }
          }
        })
        .catch((err) => console.error('Error fetching history for dashboard:', err));
    } else {
      setDashboardData(defaultExercises);
    }
  }, [paramPatientId, trainingSummary.completedCount, trainingSummary.totalCount]);

  const chartMaxVal = 10;
  const yAxisDayLabels = ['10', '8', '6', '4', '2', '0'];
  const yAxisPercentLabels = ['100%', '80%', '60%', '40%', '20%', '0%'];

  return (
    <View style={styles.appContainer}>
      {/* 1. SIDEBAR MENU */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarBrand}>
          <Image source={require('./img/logo.png')} style={styles.brandLogo} resizeMode="contain" />
          <Text style={styles.brandTitle}>ReMotion Rehab</Text>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuHeader}>เมนูระบบ</Text>
          <Pressable style={[styles.menuItem, styles.menuItemActive]} onPress={() => navigation.navigate('Patient', { staffId: staffId })}>
            <Text style={styles.menuItemTextActive}>📊 แดชบอร์ด</Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => navigation.navigate('Exercise', {
              patientName: patientData.name,
              hn: formatHN(patientData.id, patientData.hn),
              patientId: patientData.id,
              staffId: staffId,
            })}
          >
            <Text style={styles.menuItemText}>📁 คลังท่ากายภาพ</Text>
          </Pressable>
        </View>

        <View style={styles.sidebarFooter}>
          <Pressable style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </Pressable>
        </View>
      </View>

      {/* MAIN CONTENT WRAPPER */}
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
          <Pressable style={styles.doctorProfile} onPress={() => navigation.navigate('ProfileDoctor', { staffId: staffId })}>
            <View style={styles.doctorAvatar}>
              <Image source={doctorAvatar ? { uri: doctorAvatar } : require('./img/jenohighschool.jpg')} style={styles.doctorAvatarImage} resizeMode="cover" />
            </View>
            <Text style={styles.doctorName}>{doctorName}</Text>
          </Pressable>
        </View>

        {/* SCROLLABLE BODY */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* TOP BAR */}
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={() => navigation.navigate('Patient', { staffId: staffId })}>
              <Text style={styles.backButtonText}>&lt; กลับไปหน้ารายชื่อทั้งหมด</Text>
            </Pressable>

            <View style={styles.actionButtonGroup}>
              <Pressable
                style={styles.btnPrimary}
                onPress={() => navigation.navigate('Exercise', {
                  patientName: patientData.name,
                  hn: formatHN(patientData.id, patientData.hn),
                  patientId: patientData.id,
                  staffId: staffId,
                })}
              >
                <Text style={styles.btnPrimaryText}>จัดโปรแกรมท่าทางกายภาพ</Text>
              </Pressable>

              <Pressable 
                style={styles.btnSecondary}
                onPress={() => {
                  const targetPatientId = patientData.id;
                  if (!targetPatientId || targetPatientId === '-') {
                    (globalThis as any).alert('ไม่พบรหัสผู้ป่วยสำหรับแก้ไขข้อมูล');
                    return;
                  }
                  navigation.navigate('Signup', { patientId: targetPatientId, staffId: staffId });
                }}
              >
                <Text style={styles.btnSecondaryText}>✏️ แก้ไขข้อมูล</Text>
              </Pressable>
            </View>
          </View>

          {/* CARD 1: ข้อมูลส่วนตัว (แสดงรูปโปรไฟล์จากฐานข้อมูล หรือไอคอนรูปคนแบบโมเดิร์นโปร่งใสเมื่อไม่มีรูป) */}
          <View style={styles.card}>
            <View style={styles.patientInfoWrapper}>
              {patientData.profileImage ? (
                <Image 
                  source={{ 
                    uri: patientData.profileImage.startsWith('data:image') 
                      ? patientData.profileImage 
                      : `data:image/jpeg;base64,${patientData.profileImage}` 
                  }} 
                  style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16, borderWidth: 2, borderColor: '#0288D1' }} 
                  resizeMode="cover" 
                />
              ) : (
                <View style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: 30, 
                  backgroundColor: '#E2E8F0', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  marginRight: 16,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: '#CBD5E1'
                }}>
                  {/* หัวคน (วงกลมด้านบน) */}
                  <View style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: '#94A3B8',
                    position: 'absolute',
                    top: 12
                  }} />
                  {/* ลำตัว (ทรงโค้งมนด้านล่าง) */}
                  <View style={{
                    width: 44,
                    height: 22,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22,
                    backgroundColor: '#94A3B8',
                    position: 'absolute',
                    bottom: -2
                  }} />
                </View>
              )}

              <View style={styles.patientDetails}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <Text style={styles.patientNameTitle}>
                    ข้อมูลส่วนตัว: <Text style={styles.highlightText}>{patientData.name}</Text> (HN: {formatHN(patientData.id, patientData.hn)})
                  </Text>
                  
                  <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#BAE6FD' }}>
                    <Text style={{ fontSize: 13, color: '#0369A1', fontWeight: '700' }}>
                      📅 รอบโปรแกรม: {formatDateOnly(patientData.startDate)} ถึง {formatDateOnly(patientData.endDate)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.patientSubText}>
                  อาการหลัก: {patientData.symptom}
                </Text>

                <Text style={[styles.patientSubText, { marginTop: 4 }]}>
                  อายุ: {patientData.age} &nbsp;&nbsp; ผู้ดูแล: {patientData.caregiver} &nbsp;&nbsp; เบอร์ผู้ดูแล: <Text style={{ color: '#0288D1', fontWeight: '600' }}>{patientData.caregiverPhone}</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* CARD 2: สรุปผลการประเมินความสำเร็จ */}
          <View style={styles.summaryGrid}>
            <View style={[styles.card, styles.summaryCard, { backgroundColor: '#FEF9C3', borderColor: '#FEF08A', borderWidth: 1 }]}>
              <Text style={styles.summaryLabel}>🤗 ประเมินอาการ</Text>
              <Text style={[styles.summaryValue, { color: '#0F172A' }]}>{latestAssessment.feeling}</Text>
            </View>
            <View style={[styles.card, styles.summaryCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 }]}>
              <Text style={styles.summaryLabel}>📅 ความสำเร็จในการฝึก</Text>
              <Text style={[styles.summaryValue, { color: '#0F172A' }]}>
                {trainingSummary.completedCount} / {trainingSummary.totalCount} ท่า
              </Text>
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

          {/* 1. มุมมองรายวัน (DAY) */}
          {selectedTab === 'day' && (
            <>
              <View style={styles.card}>
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={styles.chartTitle}>ผลการทำกายภาพบำบัด: ภาพรวม (DAY)</Text>
                    <Text style={styles.chartSubTitle}>แสดงผลเป็นจำนวนครั้ง (Repetitions) ในแต่ละท่า</Text>
                  </View>
                  <View style={styles.chartBadgeRight}>
                    <Text style={styles.chartBadgeRightText}>📊 วัน</Text>
                  </View>
                </View>

                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>สีเขียว = ทำสำเร็จ</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.legendText}>สีน้ำเงิน = เป้าหมายที่กำหนด</Text>
                  </View>
                </View>

                <View style={styles.chartWrapper}>
                  <View style={styles.yAxisOverlay}>
                    {yAxisDayLabels.map((label, index) => (
                      <View key={index} style={styles.gridRow}>
                        <Text style={styles.yAxisText}>{label}</Text>
                        <View style={styles.dashedLine} />
                      </View>
                    ))}
                  </View>

                  <View style={{ position: 'absolute', bottom: 0, left: 35, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 5 }}>
                    {dashboardData.map((item, index) => {
                      const maxHeight = 167;
                      const targetHeight = Math.min((item.target / chartMaxVal) * maxHeight, maxHeight);
                      const doneHeight = Math.min((item.done / chartMaxVal) * maxHeight, maxHeight);

                      return (
                        <View key={index} style={{ alignItems: 'center', flex: 1, marginHorizontal: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: maxHeight, gap: 8 }}>
                            <View style={{ width: 50, height: targetHeight, backgroundColor: '#3B82F6', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                            <View style={{ width: 50, height: doneHeight, backgroundColor: '#10B981', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                          </View>
                          <Text numberOfLines={1} style={{ fontSize: 11, color: '#64748B', marginTop: 6, textAlign: 'center' }}>
                            {item.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle}>🗓️ บันทึกการฝึกประจำวัน</Text>
                  <Text style={styles.badgeText}>เวลาฝึกล่าสุด: {latestAssessment.timeSpent}</Text>
                </View>

                <View style={styles.noteContentBox}>
                  <Text style={styles.noteSubject}>
                    💭 บันทึกอาการจากคนไข้ (หลังฝึก) <Text style={styles.tagPending}>{latestAssessment.statusBadge}</Text>
                  </Text>
                  <Text style={styles.noteDetail}>"{latestAssessment.note}"</Text>
                </View>

                <View style={{ marginTop: 16, gap: 12 }}>
                  {dashboardData.map((item, index) => {
                    const isPassed = item.done >= item.target;
                    const percentage = Math.round((item.done / (item.target || 1)) * 100);

                    return (
                      <View 
                        key={index} 
                        style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: 14, 
                          borderRadius: 12, 
                          backgroundColor: isPassed ? '#F0FDF4' : '#FEF2F2',
                          borderWidth: 1,
                          borderColor: isPassed ? '#BBF7D0' : '#FCA5A5' 
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: isPassed ? '#DCFCE7' : '#FEE2E2', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16 }}>{isPassed ? '🟩' : '🟥'}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>
                              {index + 1}. {item.name} {item.code ? `(${item.code})` : ''}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                              ⏱️ เป้าหมาย: {item.target} ครั้ง
                            </Text>
                          </View>
                        </View>

                        <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: isPassed ? '#DCFCE7' : '#FEE2E2' }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: isPassed ? '#166534' : '#991B1B' }}>
                            {isPassed ? `✅ ${item.done} / ${item.target} ครั้ง (${percentage}%)` : `❌ ${item.done} / ${item.target} ครั้ง (${percentage}%)`}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* 2. มุมมองรายสัปดาห์ (WEEK) */}
          {selectedTab === 'week' && (
            <>
              <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#166534' }}>📊 สรุปผลการทำกายภาพบำบัดประจำสัปดาห์ </Text>
                  <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ fontSize: 12, color: '#166534', fontWeight: '700' }}>
                      จำนวนวันที่ทำจริง: {Array.from(new Set(historyLogs.map(l => l.date))).length} วัน
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, { zIndex: 9999, elevation: 10, overflow: 'visible' }]}>
                <View style={[styles.chartHeader, { zIndex: 9999, overflow: 'visible' }]}>
                  <View style={{ flex: 1, minWidth: 200 }}>
                    <Text style={styles.chartTitle}>
                      {selectedWeekView === 'all' ? `สถิติการฝึกรายสัปดาห์ (${formatDateOnly(patientData.startDate)} - ${formatDateOnly(patientData.endDate)})` : `สถิติการฝึกวัน ${selectedWeekView}`}
                    </Text>
                    <Text style={styles.chartSubTitle}>
                      {selectedWeekView === 'all' ? 'แสดงภาพรวมเปอร์เซ็นต์ความสำเร็จในแต่ละวัน' : 'แสดงผลเป็นจำนวนครั้ง (Repetitions) ในแต่ละท่า'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 9999, position: 'relative' }}>
                    <Text style={{ fontSize: 13, color: '#475569', fontWeight: '600' }}>เลือกมุมมอง:</Text>
                    <Pressable
                      onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#CBD5E1',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        width: 190,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#1E293B', fontWeight: '600' }}>
                        {selectedWeekView === 'all' ? '📊 ภาพรวมทั้งสัปดาห์ (All Days)' : selectedWeekView}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#64748B' }}>▼</Text>
                    </Pressable>

                    {isDropdownOpen && (
                      <View style={{
                        position: 'absolute',
                        right: 0,
                        top: 38,
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#CBD5E1',
                        borderRadius: 8,
                        width: 190,
                        zIndex: 99999,
                        elevation: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                      }}>
                        <Pressable
                          onPress={() => { setSelectedWeekView('all'); setIsDropdownOpen(false); }}
                          style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#F8FAFC' }}
                        >
                          <Text style={{ fontSize: 12, color: '#1E293B', fontWeight: '600' }}>📊 ภาพรวมทั้งสัปดาห์ (All Days)</Text>
                        </Pressable>
                        {Array.from(new Set(historyLogs.map(log => log.date))).map((uniqueDate, i) => (
                          <Pressable
                            key={i}
                            onPress={() => { setSelectedWeekView(uniqueDate); setIsDropdownOpen(false); }}
                            style={{ padding: 10, borderBottomWidth: i < historyLogs.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}
                          >
                            <Text style={{ fontSize: 12, color: '#1E293B' }}>{uniqueDate}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.legendContainer}>
                  {selectedWeekView === 'all' ? (
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.legendText}>สีเขียว = ผ่านเกณฑ์ (100%)</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColorBox, { backgroundColor: '#3B82F6' }]} />
                        <Text style={styles.legendText}>เป้าหมาย</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.legendText}>ทำสำเร็จ</Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.chartWrapper}>
                  <View style={styles.yAxisOverlay}>
                    {(selectedWeekView === 'all' ? yAxisPercentLabels : yAxisDayLabels).map((label, index) => (
                      <View key={index} style={styles.gridRow}>
                        <Text style={styles.yAxisText}>{label}</Text>
                        <View style={styles.dashedLine} />
                      </View>
                    ))}
                  </View>
                  
                  <View style={{ position: 'absolute', bottom: 0, left: 35, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 5 }}>
                    {selectedWeekView === 'all' ? (
                      monthlyWeekData.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 13, color: '#94A3B8' }}>ยังไม่มีข้อมูลสรุปรายสัปดาห์</Text>
                        </View>
                      ) : (
                        monthlyWeekData.map((weekItem, index) => {
                          const maxHeight = 167;
                          const barHeight = Math.max((weekItem.percentage / 100) * maxHeight, 15);
                          const barColor = weekItem.percentage >= 80 ? '#10B981' : (weekItem.percentage > 0 ? '#3B82F6' : '#CBD5E1');

                          return (
                            <View key={index} style={{ alignItems: 'center', flex: 1, marginHorizontal: 10 }}>
                              <View style={{ width: 50, height: barHeight, backgroundColor: barColor, borderTopLeftRadius: 6, borderTopRightRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>{weekItem.percentage}%</Text>
                              </View>
                              <Text numberOfLines={1} style={{ fontSize: 11, color: '#64748B', marginTop: 6, textAlign: 'center' }}>
                                {weekItem.weekLabel}
                              </Text>
                            </View>
                          );
                        })
                      )
                    ) : (
                      (() => {
                        const selectedLog = historyLogs.find(l => l.date === selectedWeekView);

                        return dashboardData.map((item, index) => {
  const maxHeight = 167;
  // 🟢 แก้เป็นแบบนี้: เอาค่าที่ทำได้จริง (item.done) มาใช้เสมอ
  const doneVal = item.done !== undefined ? item.done : 0; 

  const targetHeight = Math.min((item.target / chartMaxVal) * maxHeight, maxHeight);
  const doneHeight = Math.min((doneVal / chartMaxVal) * maxHeight, maxHeight);

  return (
    <View key={index} style={{ alignItems: 'center', flex: 1, marginHorizontal: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: maxHeight, gap: 8 }}>
        {/* แท่งเป้าหมาย (สีน้ำเงิน) */}
        <View style={{ width: 50, height: targetHeight, backgroundColor: '#3B82F6', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
        {/* แท่งทำจริง (สีเขียว) - จะสูงตามจำนวนครั้งจริงที่ทำได้ เช่น 4 ครั้ง */}
        <View style={{ width: 50, height: doneHeight, backgroundColor: '#10B981', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
      </View>
      <Text numberOfLines={1} style={{ fontSize: 11, color: '#64748B', marginTop: 6, textAlign: 'center' }}>
        {item.name}
      </Text>
    </View>
  );
});
                      })()
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 14 }}>🗓️ ประวัติการฝึกจริงในสัปดาห์นี้ (Weekly Log)</Text>
                {historyLogs.length === 0 ? (
                  <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: 20 }}>ยังไม่มีประวัติการฝึก</Text>
                ) : (
                  <View style={{ gap: 12 }}>
                    {historyLogs
                      .filter(log => selectedWeekView === 'all' || log.date === selectedWeekView)
                      .map((log, index) => (
                        <View 
                          key={index} 
                          style={{ 
                            padding: 14, 
                            backgroundColor: log.isSuccess ? '#F0FDF4' : '#FEF2F2', 
                            borderRadius: 10, 
                            borderWidth: 1, 
                            borderColor: log.isSuccess ? '#BBF7D0' : '#FCA5A5', 
                            flexDirection: 'row', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>{log.date}</Text>
                            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>💬 บันทึก: {log.detail}</Text>
                          </View>
                          <View style={{ backgroundColor: log.isSuccess ? '#DCFCE7' : '#FEE2E2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: log.isSuccess ? '#166534' : '#991B1B' }}>
                              {log.isSuccess ? `✅ ผ่านเกณฑ์ (${log.percentage}%)` : `❌ ต่ำกว่าเกณฑ์ (${log.percentage}%)`}
                            </Text>
                          </View>
                        </View>
                      ))
                    }
                  </View>
                )}
              </View>
            </>
          )}

          {/* 3. มุมมองรายเดือน (MONTH) */}
          {selectedTab === 'month' && (
            <>
              <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#166534' }}>📈 สรุปผลการทำกายภาพบำบัดประจำเดือน (แบ่งตามสัปดาห์)</Text>
                  <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ fontSize: 12, color: '#166534', fontWeight: '700' }}>
                      รวมวันที่ทำสำเร็จ: {monthlyWeekData.reduce((acc, cur) => acc + (cur.completedDays || 0), 0)} วัน
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={styles.chartTitle}>สถิติการฝึกรายเดือน (ภาพรวมแยกตามสัปดาห์)</Text>
                    <Text style={styles.chartSubTitle}>แสดงผลเปอร์เซ็นต์ความสำเร็จในแต่ละสัปดาห์ของเดือนนี้</Text>
                  </View>
                  <View style={styles.chartBadgeRight}>
                    <Text style={styles.chartBadgeRightText}>📊 เดือน</Text>
                  </View>
                </View>

                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>สีเขียว = ความสำเร็จรายสัปดาห์ (%)</Text>
                  </View>
                </View>

                <View style={styles.chartWrapper}>
                  <View style={styles.yAxisOverlay}>
                    {yAxisPercentLabels.map((label, index) => (
                      <View key={index} style={styles.gridRow}>
                        <Text style={styles.yAxisText}>{label}</Text>
                        <View style={styles.dashedLine} />
                      </View>
                    ))}
                  </View>

                  <View style={{ position: 'absolute', bottom: 0, left: 35, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 5 }}>
                    {monthlyWeekData.length === 0 ? (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: '#94A3B8' }}>ยังไม่มีข้อมูลกราฟรายสัปดาห์ในเดือนนี้</Text>
                      </View>
                    ) : (
                      monthlyWeekData.map((weekItem, index) => {
                        const maxHeight = 167;
                        const barHeight = Math.max((weekItem.percentage / 100) * maxHeight, 15);
                        const barColor = weekItem.percentage >= 80 ? '#10B981' : (weekItem.percentage > 0 ? '#3B82F6' : '#CBD5E1');

                        return (
                          <View key={index} style={{ alignItems: 'center', flex: 1, marginHorizontal: 10 }}>
                            <View style={{ width: 50, height: barHeight, backgroundColor: barColor, borderTopLeftRadius: 6, borderTopRightRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>{weekItem.percentage}%</Text>
                            </View>
                            <Text numberOfLines={1} style={{ fontSize: 11, color: '#64748B', marginTop: 6, textAlign: 'center' }}>
                              {weekItem.weekLabel}
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 14 }}>🗓️ ประวัติการฝึกทั้งหมดในระบบ (Monthly History Log)</Text>
                {historyLogs.length === 0 ? (
                  <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: 20 }}>ยังไม่มีประวัติการฝึกในระบบ</Text>
                ) : (
                  <View style={{ gap: 12 }}>
                    {Array.from(new Set(historyLogs.map(log => log.date))).map((uniqueDate, index) => {
                      const log = historyLogs.find(l => l.date === uniqueDate);
                      if (!log) return null;

                      return (
                        <View 
                          key={index} 
                          style={{ 
                            padding: 14, 
                            backgroundColor: log.isSuccess ? '#F0FDF4' : '#FEF2F2', 
                            borderRadius: 10, 
                            borderWidth: 1, 
                            borderColor: log.isSuccess ? '#BBF7D0' : '#FCA5A5', 
                            flexDirection: 'row', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>{log.date}</Text>
                            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>💬 บันทึก: {log.detail}</Text>
                          </View>
                          <View style={{ backgroundColor: log.isSuccess ? '#DCFCE7' : '#FEE2E2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: log.isSuccess ? '#166534' : '#991B1B' }}>
                              {log.isSuccess ? `✅ ผ่านเกณฑ์ (${log.percentage}%)` : `❌ ต่ำกว่าเกณฑ์ (${log.percentage}%)`}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </>
          )}

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
    width: 40,
    height: 40,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarIcon: {
    fontSize: 28,
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
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  chartSubTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  chartBadgeRight: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartBadgeRightText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  chartWrapper: {
    height: 200,
    position: 'relative',
    marginTop: 10,
  },
  yAxisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'space-between',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yAxisText: {
    width: 35,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  badgeText: {
    fontSize: 12,
    color: '#64748B',
  },
  noteContentBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 0,
  },
  noteSubject: {
    fontSize: 13,
    color: '#3B82F6',
    fontStyle: 'italic',
  },
  tagPending: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noteDetail: {
    fontSize: 13,
    color: '#3B82F6',
    fontStyle: 'italic',
  },
});
