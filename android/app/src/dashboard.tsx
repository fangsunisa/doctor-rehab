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
    name: initialPatient?.name || route?.params?.patientName || '',
    hn: initialPatient?.hn || route?.params?.hn || '',
    symptom: initialPatient?.symptom || '',
    age: '',
    caregiver: '',
    caregiverPhone: '',
    profileImage: null,
    startDate: '', 
    endDate: '',   
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
  const [allMasterExercises, setAllMasterExercises] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [monthlyWeekData, setMonthlyWeekData] = useState<any[]>([]); 
  const [weeklyBreakdownData, setWeeklyBreakdownData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  
  const [selectedWeekExerciseFilter, setSelectedWeekExerciseFilter] = useState<string>('all');
  const [isWeekExerciseDropdownOpen, setIsWeekExerciseDropdownOpen] = useState(false);
  const [selectedMonthExerciseFilter, setSelectedMonthExerciseFilter] = useState<string>('all');
  const [isMonthExerciseDropdownOpen, setIsMonthExerciseDropdownOpen] = useState(false);
  
  const [patientAssignedExercises, setPatientAssignedExercises] = useState<any[]>([]);
  
  const [selectedDayView, setSelectedDayView] = useState<'all' | string>('all');
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeDateStr = (dateInput: string) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return getLocalDateString(d);
    }
    return dateInput.split('T')[0].trim();
  };

  const generateWeeksList = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) {
      return [];
    }

    let startDateObj = new Date(startStr);
    let endDateObj = new Date(endStr);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return [];
    }

    let currentStart = new Date(startDateObj);
    let dayOfWeek = currentStart.getDay(); 
    let diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentStart.setDate(currentStart.getDate() + diffToMonday);

    const weeks = [];
    let weekNum = 1;

    const formatDateThai = (d: Date) => {
      const day = d.getDate();
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
    };

    while (currentStart <= endDateObj && weeks.length < 52) {
      let weekDays = [];
      let tempDate = new Date(currentStart);
      
      for (let i = 0; i < 7; i++) {
        const shortDays = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
        const fullDays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

        weekDays.push({
          short: shortDays[i],
          full: fullDays[i],
          dateStr: getLocalDateString(tempDate),
          displayDate: `${tempDate.getDate()} ${months[tempDate.getMonth()]}`
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }

      weeks.push({
        title: `สัปดาห์ที่ ${weekNum} (${formatDateThai(new Date(weekDays[0].dateStr))} - ${formatDateThai(new Date(weekDays[6].dateStr))})`,
        startDate: weekDays[0].dateStr,
        endDate: weekDays[6].dateStr,
        days: weekDays
      });

      currentStart.setDate(currentStart.getDate() + 7);
      weekNum++;
    }

    return weeks;
  };

  const weeksList = generateWeeksList(patientData.startDate, patientData.endDate);

  useEffect(() => {
    setCurrentWeekIndex(0);
  }, [patientData.startDate, patientData.endDate]);

  const [trainingSummary, setTrainingSummary] = useState({ completedCount: 0, totalCount: 0 });

  const calculateAge = (dobString: string) => {
    if (!dobString) return '-';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '-';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return `${age} ปี`;
  };

  const formatHN = (id: any, rawHn?: string) => {
    if (rawHn && rawHn !== '-') return rawHn;
    if (!id || id === '-') return '-';
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
    const rawTime = item?.Last_Performed;
    const formattedTime = rawTime 
      ? new Date(rawTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' น.'
      : '-';

    const completedReps = Number(item?.Completed_Reps || 0);
    const targetReps = Number(item?.Target_Reps || 10);
    const completedSets = Number(item?.Completed_Sets || 0);
    const totalSets = Number(item?.Target_Sets || 2);
    
    const formatTimeSpent = (timeStr: string) => {
      if (!timeStr || timeStr === '00:00:00' || timeStr === '-') return '-';
      const parts = timeStr.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0], 10);
        const mins = parseInt(parts[1], 10);
        const secs = parseInt(parts[2], 10);
        let result = '';
        if (hours > 0) result += `${hours} ชั่วโมง `;
        if (mins > 0) result += `${mins} นาที `;
        if (secs > 0 || result === '') result += `${secs} วินาที`;
        return result.trim();
      }
      return timeStr;
    };

    return {
      id: String(item?.ProgramExerciseID || index + 1),
      name: item?.Thai_Name || item?.Exercise_Thai_Name, 
      code: item?.Exercise_Name || item?.Category || `exercise_${index + 1}`,
      done: completedReps,
      target: targetReps,
      completedSets: completedSets,
      totalSets: totalSets,
      timeSpent: formatTimeSpent(item?.Time_Spent),
      restTime: '-', 
      lastTime: formattedTime,
      note: item?.User_Note || '',
    };
  };

  const defaultExercises = [
    { id: '1', name: 'งอเข่าไปด้านหลัง', code: 'Standing Hamstring Curl', done: 0, target: 10, completedSets: 0, totalSets: 2, timeSpent: '-', restTime: '-', lastTime: '-', note: '' },
    { id: '2', name: 'ยืดขาออกไปด้านข้าง', code: 'Standing Side Leg Raise', done: 0, target: 10, completedSets: 0, totalSets: 2, timeSpent: '-', restTime: '-', lastTime: '-', note: '' },
  ];

  useEffect(() => {
    fetch('http://localhost:3000/api/exercises')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllMasterExercises(data);
        }
      })
      .catch(() => {});

    const targetId = paramPatientId;
    if (targetId && targetId !== '-') {
      fetch(`http://localhost:3000/api/doctor/patient/${targetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            const fullName = `${data.First_Name || ''} ${data.Last_Name || ''}`.trim();
            setPatientData({
              id: data.PatientID || targetId,
              name: fullName || '-',
              hn: data.HN || formatHN(data.PatientID || targetId),
              symptom: data.Medical_Condition || '-',
              age: calculateAge(data.DOB),
              caregiver: data.Caregiver_Name || '-',
              caregiverPhone: data.Caregiver_Phone || '-',
              profileImage: data.Profile_Image || null,
              startDate: data.Start_Date || '',
              endDate: data.End_Date || '',
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

      fetch(`http://localhost:3000/api/patient/weekly-exercise-breakdown/${targetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWeeklyBreakdownData(data);
          }
        })
        .catch((err) => console.error('Error fetching weekly exercise breakdown:', err));

      const dateQuery = selectedDate ? `?date=${selectedDate}` : '';
      fetch(`http://localhost:3000/api/doctor/patient/${targetId}/dashboard${dateQuery}`)
        .then((res) => res.json())
        .then((data) => {
          const exercisesArray = Array.isArray(data) ? data : (data.exercises || []);
          const summaryObj = data.summary || { completedCount: 0, totalCount: exercisesArray.length };

          if (exercisesArray.length > 0) {
            const parsed = exercisesArray.map((item: any, idx: number) => parseExerciseItem(item, idx));
            setDashboardData(parsed);

            const uniqueExercisesMap = new Map();
            parsed.forEach((ex: any) => {
              const codeKey = ex.code || ex.name;
              if (codeKey && !uniqueExercisesMap.has(codeKey)) {
                uniqueExercisesMap.set(codeKey, {
                  code: ex.code,
                  name: `${ex.code || ''} ${ex.name || ''}`.trim()
                });
              }
            });

            setPatientAssignedExercises([
              { code: 'all', name: '🎯 ทุกท่า (All)' },
              ...Array.from(uniqueExercisesMap.values())
            ]);
          } else {
            setDashboardData([]);
            setPatientAssignedExercises([{ code: 'all', name: '🎯 ทุกท่า (All)' }]);
          }
          setTrainingSummary(summaryObj);
        })
        .catch(() => {
          setDashboardData([]);
          setPatientAssignedExercises([{ code: 'all', name: '🎯 ทุกท่า (All)' }]);
        });

      const summaryDateQuery = selectedDate ? `?date=${selectedDate}` : '';
      fetch(`http://localhost:3000/api/doctor/patient/${targetId}/dashboard-summary${summaryDateQuery}`)
        .then((res) => res.json())
        .then((summaryData) => {
          if (summaryData && !summaryData.error) {
            setLatestAssessment({
              feeling: summaryData.feeling || 'รอดำเนินการ',
              note: summaryData.note || 'ยังไม่มีบันทึกอาการจากผู้ป่วยในระบบ...',
              timeSpent: summaryData.timeSpent || '-',
              statusBadge: summaryData.statusBadge || 'รอดำเนินการ',
            });
          }
        })
        .catch((err) => console.error('Error fetching dashboard summary:', err));

      fetch(`http://localhost:3000/api/patient/history/${targetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.history && data.history.length > 0) {
            const allLogs = data.history.flatMap((group: any) => group.logs || []);
            
            const enrichedLogs = allLogs.map((log: any) => {
              const exercisesList = (log.exercises && log.exercises.length > 0) 
                ? log.exercises.map((ex: any) => {
                    const actualDone = Number(ex.Completed_Reps ?? ex.done ?? 0);
                    const targetReps = Number(ex.Target_Reps ?? ex.target ?? 10);
                    const completedSets = Number(ex.Completed_Sets ?? ex.sets ?? 0);
                    const totalSets = Number(ex.Target_Sets ?? ex.totalSets ?? 2);
                    
                    const isExercisePassed = actualDone >= targetReps && completedSets >= totalSets;

                    return {
                      name: ex.name || ex.Exercise_Name || '-',
                      code: ex.code || ex.Category || '',
                      done: actualDone,
                      target: targetReps,
                      sets: completedSets,
                      totalSets: totalSets,
                      isPassed: isExercisePassed,
                      percentage: targetReps > 0 ? Math.min(Math.round((actualDone / targetReps) * 100), 100) : 0
                    };
                  })
                : [];

              const totalExercises = exercisesList.length;
              const completedExercisesCount = exercisesList.filter((ex: any) => ex.isPassed).length;

              const dayOverallPercent = totalExercises > 0 
                ? Math.round((completedExercisesCount / totalExercises) * 100) 
                : 0;

              return {
                ...log,
                exercises: exercisesList,
                percentage: dayOverallPercent,
                isSuccess: dayOverallPercent === 100,
                rawDate: log.rawDate || log.dateKey 
              };
            });

            setHistoryLogs(enrichedLogs);
          }
        })
        .catch((err) => console.error('Error fetching history for dashboard:', err));
    } else {
      setDashboardData(defaultExercises);
      setPatientAssignedExercises([
        { code: 'all', name: '🎯 ทุกท่า (All)' },
        ...defaultExercises.map((ex: any) => ({ code: ex.code || ex.name, name: `${ex.code || ''} ${ex.name || ''}`.trim() }))
      ]);
    }
  }, [paramPatientId, trainingSummary.completedCount, trainingSummary.totalCount, selectedDate]);

  const chartMaxVal = 15;
  const chartPlotHeight = 245;
  const yAxisDayLabels = ['15', '10', '5', '0'];

  return (
    <View style={styles.appContainer}>
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

      <View style={styles.mainContent}>
        <View style={styles.topNavbar}>
          <View style={styles.searchBoxContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหาชื่อผู้ป่วย "
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

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          style={{ overflow: 'visible' }}
          nestedScrollEnabled={true}
        >
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
                  <View style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: '#94A3B8',
                    position: 'absolute',
                    top: 12
                  }} />
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

          {selectedTab === 'day' && (
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
          )}

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

          {/* TAB 1: รายวัน (DAY) */}
          {selectedTab === 'day' && (
            <>
              <View style={[styles.card, { zIndex: 9999, elevation: 10, overflow: 'visible' }]}>
                <View style={[styles.chartHeader, { zIndex: 9999, overflow: 'visible' }]}>
                  <View style={{ flex: 1, minWidth: 200 }}>
                    <Text style={styles.chartTitle}>
                      {selectedDayView === 'all' ? 'ผลการทำกายภาพบำบัด: ภาพรวม (DAY)' : `ผลการทำกายภาพบำบัด วัน ${selectedDayView}`}
                    </Text>
                    <Text style={styles.chartSubTitle}>แสดงผลเป็นจำนวนครั้ง (Repetitions) ในแต่ละท่า</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 9999, flexWrap: 'wrap' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 9998, position: 'relative' }}>
                      <Text style={{ fontSize: 13, color: '#475569', fontWeight: '600' }}>เลือกมุมมอง:</Text>
                      <Pressable
                        onPress={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
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
                          width: 170,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#1E293B', fontWeight: '600' }}>
                          {selectedDayView === 'all' ? '📊 วันล่าสุด (Latest)' : selectedDayView}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#64748B', marginLeft: 4 }}>▼</Text>
                      </Pressable>

                      {isDayDropdownOpen && (
                        <View style={{
                          position: 'absolute',
                          right: 0,
                          top: 38,
                          backgroundColor: '#FFFFFF',
                          borderWidth: 1,
                          borderColor: '#CBD5E1',
                          borderRadius: 8,
                          width: 170,
                          zIndex: 99999,
                          elevation: 20,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 6,
                          maxHeight: 240,
                        }}>
                          <ScrollView nestedScrollEnabled={true}>
                            <Pressable
                              onPress={() => { 
                                setSelectedDayView('all'); 
                                setSelectedDate(''); 
                                setIsDayDropdownOpen(false); 
                              }}
                              style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#F8FAFC' }}
                            >
                              <Text style={{ fontSize: 12, color: '#1E293B', fontWeight: '600' }}>📊 วันล่าสุด (Latest)</Text>
                            </Pressable>
                            {Array.from(new Set(historyLogs.map(log => log.date))).map((uniqueDate, i) => (
                              <Pressable
                                key={i}
                                onPress={() => { 
                                  setSelectedDayView(uniqueDate); 
                                  const foundLog = historyLogs.find(l => l.date === uniqueDate);
                                  if (foundLog && foundLog.rawDate) {
                                    setSelectedDate(foundLog.rawDate);
                                  }
                                  setIsDayDropdownOpen(false); 
                                }}
                                style={{ padding: 10, borderBottomWidth: i < historyLogs.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}
                              >
                                <Text style={{ fontSize: 12, color: '#1E293B' }}>{uniqueDate}</Text>
                              </Pressable>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
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

                <View style={[styles.chartWrapper, { height: 280 }]}>
                  <View style={[styles.yAxisOverlay, { bottom: 29 }]}>
                    {yAxisDayLabels.map((label, index) => (
                      <View key={index} style={styles.gridRow}>
                        <Text style={styles.yAxisText}>{label}</Text>
                        <View style={styles.dashedLine} />
                      </View>
                    ))}
                  </View>

                  <View style={{ position: 'absolute', bottom: 35, left: 35, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                    {dashboardData.length === 0 ? (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: '#94A3B8' }}>ไม่พบข้อมูลท่ากายภาพในโปรแกรมของคนไข้รายนี้</Text>
                      </View>
                    ) : (
                      dashboardData.map((item, index) => {
                        const maxHeight = chartPlotHeight;
                        const targetVal = Math.max(Number(item.target ?? 0), 0);
                        const doneVal = Math.max(Number(item.done ?? 0), 0);

                        const targetHeight = Math.min(
                          (targetVal / chartMaxVal) * maxHeight,
                          maxHeight
                        );

                        const doneHeight = Math.min(
                          (doneVal / chartMaxVal) * maxHeight,
                          maxHeight
                        );

                        return (
                          <View key={index} style={{ alignItems: 'center', flex: 1, marginHorizontal: 6, height: '100%', justifyContent: 'flex-end', paddingBottom: 0 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: maxHeight, gap: 6, justifyContent: 'center' }}>
                              <View style={{ width: 34, height: Math.max(targetHeight, 0), backgroundColor: '#3B82F6', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                              <View style={{ width: 34, height: Math.max(doneHeight, 0), backgroundColor: '#10B981', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                            </View>
                            
                            <View style={{ position: 'absolute', bottom: -45, width: 95, alignItems: 'center' }}>
                              <Text 
                                numberOfLines={2} 
                                ellipsizeMode="tail"
                                style={{ fontSize: 9.5, color: '#334155', fontWeight: '600', textAlign: 'center', lineHeight: 12 }}
                              >
                                {item.code} {item.name}
                              </Text>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle}>🗓️ บันทึกการฝึกประจำวัน</Text>
                  <Text style={styles.badgeText}>
                    รวมเวลาฝึก: {latestAssessment.timeSpent}
                  </Text>
                </View>

                <View style={styles.noteContentBox}>
                  <Text style={styles.noteSubject}>
                    💭 บันทึกอาการจากคนไข้ (หลังฝึก) <Text style={styles.tagPending}>{latestAssessment.statusBadge}</Text>
                  </Text>
                  <Text style={styles.noteDetail}>"{latestAssessment.note}"</Text>
                </View>

                <View style={{ marginTop: 16, gap: 12 }}>
                  {dashboardData.length === 0 ? (
                    <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: 15 }}>ไม่มีรายการฝึกในระบบ</Text>
                  ) : (
                    dashboardData.map((item, index) => {
                      const isPassed = (item.done >= item.target) && (item.completedSets >= item.totalSets);
                      const isPartiallyDone = (item.done > 0 && !isPassed) || (item.completedSets > 0 && !isPassed);

                      return (
                        <View 
                          key={index} 
                          style={{ 
                            padding: 14, 
                            borderRadius: 12, 
                            backgroundColor: isPassed ? '#F0FDF4' : (isPartiallyDone ? '#FEFCE8' : '#FEF2F2'),
                            borderWidth: 1,
                            borderColor: isPassed ? '#BBF7D0' : (isPartiallyDone ? '#FEF08A' : '#FCA5A5') 
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: isPassed ? '#DCFCE7' : (isPartiallyDone ? '#FEF9C3' : '#FEE2E2'), justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16 }}>{isPassed ? '🟩' : (isPartiallyDone ? '⏳' : '🟥')}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>
                                  {index + 1}. {item.name} {item.code ? `(${item.code})` : ''}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                  ⏱️ เป้าหมาย: {item.target} ครั้ง | 🔄 เซต: {item.completedSets} / {item.totalSets} เซต
                                </Text>

                                {item.done > 0 && !isPassed ? (
                                  <Text style={{ fontSize: 12, color: '#D97706', fontWeight: '600', marginTop: 4 }}>
                                    ⚠️ ทำไปแล้ว: {item.done} / {item.target} ครั้ง (ทำค้างไว้)
                                  </Text>
                                ) : null}

                                {item.note ? (
                                  <Text style={{ fontSize: 12, color: '#D97706', fontWeight: '600', marginTop: 2 }}>
                                    📝 หมายเหตุ: {item.note}
                                  </Text>
                                ) : null}
                              </View>
                            </View>

                            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: isPassed ? '#DCFCE7' : (isPartiallyDone ? '#FEF9C3' : '#FEE2E2') }}>
                              <Text style={{ fontSize: 13, fontWeight: '700', color: isPassed ? '#166534' : (isPartiallyDone ? '#A16207' : '#991B1B') }}>
                                {isPassed 
                                  ? `✅ สำเร็จ (${item.done}/${item.target})` 
                                  : (isPartiallyDone 
                                      ? `⏳ ทำค้างไว้ (${item.done}/${item.target} ครั้ง)`  
                                      : `❌ ยังไม่ทำ`
                                    )}
                              </Text>
                            </View>
                          </View>

                          <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: isPassed ? '#DCFCE7' : '#FEE2E2', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <Text style={{ fontSize: 11, color: '#475569', fontWeight: '600' }}>
                              ⏱️ เวลาที่ใช้ในเเต่ละท่า: <Text style={{ color: '#0288D1' }}>{item.timeSpent}</Text>
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            </>
          )}

         {/* TAB 2: รายสัปดาห์ (WEEK) */}
          {selectedTab === 'week' && (() => {
            const activeWeek = weeksList[currentWeekIndex] || weeksList[0];
            if (!activeWeek) {
              return (
                <View style={styles.card}>
                  <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: 20 }}>ไม่พบข้อมูลรอบโปรแกรมของผู้ป่วย</Text>
                </View>
              );
            }

            const programStart = normalizeDateStr(patientData.startDate);
            const programEnd = normalizeDateStr(patientData.endDate);
            const todayStr = getLocalDateString(new Date());

            const filteredLogs = historyLogs.filter(log => {
              if (!log.rawDate) return false;
              const logDateStr = normalizeDateStr(log.rawDate);
              const startStr = activeWeek.startDate;
              const endStr = activeWeek.endDate;
              
              if (programStart && logDateStr < programStart) return false;
              if (programEnd && logDateStr > programEnd) return false;

              return logDateStr >= startStr && logDateStr <= endStr;
            });

            const weekDailyPercentages = (activeWeek.days || []).map((dayItem: any) => {
              const dayStr = dayItem.dateStr;

              if ((programStart && dayStr < programStart) || (programEnd && dayStr > programEnd) || (dayStr > todayStr)) {
                return null;
              }

              const dayLogs = historyLogs.filter(log => {
                if (!log.rawDate) return false;
                const logDateOnly = normalizeDateStr(log.rawDate);
                return logDateOnly === dayItem.dateStr;
              });

              if (dayLogs.length === 0) return 0;

              const targetLog = dayLogs[dayLogs.length - 1];
              if (!targetLog || !targetLog.exercises || targetLog.exercises.length === 0) return 0;

              const exercisesList = targetLog.exercises;
              const totalExercisesInProgram = exercisesList.length;

              if (selectedWeekExerciseFilter === 'all') {
                const completedExercisesCount = exercisesList.filter((ex: any) => ex.isPassed || (Number(ex.done) >= Number(ex.target))).length;
                const percent = Math.round((completedExercisesCount / totalExercisesInProgram) * 100);
                return percent > 100 ? 100 : percent;
              } else {
                const foundEx = exercisesList.find((ex: any) => {
                  const exCode = String(ex.code || '').toLowerCase().trim();
                  const exName = String(ex.name || '').toLowerCase().trim();
                  const exCategory = String(ex.Category || '').toLowerCase().trim();
                  const filterVal = String(selectedWeekExerciseFilter || '').toLowerCase().trim();
                  
                  return exCode === filterVal || 
                         exName === filterVal || 
                         exCategory === filterVal ||
                         exCode.includes(filterVal) || 
                         filterVal.includes(exCode) ||
                         exName.includes(filterVal);
                });
                
                if (!foundEx) return 0;
                const done = Number(foundEx.done || foundEx.Completed_Reps || 0);
                const target = Number(foundEx.target || foundEx.Target_Reps || 10);
                if (target <= 0) return 0;
                const percent = Math.round((done / target) * 100);
                return percent > 100 ? 100 : percent;
              }
            });

            const validDaysInWeek = weekDailyPercentages.filter((p: any) => p !== null);

            const successDaysCount = validDaysInWeek.filter((p: any) => p >= 100).length;
            const partialDaysCount = validDaysInWeek.filter((p: any) => p > 0 && p < 100).length;
            const missedDaysCount = validDaysInWeek.filter((p: any) => p === 0).length;

            const yAxisWeekLabels = ['100%', '75%', '50%', '25%', '0%'];

            return (
              <>
                <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }]}>
                  <Pressable
                    onPress={() => setCurrentWeekIndex(prev => Math.max(0, prev - 1))}
                    style={{ backgroundColor: currentWeekIndex === 0 ? '#E2E8F0' : '#0288D1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
                    disabled={currentWeekIndex === 0}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>◀ สัปดาห์ก่อนหน้า</Text>
                  </Pressable>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#166534' }}>
                      {activeWeek.title}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setCurrentWeekIndex(prev => Math.min(weeksList.length - 1, prev + 1))}
                    style={{ backgroundColor: currentWeekIndex === weeksList.length - 1 ? '#E2E8F0' : '#0288D1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
                    disabled={currentWeekIndex === weeksList.length - 1}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>สัปดาห์ถัดไป ▶</Text>
                  </Pressable>
                </View>

                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                  <View style={[styles.card, { flex: 1, backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, alignItems: 'center', paddingVertical: 16, marginBottom: 0 }]}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#166534' }}>🟩 สำเร็จตามเป้า</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#166534', marginTop: 6 }}>{successDaysCount} วัน</Text>
                  </View>

                  <View style={[styles.card, { flex: 1, backgroundColor: '#FEFCE8', borderColor: '#FEF08A', borderWidth: 1, alignItems: 'center', paddingVertical: 16, marginBottom: 0 }]}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#A16207' }}>⏳ ทำค้างไว้</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#A16207', marginTop: 6 }}>{partialDaysCount} วัน</Text>
                  </View>

                  <View style={[styles.card, { flex: 1, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1, alignItems: 'center', paddingVertical: 16, marginBottom: 0 }]}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>🟥 ไม่ได้ทำ</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#64748B', marginTop: 6 }}>{missedDaysCount} วัน</Text>
                  </View>
                </View>

                <View style={[styles.card, { overflow: 'visible', zIndex: 9999, elevation: 10 }]}>
                  <View style={{ marginBottom: 14, overflow: 'visible', zIndex: 9999 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, zIndex: 9999 }}>
                      <View style={{ flex: 1, minWidth: 220 }}>
                        <Text style={styles.chartTitle}>สถิติความสำเร็จรายสัปดาห์ (%)</Text>
                        <Text style={styles.chartSubTitle}>
                          {selectedWeekExerciseFilter === 'all' 
                            ? 'แสดงผลสัดส่วนความสำเร็จรวม (%) ของทุกท่าในแต่ละวัน' 
                            : `แสดงผลเฉพาะท่า: ${patientAssignedExercises.find(e => e.code === selectedWeekExerciseFilter)?.name || selectedWeekExerciseFilter}`}
                        </Text>
                      </View>

                      <View style={{ width: 300, zIndex: 99999, position: 'relative' }}>
                        <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600', marginBottom: 4 }}>เลือกท่ากายภาพ:</Text>

                        <Pressable
                          onPress={() => setIsWeekExerciseDropdownOpen(!isWeekExerciseDropdownOpen)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#CBD5E1',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text numberOfLines={1} style={{ fontSize: 12, color: '#1E293B', fontWeight: '600', flex: 1 }}>
                            {patientAssignedExercises.find(item => item.code === selectedWeekExerciseFilter)?.name || '🎯 ทุกท่า (All)'}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#64748B', marginLeft: 6 }}>{isWeekExerciseDropdownOpen ? '▲' : '▼'}</Text>
                        </Pressable>

                        {isWeekExerciseDropdownOpen && (
                          <View style={{
                            position: 'absolute',
                            top: 60,
                            left: 0,
                            right: 0,
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#CBD5E1',
                            borderRadius: 8,
                            maxHeight: 220,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            elevation: 30,
                            zIndex: 99999,
                          }}>
                            <ScrollView nestedScrollEnabled={true}>
                              {patientAssignedExercises.map((ex, i) => (
                                <Pressable
                                  key={i}
                                  onPress={() => { 
                                    setSelectedWeekExerciseFilter(ex.code); 
                                    setIsWeekExerciseDropdownOpen(false); 
                                  }}
                                  style={{ 
                                    padding: 12, 
                                    borderBottomWidth: i < patientAssignedExercises.length - 1 ? 1 : 0, 
                                    borderBottomColor: '#F1F5F9',
                                    backgroundColor: selectedWeekExerciseFilter === ex.code ? '#F0FDF4' : '#FFFFFF'
                                  }}
                                >
                                  <Text numberOfLines={1} style={{ fontSize: 12, color: selectedWeekExerciseFilter === ex.code ? '#166534' : '#1E293B', fontWeight: selectedWeekExerciseFilter === ex.code ? '700' : '400' }}>
                                    {ex.name}
                                  </Text>
                                </Pressable>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.legendText}>สีเขียว = สำเร็จตามเป้า (100%)</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: '#3B82F6' }]} />
                      <Text style={styles.legendText}>สีน้ำเงิน = ทำค้างไว้</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: '#E2E8F0' }]} />
                      <Text style={styles.legendText}>สีเทา = ไม่ได้ทำ</Text>
                    </View>
                  </View>

                  <View style={[styles.chartWrapper, { height: 280 }]}>
                    <View style={[styles.yAxisOverlay, { bottom: 29 }]}>
                      {yAxisWeekLabels.map((label, index) => (
                        <View key={index} style={styles.gridRow}>
                          <Text style={styles.yAxisText}>{label}</Text>
                          <View style={styles.dashedLine} />
                        </View>
                      ))}
                    </View>

                    <View style={{ position: 'absolute', bottom: 36, left: 35, right: 0, top: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                      {activeWeek.days && activeWeek.days.map((dayItem: any, index: number) => {
                        const percentVal = weekDailyPercentages[index];
                        const maxHeight = 238; 

                        if (percentVal === null) {
                          return (
                            <View key={index} style={{ alignItems: 'center', flex: 1, marginHorizontal: 4, height: '100%', justifyContent: 'flex-end', paddingBottom: 0 }}>
                              <View style={{ height: maxHeight, justifyContent: 'flex-end', alignItems: 'center' }} />
                              <View style={{ position: 'absolute', bottom: -45, width: 60, alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', textAlign: 'center', height: 14 }}>{dayItem.short}</Text>
                                <Text style={{ fontSize: 9, color: '#94A3B8', textAlign: 'center', height: 12 }}>{dayItem.displayDate}</Text>
                              </View>
                            </View>
                          );
                        }

                        const barHeight = percentVal > 0 ? Math.min(Math.max((percentVal / 100) * maxHeight, 12), maxHeight) : 4;
                        const barColor = percentVal >= 100 ? '#10B981' : (percentVal > 0 ? '#3B82F6' : '#E2E8F0');           

                        return (
                          <View key={index} style={{ alignItems: 'center', flex: 1, marginHorizontal: 4, height: '100%', justifyContent: 'flex-end', paddingBottom: 0 }}>
                            <View style={{ height: maxHeight, justifyContent: 'flex-end', alignItems: 'center' }}>
                              {percentVal > 0 && (
                                <Text style={{ fontSize: 9, fontWeight: '700', color: percentVal >= 100 ? '#166534' : '#1E40AF', marginBottom: 2 }}>
                                  {percentVal}%
                                </Text>
                              )}
                              <View 
                                style={{ 
                                  width: 42, 
                                  height: barHeight, 
                                  backgroundColor: barColor, 
                                  borderTopLeftRadius: 6, 
                                  borderTopRightRadius: 6,
                                }}
                              />
                            </View>

                            <View style={{ position: 'absolute', bottom: -45, width: 60, alignItems: 'center' }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#1E293B', textAlign: 'center', height: 14 }}>
                                {dayItem.short}
                              </Text>
                              <Text style={{ fontSize: 9, color: '#64748B', textAlign: 'center', height: 12 }}>
                                {dayItem.displayDate}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 14 }}>🗓️ ประวัติการฝึกจริงในสัปดาห์นี้ (Weekly Log)</Text>
                  {filteredLogs.length === 0 ? (
                    <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: 20 }}>ยังไม่มีประวัติการฝึกในสัปดาห์นี้</Text>
                  ) : (
                    <View style={{ gap: 12 }}>
                      {filteredLogs.map((log, index) => (
                        <Pressable 
                          key={index} 
                          onPress={() => {
                            setSelectedDayView(log.date);
                            if (log.rawDate) {
                              setSelectedDate(log.rawDate);
                            }
                            setSelectedTab('day');
                          }}
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
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>{log.date} (กดเพื่อดูรายละเอียดวัน)</Text>
                            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>💬 บันทึก: {log.detail}</Text>
                          </View>
                          <View style={{ backgroundColor: log.isSuccess ? '#DCFCE7' : '#FEE2E2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: log.isSuccess ? '#166534' : '#991B1B' }}>
                              {log.isSuccess ? `✅ ผ่านเกณฑ์ (${log.percentage}%)` : `⏳ กำลังทำ (${log.percentage}%)`}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </>
            );
          })()}

         {/* TAB 3: รายเดือน (MONTH) - ปรับพื้นที่ด้านบนให้ตัวเลข 100% ไม่ชนขอบ และจัด Scrollbar แนวนอนให้อยู่ในระดับพอดีไม่ลอย */}
          {selectedTab === 'month' && (() => {
            const getDaysInMonthView = () => {
              if (!patientData.startDate || !patientData.endDate) {
                return historyLogs.map(log => log.rawDate).filter(Boolean);
              }
              
              let start = new Date(patientData.startDate);
              let end = new Date(patientData.endDate);
              if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

              let dayList = [];
              let curr = new Date(start);
              while (curr <= end && dayList.length < 90) {
                dayList.push(getLocalDateString(curr));
                curr.setDate(curr.getDate() + 1);
              }
              return dayList;
            };

            const allMonthDates = getDaysInMonthView();
            const programStart = normalizeDateStr(patientData.startDate);
            const programEnd = normalizeDateStr(patientData.endDate);
            const todayStr = getLocalDateString(new Date());

            const monthDailyData = allMonthDates.map((dateStr) => {
              const shortDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
              const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
              
              const dObj = new Date(dateStr);
              const dayOfWeek = dObj.getDay();
              
              if ((programStart && dateStr < programStart) || (programEnd && dateStr > programEnd) || (dateStr > todayStr)) {
                return {
                  dateStr,
                  short: shortDays[dayOfWeek],
                  displayDate: `${dObj.getDate()} ${months[dObj.getMonth()]}`,
                  percent: null
                };
              }

              const dayLogs = historyLogs.filter(log => {
                if (!log.rawDate) return false;
                return normalizeDateStr(log.rawDate) === dateStr;
              });

              if (dayLogs.length === 0) {
                return {
                  dateStr,
                  short: shortDays[dayOfWeek],
                  displayDate: `${dObj.getDate()} ${months[dObj.getMonth()]}`,
                  percent: 0
                };
              }

              const targetLog = dayLogs[dayLogs.length - 1];
              if (!targetLog || !targetLog.exercises || targetLog.exercises.length === 0) {
                return {
                  dateStr,
                  short: shortDays[dayOfWeek],
                  displayDate: `${dObj.getDate()} ${months[dObj.getMonth()]}`,
                  percent: 0
                };
              }

              const exercisesList = targetLog.exercises;
              const totalExercisesInProgram = exercisesList.length;

              if (selectedMonthExerciseFilter === 'all') {
                const completedExercisesCount = exercisesList.filter((ex: any) => ex.isPassed || (Number(ex.done) >= Number(ex.target))).length;
                const percent = Math.round((completedExercisesCount / totalExercisesInProgram) * 100);
                return {
                  dateStr,
                  short: shortDays[dayOfWeek],
                  displayDate: `${dObj.getDate()} ${months[dObj.getMonth()]}`,
                  percent: percent > 100 ? 100 : percent
                };
              } else {
                const foundEx = exercisesList.find((ex: any) => {
                  const exCode = String(ex.code || '').toLowerCase().trim();
                  const exName = String(ex.name || '').toLowerCase().trim();
                  const filterVal = String(selectedMonthExerciseFilter || '').toLowerCase().trim();
                  return exCode === filterVal || exName === filterVal || exCode.includes(filterVal) || exName.includes(filterVal);
                });
                
                if (!foundEx) {
                  return {
                    dateStr,
                    short: shortDays[dayOfWeek],
                    displayDate: `${dObj.getDate()} ${months[dObj.getMonth()]}`,
                    percent: 0
                  };
                }

                const done = Number(foundEx.done || 0);
                const target = Number(foundEx.target || 10);
                const percent = target > 0 ? Math.min(Math.round((done / target) * 100), 100) : 0;
                return {
                  dateStr,
                  short: shortDays[dayOfWeek],
                  displayDate: `${dObj.getDate()} ${months[dObj.getMonth()]}`,
                  percent
                };
              }
            });

            const totalDaysDone = historyLogs.length;

            return (
              <>
                <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#166534' }}>📈 สรุปผลการทำกายภาพบำบัดประจำเดือน (แสดงรายวัน)</Text>
                    <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 12, color: '#166534', fontWeight: '700' }}>
                        รวมวันที่ออกกำลังกายทั้งหมด: {totalDaysDone} วัน
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.card, { overflow: 'visible', zIndex: 9999 }]}>
                  <View style={[styles.chartHeader, { zIndex: 9999 }]}>
                    <View style={{ flex: 1, minWidth: 200 }}>
                      <Text style={styles.chartTitle}>สถิติความสำเร็จรายเดือน (%)</Text>
                      <Text style={styles.chartSubTitle}>
                        {selectedMonthExerciseFilter === 'all' 
                          ? 'แสดงผลสัดส่วนความสำเร็จรวม (%) เรียงตามวันในรอบโปรแกรม' 
                          : `แสดงผลเฉพาะท่า: ${patientAssignedExercises.find(e => e.code === selectedMonthExerciseFilter)?.name || selectedMonthExerciseFilter}`}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 99999 }}>
                      <View style={{ width: 220, zIndex: 99999, position: 'relative' }}>
                        <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600', marginBottom: 4 }}>เลือกท่ากายภาพ:</Text>
                        <Pressable
                          onPress={() => setIsMonthExerciseDropdownOpen(!isMonthExerciseDropdownOpen)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#CBD5E1',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text numberOfLines={1} style={{ fontSize: 12, color: '#1E293B', fontWeight: '600', flex: 1 }}>
                            {patientAssignedExercises.find(item => item.code === selectedMonthExerciseFilter)?.name || '🎯 ทุกท่า (All)'}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#64748B', marginLeft: 6 }}>{isMonthExerciseDropdownOpen ? '▲' : '▼'}</Text>
                        </Pressable>

                        {isMonthExerciseDropdownOpen && (
                          <View style={{
                            position: 'absolute',
                            top: 60,
                            right: 0,
                            left: 0,
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#CBD5E1',
                            borderRadius: 8,
                            maxHeight: 220,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            elevation: 30,
                            zIndex: 99999,
                          }}>
                            <ScrollView nestedScrollEnabled={true}>
                              {patientAssignedExercises.map((ex, i) => (
                                <Pressable
                                  key={i}
                                  onPress={() => { 
                                    setSelectedMonthExerciseFilter(ex.code); 
                                    setIsMonthExerciseDropdownOpen(false); 
                                  }}
                                  style={{ 
                                    padding: 12, 
                                    borderBottomWidth: i < patientAssignedExercises.length - 1 ? 1 : 0, 
                                    borderBottomColor: '#F1F5F9',
                                    backgroundColor: selectedMonthExerciseFilter === ex.code ? '#F0FDF4' : '#FFFFFF'
                                  }}
                                >
                                  <Text numberOfLines={1} style={{ fontSize: 12, color: selectedMonthExerciseFilter === ex.code ? '#166534' : '#1E293B', fontWeight: selectedMonthExerciseFilter === ex.code ? '700' : '400' }}>
                                    {ex.name}
                                  </Text>
                                </Pressable>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.legendText}>สีเขียว = สำเร็จตามเป้า (100%)</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: '#3B82F6' }]} />
                      <Text style={styles.legendText}>สีน้ำเงิน = ทำค้างไว้</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: '#E2E8F0' }]} />
                      <Text style={styles.legendText}>สีเทา = ไม่ได้ทำ</Text>
                    </View>
                  </View>

                  {/* กราฟรายเดือน: คงรูปแบบแท่งกราฟเดิมและเลื่อนซ้าย-ขวาเฉพาะพื้นที่กราฟ */}
                  <View style={[styles.chartWrapper, { height: 295, position: 'relative', overflow: 'hidden' }]}>
                    {/* แกนเปอร์เซ็นต์และเส้นกริดอยู่กับที่ ไม่เลื่อนไปพร้อมแท่งกราฟ */}
                    {/* เว้นพื้นที่ด้านบน 14px สำหรับตัวเลขเปอร์เซ็นต์ โดยให้ปลายแท่ง 100% ตรงกับเส้น 100% */}
                    <View pointerEvents="none" style={[styles.yAxisOverlay, { bottom: 50, top: 24, zIndex: 1 }]}>
                      {['100%', '75%', '50%', '25%', '0%'].map((label, index) => (
                        <View key={index} style={styles.gridRow}>
                          <Text style={styles.yAxisText}>{label}</Text>
                          <View style={styles.dashedLine} />
                        </View>
                      ))}
                    </View>

                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      directionalLockEnabled={true}
                      style={{ position: 'absolute', top: 9, left: 45, right: 0, bottom: 17, zIndex: 2 }}
                      contentContainerStyle={{ paddingRight: 20, alignItems: 'flex-end', minHeight: 276 }}
                    >
                      {monthDailyData.length === 0 ? (
                        <View style={{ height: 230, justifyContent: 'center', alignItems: 'center', width: 300 }}>
                          <Text style={{ fontSize: 13, color: '#94A3B8' }}>ไม่พบข้อมูลรอบโปรแกรมในระบบ</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 276, gap: 14 }}>
                          {monthDailyData.map((item, index) => {
                            const percentVal = item.percent;
                            // ความสูงพื้นที่แท่งตรงกับระยะระหว่างเส้น 0% และ 100%
                            const maxHeight = 207;

                            if (percentVal === null) {
                              return (
                                <View key={index} style={{ alignItems: 'center', width: 42, justifyContent: 'flex-end' }}>
                                  <View style={{ height: maxHeight + 15, justifyContent: 'flex-end', alignItems: 'center', width: 42 }} />
                                  <View style={{ height: 45, justifyContent: 'center', alignItems: 'center', width: 42, marginTop: 2 }}>
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', textAlign: 'center' }}>{item.short}</Text>
                                    <Text style={{ fontSize: 9, color: '#94A3B8', textAlign: 'center' }}>{item.displayDate}</Text>
                                  </View>
                                </View>
                              );
                            }

                            const barHeight = percentVal > 0 ? Math.min(Math.max((percentVal / 100) * maxHeight, 12), maxHeight) : 4;
                            const barColor = percentVal >= 100 ? '#10B981' : (percentVal > 0 ? '#3B82F6' : '#E2E8F0');

                            return (
                              <Pressable 
                                key={index} 
                                onPress={() => {
                                  setSelectedDayView(item.displayDate);
                                  setSelectedDate(item.dateStr);
                                  setSelectedTab('day');
                                }}
                                style={{ alignItems: 'center', width: 42, justifyContent: 'flex-end' }}
                              >
                                <View style={{ height: maxHeight + 15, justifyContent: 'flex-end', alignItems: 'center', width: 42 }}>
                                  {percentVal > 0 && (
                                    <Text style={{ fontSize: 9, fontWeight: '700', color: percentVal >= 100 ? '#166534' : '#1E40AF', marginBottom: 4, textAlign: 'center' }}>
                                      {percentVal}%
                                    </Text>
                                  )}
                                  <View 
                                    style={{ 
                                      width: 34, 
                                      height: barHeight, 
                                      backgroundColor: barColor, 
                                      borderTopLeftRadius: 6, 
                                      borderTopRightRadius: 6 
                                    }} 
                                  />
                                </View>
                                
                                <View style={{ height: 45, justifyContent: 'center', alignItems: 'center', width: 42, marginTop: 2 }}>
                                  <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: '700', color: '#1E293B', textAlign: 'center', width: 42 }}>
                                    {item.short}
                                  </Text>
                                  <Text numberOfLines={1} style={{ fontSize: 9, color: '#64748B', textAlign: 'center', width: 42 }}>
                                    {item.displayDate}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </ScrollView>
                  </View>
                  {monthDailyData.length > 6 && (
                    <Text style={styles.chartScrollHint}>↔ เลื่อนซ้าย–ขวาเพื่อดูข้อมูลวันอื่น ๆ</Text>
                  )}
                </View>

                <View style={styles.card}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 14 }}>🗓️ รายละเอียดประวัติการฝึกรายวันทั้งหมด (Monthly History Log)</Text>
                  <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>คลิกที่รายการวันที่ด้านล่างเพื่อดูรายละเอียดท่าฝึกของวันนั้นๆ ได้ทันที</Text>
                  
                  {historyLogs.length === 0 ? (
                    <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: 20 }}>ยังไม่มีประวัติการฝึกในระบบ</Text>
                  ) : (
                    <View style={{ gap: 12 }}>
                      {historyLogs.map((log, index) => (
                        <Pressable 
                          key={index} 
                          onPress={() => {
                            setSelectedDayView(log.date);
                            if (log.rawDate) {
                              setSelectedDate(log.rawDate);
                            }
                            setSelectedTab('day');
                          }}
                          style={{ 
                            padding: 14, 
                            backgroundColor: log.isSuccess ? '#F0FDF4' : '#FEFCE8', 
                            borderRadius: 10, 
                            borderWidth: 1, 
                            borderColor: log.isSuccess ? '#BBF7D0' : '#FEF08A', 
                            flexDirection: 'row', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>📅 วันที่: {log.date}</Text>
                              <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 11, color: '#0288D1', fontWeight: '600' }}>คลิกดูรายละเอียด</Text>
                              </View>
                            </View>
                            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>💬 บันทึกอาการ: "{log.detail || 'ไม่มีบันทึก'}"</Text>
                          </View>
                          
                          <View style={{ backgroundColor: log.isSuccess ? '#DCFCE7' : '#FEF9C3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: log.isSuccess ? '#166534' : '#A16207' }}>
                              {log.isSuccess ? `✅ ผ่านเกณฑ์ (${log.percentage}%)` : `⏳ ทำค้างไว้ (${log.percentage}%)`}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </>
            );
          })()}

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
    web: {
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      boxSizing: 'border-box',
    } as any,
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
  ...Platform.select({
    web: { marginLeft: 240, minWidth: 0 } as any,
  }),
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
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 16,
    rowGap: 10,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    maxWidth: '100%',
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
    flexShrink: 1,
  },
  chartScrollHint: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  chartWrapper: {
    height: 220,
    position: 'relative',
    marginTop: 10,
  },
  yAxisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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