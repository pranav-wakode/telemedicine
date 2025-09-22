import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Language context
const LanguageContext = React.createContext();

// Sample data to make app look comprehensive
const SAMPLE_DATA = {
  doctors: [
    { id: 1, name: 'Dr. Rajesh Kumar', specialty: 'General Medicine', experience: '15 years', rating: 4.8, available: true, languages: ['Hindi', 'English'] },
    { id: 2, name: 'Dr. Priya Sharma', specialty: 'Pediatrics', experience: '12 years', rating: 4.9, available: true, languages: ['Hindi', 'Punjabi', 'English'] },
    { id: 3, name: 'Dr. Manjeet Singh', specialty: 'Cardiology', experience: '20 years', rating: 4.7, available: false, languages: ['Punjabi', 'Hindi'] },
    { id: 4, name: 'Dr. Sunita Devi', specialty: 'Gynecology', experience: '18 years', rating: 4.9, available: true, languages: ['Hindi', 'English'] },
    { id: 5, name: 'Dr. Harpreet Kaur', specialty: 'Dermatology', experience: '10 years', rating: 4.6, available: true, languages: ['Punjabi', 'Hindi'] }
  ],
  healthTips: [
    { icon: '💧', title: 'Stay Hydrated', content: 'Drink 8-10 glasses of clean water daily' },
    { icon: '🥗', title: 'Balanced Diet', content: 'Include fruits, vegetables, and whole grains in meals' },
    { icon: '🏃‍♂️', title: 'Daily Exercise', content: '30 minutes of walking or yoga daily' },
    { icon: '😴', title: 'Proper Sleep', content: 'Get 7-8 hours of quality sleep every night' },
    { icon: '🧼', title: 'Hand Hygiene', content: 'Wash hands frequently with soap and water' },
    { icon: '🚫', title: 'Avoid Smoking', content: 'Smoking damages lungs and overall health' }
  ],
  medicines: [
    { name: 'Paracetamol', stock: 150, price: 10, uses: 'Fever, Pain relief', category: 'General' },
    { name: 'Amoxicillin', stock: 75, price: 45, uses: 'Bacterial infections', category: 'Antibiotic' },
    { name: 'Metformin', stock: 120, price: 25, uses: 'Diabetes management', category: 'Diabetes' },
    { name: 'Aspirin', stock: 200, price: 8, uses: 'Heart health, Pain', category: 'Cardiology' },
    { name: 'Cetirizine', stock: 90, price: 15, uses: 'Allergy relief', category: 'Allergy' },
    { name: 'Omeprazole', stock: 60, price: 35, uses: 'Acidity, Ulcers', category: 'Gastric' },
    { name: 'Losartan', stock: 40, price: 55, uses: 'High blood pressure', category: 'Cardiology' },
    { name: 'Insulin', stock: 25, price: 180, uses: 'Diabetes (Type 1)', category: 'Diabetes' }
  ],
  hospitals: [
    { name: 'Civil Hospital Mohali', distance: '2.5 km', emergency: true, phone: '+91-172-2214455' },
    { name: 'Max Super Specialty', distance: '8.1 km', emergency: true, phone: '+91-172-5212000' },
    { name: 'Fortis Hospital', distance: '12.3 km', emergency: true, phone: '+91-172-4692222' },
    { name: 'Apollo Hospital', distance: '15.7 km', emergency: true, phone: '+91-172-2661111' }
  ]
};

// Main App Component
function App() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [healthRecords, setHealthRecords] = useState([]);
  const [offlineRecords, setOfflineRecords] = useState([]);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [symptomAssessment, setSymptomAssessment] = useState(null); // Lifted state

  // Language support
  const translations = {
    en: {
      appName: "ArogyaCircle",
      tagline: "Rural Healthcare Made Simple",
      emergencyButton: "EMERGENCY",
      home: "Home",
      records: "Health Records",
      consultation: "Consultation",
      pharmacy: "Pharmacy",
      symptoms: "Symptom Checker",
      profile: "Profile",
      asha: "ASHA Portal",
      hospitals: "Hospitals",
      reports: "Reports",
      insurance: "Insurance",
      selectLanguage: "Select Language",
      verifyPhone: "Verify Phone Number",
      enterOTP: "Enter OTP",
      resendOTP: "Resend OTP",
      verify: "Verify",
      yourName: "Your Name",
      phoneNumber: "Phone Number",
      village: "Village",
      register: "Register",
      checkSymptoms: "Check Your Symptoms",
      bookConsultation: "Book Consultation",
      findMedicines: "Find Medicines",
      viewRecords: "View Health Records",
      emergencyHelp: "Get Emergency Help",
      nearbyHospitals: "Nearby Hospitals",
      healthInsurance: "Health Insurance",
      labReports: "Lab Reports",
      vaccinations: "Vaccinations",
      offline: "Working Offline",
      online: "Connected",
      todaysTips: "Today's Health Tips",
      availableDoctors: "Available Doctors",
      bookNow: "Book Now",
      callNow: "Call Now",
      viewAll: "View All",
      medicineStock: "Medicine Stock",
      lowStock: "Low Stock",
      inStock: "In Stock",
      outOfStock: "Out of Stock"
    },
    hi: {
      appName: "आरोग्य सर्कल",
      tagline: "ग्रामीण स्वास्थ्य सेवा सरल बनाई गई",
      emergencyButton: "आपातकाल",
      home: "होम",
      records: "स्वास्थ्य रिकॉर्ड",
      consultation: "परामर्श",
      pharmacy: "दवाई की दुकान",
      symptoms: "लक्षण जांच",
      profile: "प्रोफ़ाइल",
      asha: "आशा पोर्टल",
      hospitals: "अस्पताल",
      reports: "रिपोर्ट्स",
      insurance: "बीमा",
      selectLanguage: "भाषा चुनें",
      verifyPhone: "फोन नंबर सत्यापित करें",
      enterOTP: "ओटीपी दर्ज करें",
      resendOTP: "ओटीपी फिर से भेजें",
      verify: "सत्यापित करें",
      yourName: "आपका नाम",
      phoneNumber: "फोन नंबर",
      village: "गांव",
      register: "पंजीकरण करें",
      checkSymptoms: "अपने लक्षणों की जांच करें",
      bookConsultation: "परामर्श बुक करें",
      findMedicines: "दवाइयां खोजें",
      viewRecords: "स्वास्थ्य रिकॉर्ड देखें",
      emergencyHelp: "आपातकालीन सहायता पाएं",
      nearbyHospitals: "नजदीकी अस्पताल",
      healthInsurance: "स्वास्थ्य बीमा",
      labReports: "लैब रिपोर्ट्स",
      vaccinations: "टीकाकरण",
      offline: "ऑफलाइन काम कर रहा है",
      online: "जुड़ा हुआ है",
      todaysTips: "आज के स्वास्थ्य सुझाव",
      availableDoctors: "उपलब्ध डॉक्टर",
      bookNow: "अभी बुक करें",
      callNow: "अभी कॉल करें",
      viewAll: "सभी देखें",
      medicineStock: "दवाई का स्टॉक",
      lowStock: "कम स्टॉक",
      inStock: "उपलब्ध",
      outOfStock: "स्टॉक खत्म"
    },
    pa: {
      appName: "ਆਰੋਗਿਆ ਸਰਕਲ",
      tagline: "ਪਿੰਡਾਂ ਲਈ ਸਿਹਤ ਸੇਵਾ ਸੌਖੀ ਬਣਾਈ ਗਈ",
      emergencyButton: "ਐਮਰਜੈਂਸੀ",
      home: "ਘਰ",
      records: "ਸਿਹਤ ਰਿਕਾਰਡ",
      consultation: "ਸਲਾਹ",
      pharmacy: "ਦਵਾਈ ਦੀ ਦੁਕਾਨ",
      symptoms: "ਲੱਛਣ ਜਾਂਚ",
      profile: "ਪ੍ਰੋਫਾਈਲ",
      asha: "ਆਸ਼ਾ ਪੋਰਟਲ",
      hospitals: "ਹਸਪਤਾਲ",
      reports: "ਰਿਪੋਰਟਾਂ",
      insurance: "ਬੀਮਾ",
      selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
      verifyPhone: "ਫੋਨ ਨੰਬਰ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
      enterOTP: "ਓਟੀਪੀ ਦਰਜ ਕਰੋ",
      resendOTP: "ਓਟੀਪੀ ਦੁਬਾਰਾ ਭੇਜੋ",
      verify: "ਤਸਦੀਕ ਕਰੋ",
      yourName: "ਤੁਹਾਡਾ ਨਾਮ",
      phoneNumber: "ਫੋਨ ਨੰਬਰ",
      village: "ਪਿੰਡ",
      register: "ਰਜਿਸਟਰ ਕਰੋ",
      checkSymptoms: "ਆਪਣੇ ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ ਕਰੋ",
      bookConsultation: "ਸਲਾਹ ਬੁੱਕ ਕਰੋ",
      findMedicines: "ਦਵਾਈਆਂ ਲੱਭੋ",
      viewRecords: "ਸਿਹਤ ਰਿਕਾਰਡ ਵੇਖੋ",
      emergencyHelp: "ਐਮਰਜੈਂਸੀ ਮਦਦ ਲਓ",
      nearbyHospitals: "ਨੇੜਲੇ ਹਸਪਤਾਲ",
      healthInsurance: "ਸਿਹਤ ਬੀਮਾ",
      labReports: "ਲੈਬ ਰਿਪੋਰਟਾਂ",
      vaccinations: "ਟੀਕਾਕਰਨ",
      offline: "ਔਫਲਾਈਨ ਕੰਮ ਕਰ ਰਿਹਾ ਹੈ",
      online: "ਜੁੜਿਆ ਹੋਇਆ ਹੈ",
      todaysTips: "ਅੱਜ ਦੇ ਸਿਹਤ ਸੁਝਾਅ",
      availableDoctors: "ਉਪਲਬਧ ਡਾਕਟਰ",
      bookNow: "ਹੁਣੇ ਬੁੱਕ ਕਰੋ",
      callNow: "ਹੁਣੇ ਕਾਲ ਕਰੋ",
      viewAll: "ਸਭ ਵੇਖੋ",
      medicineStock: "ਦਵਾਈ ਦਾ ਸਟਾਕ",
      lowStock: "ਘੱਟ ਸਟਾਕ",
      inStock: "ਉਪਲਬਧ",
      outOfStock: "ਸਟਾਕ ਖਤਮ"
    }
  };

  const t = (key) => translations[currentLanguage][key] || key;

  // Generate sample OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const showNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      time: 'Just now'
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
      showNotification('Back online! Syncing data...', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Working offline', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setTimeout(() => {
      const sampleNotifications = [
        { id: 1, type: 'medicine', message: 'Paracetamol is back in stock at Civil Hospital Pharmacy' },
        { id: 2, type: 'appointment', message: 'Appointment with Dr. Priya Sharma tomorrow at 2 PM' },
        { id: 3, type: 'health', message: 'Time for your monthly diabetes checkup' }
      ];

      sampleNotifications.forEach(notif => {
        showNotification(notif.message, notif.type);
      });
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data on startup
  useEffect(() => {
    const savedRecords = localStorage.getItem('arogya_offline_records');
    if (savedRecords) {
      setOfflineRecords(JSON.parse(savedRecords));
    }

    const savedUser = localStorage.getItem('arogya_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Load sample health records
    const sampleRecords = [
      {
        id: '1',
        type: 'consultation',
        title: 'General Checkup',
        description: 'Regular health screening completed. All vitals normal.',
        doctor_name: 'Dr. Rajesh Kumar',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        medications: [{ name: 'Multivitamin', dosage: '1 tablet daily' }]
      },
      {
        id: '2',
        type: 'prescription',
        title: 'Fever Treatment',
        description: 'Prescribed medication for viral fever. Rest recommended.',
        doctor_name: 'Dr. Priya Sharma',
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        medications: [
          { name: 'Paracetamol', dosage: '500mg twice daily' },
          { name: 'Rest', dosage: 'Complete bed rest for 3 days' }
        ]
      },
      {
        id: '3',
        type: 'test_result',
        title: 'Blood Sugar Test',
        description: 'Fasting blood sugar: 95 mg/dL (Normal). Continue healthy diet.',
        doctor_name: 'Dr. Sunita Devi',
        date: new Date(Date.now() - 86400000 * 15).toISOString(),
        medications: []
      }
    ];
    setHealthRecords(sampleRecords);
  }, []);

  // Sync offline data when coming back online
  const syncOfflineData = async () => {
    if (offlineRecords.length > 0) {
      try {
        await axios.post(`${API}/health-records/sync`, offlineRecords);
        setOfflineRecords([]);
        localStorage.removeItem('arogya_offline_records');
        console.log('Offline data synced successfully');
      } catch (error) {
        console.error('Failed to sync offline data:', error);
      }
    }
  };

  // Save data offline
  const saveOfflineRecord = (record) => {
    const updatedRecords = [...offlineRecords, { ...record, offline_id: Date.now().toString() }];
    setOfflineRecords(updatedRecords);
    localStorage.setItem('arogya_offline_records', JSON.stringify(updatedRecords));
  };

  // Language Selection Component
  const LanguageSelector = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ArogyaCircle</h1>
          <p className="text-gray-600 text-lg">{t('selectLanguage')}</p>
          <div className="text-sm text-gray-500 mt-2">Serving 600M+ Rural Indians</div>
        </div>

        <div className="space-y-4">
          {[
            { code: 'en', name: 'English', native: 'English', icon: '🇬🇧' },
            { code: 'hi', name: 'Hindi', native: 'हिंदी', icon: '🇮🇳' },
            { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', icon: '🇮🇳' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLanguage(lang.code);
                setCurrentView('phone-verify');
              }}
              className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">{lang.icon}</span>
                    {lang.native}
                  </div>
                  <div className="text-sm text-gray-600">{lang.name}</div>
                </div>
                <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="text-xs text-gray-500">Trusted by Rural Communities</div>
          <div className="flex justify-center mt-2 space-x-1">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="text-yellow-400">⭐</span>
            ))}
            <span className="text-xs text-gray-600 ml-2">4.9/5 Rating</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Phone Verification Component
  const PhoneVerification = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
      if (phone.length < 10) {
        showNotification('कृपया वैध फोन नंबर दर्ज करें', 'error');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const otp = generateOTP();
        setOtpCode(otp);
        setPhoneNumber(phone);
        setShowOTP(true);
        setLoading(false);
        showNotification(`OTP sent to +91-${phone}: ${otp}`, 'success');
      }, 2000);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">{t('verifyPhone')}</h1>
            <p className="text-gray-600">We'll send you an OTP to verify your number</p>
          </div>

          {!showOTP ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('phoneNumber')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-gray-500">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                    placeholder="9876543210"
                    maxLength="10"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-small mr-2"></div>
                    Sending OTP...
                  </div>
                ) : 'Send OTP'}
              </button>
            </div>
          ) : (
            <OTPVerification />
          )}
        </div>
      </div>
    );
  };

  // OTP Verification Component
  const OTPVerification = () => {
    const [enteredOTP, setEnteredOTP] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyOTP = () => {
      if (enteredOTP === otpCode) {
        setLoading(true);
        setTimeout(() => {
          setShowOTP(false);
          setCurrentView('registration');
          setLoading(false);
          showNotification('Phone verified successfully!', 'success');
        }, 1500);
      } else {
        showNotification('Invalid OTP. Please try again.', 'error');
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            OTP sent to +91-{phoneNumber}
          </p>
          <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700">
            Demo OTP: <span className="font-bold text-blue-600">{otpCode}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('enterOTP')}
          </label>
          <input
            type="text"
            value={enteredOTP}
            onChange={(e) => setEnteredOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg text-center tracking-widest"
            placeholder="123456"
            maxLength="6"
          />
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={loading || enteredOTP.length < 6}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner-small mr-2"></div>
              Verifying...
            </div>
          ) : t('verify')}
        </button>

        <button
          onClick={() => {
            const newOTP = generateOTP();
            setOtpCode(newOTP);
            showNotification(`New OTP: ${newOTP}`, 'info');
          }}
          className="w-full text-blue-600 font-semibold py-2"
        >
          {t('resendOTP')}
        </button>
      </div>
    );
  };

  // Enhanced User Registration Component
  const UserRegistration = () => {
    const [formData, setFormData] = useState({
      name: '',
      phone: phoneNumber,
      village: '',
      role: 'patient',
      language: currentLanguage,
      age: '',
      gender: '',
      emergency_contact: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(`${API}/users`, formData);
        setCurrentUser(response.data);
        localStorage.setItem('arogya_user', JSON.stringify(response.data));
        setCurrentView('home');
        showNotification('Welcome to ArogyaCircle!', 'success');
      } catch (error) {
        console.error('Registration failed:', error);
        // Offline fallback
        const offlineUser = { ...formData, id: Date.now().toString() };
        setCurrentUser(offlineUser);
        localStorage.setItem('arogya_user', JSON.stringify(offlineUser));
        setCurrentView('home');
        showNotification('Registered offline. Will sync when online.', 'warning');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600 mb-2">{t('appName')}</h1>
            <p className="text-gray-600">{t('tagline')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('yourName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  placeholder={t('yourName')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  placeholder="25"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                disabled
                className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('village')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({...formData, village: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  placeholder={t('village')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                placeholder="+91-9876543210"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
            >
              {t('register')}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Draggable Emergency Button Component
  const DraggableEmergencyButton = () => {
    const buttonRef = useRef(null);
    const [position, setPosition] = useState({ top: 16, right: 16 });
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e) => {
      setIsDragging(true);
      const event = e.touches ? e.touches[0] : e;
      const initialX = event.clientX;
      const initialY = event.clientY;
      const { top, right } = buttonRef.current.getBoundingClientRect();

      const handleDragMove = (moveEvent) => {
        const move = moveEvent.touches ? moveEvent.touches[0] : moveEvent;
        const dx = move.clientX - initialX;
        const dy = move.clientY - initialY;

        // Convert right position to left for easier calculation
        const initialLeft = window.innerWidth - right - buttonRef.current.offsetWidth;

        setPosition({
          top: top + dy,
          // Calculate new right based on change from initial left
          right: window.innerWidth - (initialLeft + dx) - buttonRef.current.offsetWidth
        });
      };

      const handleDragEnd = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };

      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    };

    const handleEmergencyCall = () => {
      // Prevent call if button was just dragged
      if (isDragging) return;
      window.location.href = 'tel:102';
    };

    return (
      <button
        ref={buttonRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleEmergencyCall}
        style={{
          top: `calc(env(safe-area-inset-top) + ${position.top}px)`,
          right: `${position.right}px`,
          position: 'fixed',
          touchAction: 'none' // Prevents page scroll while dragging
        }}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full shadow-2xl z-50 emergency-pulse text-sm"
      >
        🚨 {t('emergencyButton')}
      </button>
    );
  };

  // Enhanced Home Dashboard Component
  const HomeDashboard = () => {
    const features = [
      {
        icon: '🩺',
        title: t('checkSymptoms'),
        description: 'AI-powered health assessment',
        action: () => setCurrentView('symptoms'),
        color: 'from-blue-500 to-blue-600',
        bgColor: 'from-blue-50 to-blue-100'
      },
      {
        icon: '💊',
        title: t('findMedicines'),
        description: 'Real-time pharmacy stock',
        action: () => setCurrentView('pharmacy'),
        color: 'from-purple-500 to-purple-600',
        bgColor: 'from-purple-50 to-purple-100'
      },
      {
        icon: '👨‍⚕️',
        title: t('bookConsultation'),
        description: 'Video calls with doctors',
        action: () => setCurrentView('consultation'),
        color: 'from-green-500 to-green-600',
        bgColor: 'from-green-50 to-green-100'
      },
      {
        icon: '📋',
        title: t('viewRecords'),
        description: 'Digital health records',
        action: () => setCurrentView('records'),
        color: 'from-orange-500 to-orange-600',
        bgColor: 'from-orange-50 to-orange-100'
      },
      {
        icon: '🏥',
        title: t('nearbyHospitals'),
        description: 'Emergency healthcare centers',
        action: () => setCurrentView('hospitals'),
        color: 'from-red-500 to-red-600',
        bgColor: 'from-red-50 to-red-100'
      },
      {
        icon: '📊',
        title: t('labReports'),
        description: 'Test results & analysis',
        action: () => setCurrentView('reports'),
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'from-indigo-50 to-indigo-100'
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-6 rounded-b-3xl shadow-lg" style={{paddingTop: 'calc(env(safe-area-inset-top) + 48px)'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">नमस्ते, {currentUser?.name}</h1>
                <p className="text-green-100 text-sm">
                  {currentUser?.village} • {currentUser?.age} years
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center text-sm ${isOnline ? 'text-green-100' : 'text-yellow-100'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-300' : 'bg-yellow-300'}`}></div>
                {isOnline ? t('online') : t('offline')}
              </div>
              <div className="text-xs text-green-200 mt-1">
                {currentLanguage.toUpperCase()} • Rural Healthcare
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{healthRecords.length}</div>
              <div className="text-xs text-green-100">Health Records</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{SAMPLE_DATA.doctors.filter(d => d.available).length}</div>
              <div className="text-xs text-green-100">Doctors Online</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{SAMPLE_DATA.medicines.filter(m => m.stock > 0).length}</div>
              <div className="text-xs text-green-100">Medicines Available</div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🔔</span>
            Recent Updates
          </h3>
          <div className="space-y-2">
            {notifications.slice(0, 2).map((notification) => (
              <div key={notification.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-400">
                <p className="text-sm text-gray-700">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Healthcare Services</h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={feature.action}
                className={`bg-gradient-to-br ${feature.bgColor} rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center text-2xl shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{feature.title}</h3>
                    <p className="text-gray-600 text-xs mt-1">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">{t('availableDoctors')}</h2>
            <button
              onClick={() => setCurrentView('consultation')}
              className="text-green-600 text-sm font-semibold"
            >
              {t('viewAll')} →
            </button>
          </div>
          <div className="space-y-3">
            {SAMPLE_DATA.doctors.filter(d => d.available).slice(0, 2).map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{doctor.name.charAt(3)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-xs text-gray-600 ml-1">{doctor.rating}</span>
                        <span className="w-2 h-2 bg-green-400 rounded-full ml-2"></span>
                        <span className="text-xs text-green-600 ml-1">Available</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('consultation')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    {t('bookNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('todaysTips')}</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">💡</span>
              <div>
                <h3 className="font-bold text-gray-800">Stay Hydrated</h3>
                <p className="text-gray-600 text-sm mt-1">Drink at least 8 glasses of clean water daily to maintain good health and prevent dehydration.</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Health Tip</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Symptom Checker with more features
  const SymptomChecker = ({ assessment, setAssessment }) => {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const resultsRef = useRef(null);

    useEffect(() => {
      if (assessment && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [assessment]);

    const commonSymptoms = [
      'Fever', 'Headache', 'Cough', 'Sore throat', 'Body ache',
      'Stomach pain', 'Nausea', 'Dizziness', 'Chest pain', 'Difficulty breathing',
      'Fatigue', 'Loss of appetite', 'Runny nose', 'Muscle pain', 'Joint pain',
      'Skin rash', 'Vomiting', 'Diarrhea', 'Constipation', 'Sleep problems'
    ];

    const handleSymptomCheck = async () => {
      if (selectedSymptoms.length === 0) return;

      setLoading(true);
      const severityLevel = selectedSymptoms.some(s =>
        ['chest pain', 'difficulty breathing', 'severe bleeding'].includes(s.toLowerCase())
      ) ? 'emergency' : selectedSymptoms.some(s =>
        ['fever', 'headache', 'body ache'].includes(s.toLowerCase())
      ) ? 'medium' : 'low';

      const localAssessment = {
        assessment: `Based on your symptoms (${selectedSymptoms.join(', ')}), our initial advice is to consult with a healthcare provider. ${additionalInfo ? 'Additional notes: ' + additionalInfo : ''}`,
        severity: severityLevel,
        recommendations: [
          'Consult with the nearest healthcare provider for an accurate diagnosis.',
          'Carefully monitor your symptoms for any changes.',
          'Ensure you get adequate rest and stay hydrated.',
          severityLevel === 'emergency' ? 'This could be serious. Seek immediate medical attention.' : 'Avoid self-medication without a doctor\'s advice.'
        ].filter(Boolean),
        referral_needed: true
      };

      setTimeout(() => {
        setAssessment(localAssessment);
        showNotification('Symptom assessment completed', 'success');
        setLoading(false);
      }, 600);
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6" style={{paddingTop: 'calc(env(safe-area-inset-top) + 48px)'}}>
          <div className="flex items-center space-x-4">
            <button onClick={() => { setAssessment(null); setCurrentView('home'); }} className="text-white hover:text-blue-200">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">{t('symptoms')}</h1>
              <p className="text-blue-100 text-sm">AI-powered health assessment</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🩺</span>
              Select Your Symptoms
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {commonSymptoms.map((symptom, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (selectedSymptoms.includes(symptom)) {
                      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
                    } else {
                      setSelectedSymptoms([...selectedSymptoms, symptom]);
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                    selectedSymptoms.includes(symptom)
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                rows="3"
                placeholder="Duration, severity, triggers, etc."
              />
            </div>

            <button
              onClick={handleSymptomCheck}
              disabled={selectedSymptoms.length === 0 || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner-small mr-2"></div>
                  Analyzing Symptoms...
                </div>
              ) : 'Check Symptoms'}
            </button>
          </div>

          {assessment && (
            <div ref={resultsRef} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Assessment Results
              </h2>

              <div className={`p-4 rounded-lg mb-4 border-l-4 ${
                assessment.severity === 'emergency' ? 'bg-red-50 border-red-500' :
                assessment.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                assessment.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-center mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    assessment.severity === 'emergency' ? 'bg-red-100 text-red-800' :
                    assessment.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    assessment.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {assessment.severity?.toUpperCase()} PRIORITY
                  </span>
                </div>
                <p className="text-gray-700">{assessment.assessment}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Recommendations:
                </h3>
                <ul className="space-y-2">
                  {assessment.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-3">
                {assessment.referral_needed && (
                  <button
                    onClick={() => setCurrentView('consultation')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:from-green-600 hover:to-emerald-700"
                  >
                    Book Consultation
                  </button>
                )}
                <button
                  onClick={() => setCurrentView('hospitals')}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:from-red-600 hover:to-red-700"
                >
                  Find Hospital
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Pharmacy View
  const PharmacyView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);

    const categories = ['All', 'General', 'Antibiotic', 'Diabetes', 'Cardiology', 'Allergy', 'Gastric'];

    const filteredMedicines = SAMPLE_DATA.medicines.filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || medicine.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const addToCart = (medicine) => {
      const existing = cart.find(item => item.name === medicine.name);
      if (existing) {
        setCart(cart.map(item =>
          item.name === medicine.name
            ? {...item, quantity: item.quantity + 1}
            : item
        ));
      } else {
        setCart([...cart, {...medicine, quantity: 1}]);
      }
      showNotification(`${medicine.name} added to booking`, 'success');
    };

    const handleBookMedicines = async () => {
      if (cart.length === 0) return;

      try {
        const response = await axios.post(`${API}/medicine-requests`, {
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_phone: currentUser.phone,
          medicines: cart,
          pharmacy_id: 'civil_hospital_pharmacy'
        });
        setCart([]);
        showNotification('Medicine booking confirmed! SMS sent to your phone.', 'success');
      } catch (error) {
        console.error('Medicine booking failed:', error);
        showNotification('Booking saved offline. Will process when online.', 'warning');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6" style={{paddingTop: 'calc(env(safe-area-inset-top) + 48px)'}}>
          <div className="flex items-center space-x-4 mb-4">
            <button onClick={() => setCurrentView('home')} className="text-white hover:text-purple-200">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">{t('pharmacy')}</h1>
              <p className="text-purple-100 text-sm">Real-time medicine availability</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg text-gray-800 pl-10"
              placeholder="Search medicines..."
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {filteredMedicines.map((medicine, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-400">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{medicine.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        medicine.stock > 50 ? 'bg-green-100 text-green-800' :
                        medicine.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
                        medicine.stock > 0 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {medicine.stock > 0 ? `${medicine.stock} available` : 'Out of stock'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{medicine.uses}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-purple-600">₹{medicine.price}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {medicine.category}
                        </span>
                      </div>
                      {medicine.stock > 0 && (
                        <button
                          onClick={() => addToCart(medicine)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-t-4 border-green-400">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🛒</span>
                Your Medicine Booking ({cart.length} items)
              </h3>
              <div className="space-y-3 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mb-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-purple-600">
                    ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleBookMedicines}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200"
              >
                Book Medicines & Get SMS Confirmation
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Hospitals View
  const HospitalsView = () => {
    const openDirections = (hospital) => {
      const destination = encodeURIComponent(hospital.name);
      const openWithOrigin = (origin) => {
        const url = `https://maps.google.com/?q=${destination}`;
        window.open(url, '_blank');
      };
      openWithOrigin('');
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6" style={{paddingTop: 'calc(env(safe-area-inset-top) + 48px)'}}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentView('home')} className="text-white hover:text-red-200">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">{t('nearbyHospitals')}</h1>
              <p className="text-red-100 text-sm">Emergency healthcare centers</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {SAMPLE_DATA.hospitals.map((hospital, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{hospital.name}</h3>
                      {hospital.emergency && (
                        <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                          24/7 Emergency
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600 mb-3">
                      <span className="mr-2">📍</span>
                      <span className="text-sm">{hospital.distance} away</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a
                        href={`tel:${hospital.phone}`}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        📞 Call Now
                      </a>
                      <button
                        onClick={() => openDirections(hospital)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        🗺️ Directions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Navigation Bar Component
  const NavigationBar = () => {
    const navItems = [
      { id: 'home', icon: '🏠', label: t('home') },
      { id: 'symptoms', icon: '🩺', label: t('symptoms') },
      { id: 'consultation', icon: '👨‍⚕️', label: t('consultation') },
      { id: 'pharmacy', icon: '💊', label: t('pharmacy') },
      { id: 'records', icon: '📋', label: t('records') }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-lg">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                currentView === item.id
                  ? 'text-green-600 bg-green-50 transform scale-105'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Voice Button with enhanced functionality
  const VoiceButton = ({ assessment }) => (
    <button
      onClick={() => {
        let message;
        if (currentView === 'symptoms' && assessment) {
          message = `Assessment Result: ${assessment.assessment}. Recommendations: ${assessment.recommendations.join('. ')}`;
        } else {
          message = `${t('appName')} - ${t('tagline')}. Current page: ${currentView}`;
        }

        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'pa' ? 'pa-IN' : 'en-IN';
          speechSynthesis.cancel(); // Cancel any previous speech
          speechSynthesis.speak(utterance);
        }
      }}
      className="fixed bottom-24 right-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg z-40 transform hover:scale-110 transition-all duration-200"
    >
      🔊
    </button>
  );

  // Notification Display Component
  const NotificationDisplay = () => (
    <div className="fixed top-0 right-4 z-50 space-y-2" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-white' :
            notification.type === 'medicine' ? 'bg-blue-500 text-white' :
            notification.type === 'appointment' ? 'bg-purple-500 text-white' :
            notification.type === 'health' ? 'bg-teal-500 text-white' :
            'bg-gray-800 text-white'
          }`}
        >
          <p className="text-sm font-medium">{notification.message}</p>
          <p className="text-xs opacity-80 mt-1">{notification.time}</p>
        </div>
      ))}
    </div>
  );

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      <div className="App">
        <NotificationDisplay />

        {!currentUser ? (
          currentView === 'phone-verify' ? <PhoneVerification /> :
          currentView === 'registration' ? <UserRegistration /> :
          <LanguageSelector />
        ) : (
          <>
            <DraggableEmergencyButton />
            <VoiceButton assessment={symptomAssessment} />

            {currentView === 'home' && <HomeDashboard />}
            {currentView === 'symptoms' && <SymptomChecker assessment={symptomAssessment} setAssessment={setSymptomAssessment} />}
            {currentView === 'pharmacy' && <PharmacyView />}
            {currentView === 'hospitals' && <HospitalsView />}
            {currentView === 'consultation' && <div className="p-6 text-center" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 96px)' }}>
              <h2 className="text-2xl font-bold mb-4">Video Consultation</h2>
              <p>Feature under development for hackathon demo</p>
            </div>}
            {currentView === 'records' && <div className="p-6 text-center" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 96px)' }}>
              <h2 className="text-2xl font-bold mb-4">Health Records</h2>
              <div className="space-y-4">
                {healthRecords.map((record, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold">{record.title}</h3>
                    <p className="text-sm text-gray-600">{record.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>}
            
            <NavigationBar />
          </>
        )}
      </div>
    </LanguageContext.Provider>
  );
}

export default App;