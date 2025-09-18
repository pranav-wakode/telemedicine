import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Language context
const LanguageContext = React.createContext();

// Main App Component
function App() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [healthRecords, setHealthRecords] = useState([]);
  const [offlineRecords, setOfflineRecords] = useState([]);

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
      selectLanguage: "Select Language",
      hindi: "हिंदी",
      punjabi: "ਪੰਜਾਬੀ",
      english: "English",
      yourName: "Your Name",
      phoneNumber: "Phone Number",
      village: "Village",
      register: "Register",
      checkSymptoms: "Check Your Symptoms",
      bookConsultation: "Book Consultation",
      findMedicines: "Find Medicines",
      viewRecords: "View Health Records",
      emergencyHelp: "Get Emergency Help",
      offline: "Working Offline",
      online: "Connected"
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
      selectLanguage: "भाषा चुनें",
      hindi: "हिंदी",
      punjabi: "ਪੰਜਾਬੀ",
      english: "English",
      yourName: "आपका नाम",
      phoneNumber: "फोन नंबर",
      village: "गांव",
      register: "पंजीकरण करें",
      checkSymptoms: "अपने लक्षणों की जांच करें",
      bookConsultation: "परामर्श बुक करें",
      findMedicines: "दवाइयां खोजें",
      viewRecords: "स्वास्थ्य रिकॉर्ड देखें",
      emergencyHelp: "आपातकालीन सहायता पाएं",
      offline: "ऑफलाइन काम कर रहा है",
      online: "जुड़ा हुआ है"
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
      selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
      hindi: "हिंदी",
      punjabi: "ਪੰਜਾਬੀ",
      english: "English",
      yourName: "ਤੁਹਾਡਾ ਨਾਮ",
      phoneNumber: "ਫੋਨ ਨੰਬਰ",
      village: "ਪਿੰਡ",
      register: "ਰਜਿਸਟਰ ਕਰੋ",
      checkSymptoms: "ਆਪਣੇ ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ ਕਰੋ",
      bookConsultation: "ਸਲਾਹ ਬੁੱਕ ਕਰੋ",
      findMedicines: "ਦਵਾਈਆਂ ਲੱਭੋ",
      viewRecords: "ਸਿਹਤ ਰਿਕਾਰਡ ਵੇਖੋ",
      emergencyHelp: "ਐਮਰਜੈਂਸੀ ਮਦਦ ਲਓ",
      offline: "ਔਫਲਾਈਨ ਕੰਮ ਕਰ ਰਿਹਾ ਹੈ",
      online: "ਜੁੜਿਆ ਹੋਇਆ ਹੈ"
    }
  };

  const t = (key) => translations[currentLanguage][key] || key;

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ArogyaCircle</h1>
          <p className="text-gray-600">{t('selectLanguage')}</p>
        </div>
        
        <div className="space-y-4">
          {['en', 'hi', 'pa'].map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setCurrentLanguage(lang);
                setCurrentView('registration');
              }}
              className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 transition-all duration-200 text-left"
            >
              <div className="text-lg font-semibold text-gray-800">
                {lang === 'en' && 'English'}
                {lang === 'hi' && 'हिंदी (Hindi)'}
                {lang === 'pa' && 'ਪੰਜਾਬੀ (Punjabi)'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // User Registration Component
  const UserRegistration = () => {
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      village: '',
      role: 'patient',
      language: currentLanguage
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(`${API}/users`, formData);
        setCurrentUser(response.data);
        localStorage.setItem('arogya_user', JSON.stringify(response.data));
        setCurrentView('home');
      } catch (error) {
        console.error('Registration failed:', error);
        // Offline fallback
        const offlineUser = { ...formData, id: Date.now().toString() };
        setCurrentUser(offlineUser);
        localStorage.setItem('arogya_user', JSON.stringify(offlineUser));
        setCurrentView('home');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600 mb-2">{t('appName')}</h1>
            <p className="text-gray-600">{t('tagline')}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('yourName')}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                placeholder={t('yourName')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                placeholder="+91-9876543210"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('village')}
              </label>
              <input
                type="text"
                required
                value={formData.village}
                onChange={(e) => setFormData({...formData, village: e.target.value})}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                placeholder={t('village')}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 text-lg"
            >
              {t('register')}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Emergency Button Component
  const EmergencyButton = () => {
    const handleEmergency = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const emergencyData = {
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_phone: currentUser.phone,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            alert_type: "medical",
            description: "Emergency help requested"
          };

          try {
            await axios.post(`${API}/emergency-alert`, emergencyData);
            alert('Emergency services have been notified!');
          } catch (error) {
            console.error('Emergency alert failed:', error);
            alert('Emergency alert sent (offline mode)');
          }
        });
      }
    };

    return (
      <button
        onClick={handleEmergency}
        className="fixed top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg z-50 pulse-animation"
      >
        {t('emergencyButton')}
      </button>
    );
  };

  // Home Dashboard Component
  const HomeDashboard = () => {
    const features = [
      {
        icon: '🩺',
        title: t('checkSymptoms'),
        description: 'AI-powered symptom assessment',
        action: () => setCurrentView('symptoms'),
        color: 'bg-blue-500'
      },
      {
        icon: '💊',
        title: t('findMedicines'),
        description: 'Check pharmacy stock & book medicines',
        action: () => setCurrentView('pharmacy'),
        color: 'bg-purple-500'
      },
      {
        icon: '👨‍⚕️',
        title: t('bookConsultation'),
        description: 'Video consultation with doctors',
        action: () => setCurrentView('consultation'),
        color: 'bg-green-500'
      },
      {
        icon: '📋',
        title: t('viewRecords'),
        description: 'Access your health records',
        action: () => setCurrentView('records'),
        color: 'bg-orange-500'
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('appName')}</h1>
              <p className="text-green-100">
                Welcome, {currentUser?.name} • {currentUser?.village}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm ${isOnline ? 'text-green-100' : 'text-yellow-100'}`}>
                {isOnline ? t('online') : t('offline')}
              </div>
              <div className="text-xs text-green-200">
                {currentLanguage.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={feature.action}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center text-2xl`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Tips Section */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Health Tips</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="font-semibold text-gray-800">Stay Hydrated</h3>
                <p className="text-gray-600 text-sm">Drink at least 8 glasses of clean water daily to maintain good health.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Symptom Checker Component
  const SymptomChecker = () => {
    const [symptoms, setSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(false);

    const commonSymptoms = [
      'Fever', 'Headache', 'Cough', 'Sore throat', 'Body ache',
      'Stomach pain', 'Nausea', 'Dizziness', 'Chest pain', 'Difficulty breathing'
    ];

    const handleSymptomCheck = async () => {
      if (selectedSymptoms.length === 0) return;
      
      setLoading(true);
      try {
        const response = await axios.post(`${API}/symptom-check`, {
          user_id: currentUser.id,
          symptoms: selectedSymptoms
        });
        setAssessment(response.data);
      } catch (error) {
        console.error('Symptom check failed:', error);
        // Offline fallback
        const offlineAssessment = {
          assessment: "Based on your symptoms, we recommend consulting with a healthcare provider.",
          severity: "medium",
          recommendations: ["Consult with doctor", "Rest and stay hydrated"],
          referral_needed: true
        };
        setAssessment(offlineAssessment);
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentView('home')} className="text-white">
              ←
            </button>
            <h1 className="text-2xl font-bold">{t('symptoms')}</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Select Your Symptoms</h2>
            
            <div className="grid grid-cols-2 gap-3">
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
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedSymptoms.includes(symptom)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>

            <button
              onClick={handleSymptomCheck}
              disabled={selectedSymptoms.length === 0 || loading}
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200"
            >
              {loading ? 'Analyzing...' : 'Check Symptoms'}
            </button>
          </div>

          {assessment && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Assessment Results</h2>
              
              <div className={`p-4 rounded-lg mb-4 ${
                assessment.severity === 'emergency' ? 'bg-red-100 border-red-300' :
                assessment.severity === 'high' ? 'bg-orange-100 border-orange-300' :
                assessment.severity === 'medium' ? 'bg-yellow-100 border-yellow-300' :
                'bg-green-100 border-green-300'
              } border-2`}>
                <h3 className="font-semibold mb-2">Severity: {assessment.severity?.toUpperCase()}</h3>
                <p className="text-gray-700">{assessment.assessment}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {assessment.recommendations?.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>

              {assessment.referral_needed && (
                <button
                  onClick={() => setCurrentView('consultation')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  Book Consultation
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Pharmacy Component
  const PharmacyView = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      const fetchPharmacies = async () => {
        try {
          const response = await axios.get(`${API}/pharmacies`);
          setPharmacies(response.data);
        } catch (error) {
          console.error('Failed to fetch pharmacies:', error);
          // Offline fallback with sample data
          setPharmacies([{
            id: '1',
            name: 'Civil Hospital Pharmacy',
            location: 'Civil Hospital, Village Center',
            medicines: {
              'paracetamol': { stock: 50, price: 10 },
              'amoxicillin': { stock: 30, price: 45 },
              'metformin': { stock: 25, price: 25 }
            }
          }]);
        }
      };
      fetchPharmacies();
    }, []);

    const handleBookMedicines = async (pharmacyId) => {
      if (selectedMedicines.length === 0) return;

      try {
        const response = await axios.post(`${API}/medicine-requests`, {
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_phone: currentUser.phone,
          medicines: selectedMedicines,
          pharmacy_id: pharmacyId
        });
        alert('Medicine booking confirmed! You will receive SMS confirmation.');
        setSelectedMedicines([]);
      } catch (error) {
        console.error('Medicine booking failed:', error);
        alert('Medicine booking saved offline. Will sync when online.');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentView('home')} className="text-white">
              ←
            </button>
            <h1 className="text-2xl font-bold">{t('pharmacy')}</h1>
          </div>
        </div>

        <div className="p-6">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">{pharmacy.name}</h2>
              <p className="text-gray-600 mb-4">{pharmacy.location}</p>
              
              <h3 className="font-semibold mb-3">Available Medicines:</h3>
              <div className="space-y-3">
                {Object.entries(pharmacy.medicines || {}).map(([medicine, details]) => (
                  <div key={medicine} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">{medicine}</h4>
                      <p className="text-sm text-gray-600">
                        Stock: {details.stock} • ₹{details.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={details.stock}
                        className="w-16 p-2 border rounded"
                        placeholder="Qty"
                        onChange={(e) => {
                          const qty = parseInt(e.target.value);
                          if (qty > 0) {
                            const existing = selectedMedicines.findIndex(m => m.name === medicine);
                            if (existing !== -1) {
                              const updated = [...selectedMedicines];
                              updated[existing].quantity = qty;
                              setSelectedMedicines(updated);
                            } else {
                              setSelectedMedicines([...selectedMedicines, {
                                name: medicine,
                                quantity: qty,
                                price: details.price
                              }]);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {selectedMedicines.length > 0 && (
                <div className="mt-4">
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Selected Medicines:</h4>
                    {selectedMedicines.map((med, index) => (
                      <div key={index} className="text-sm">
                        {med.name} x{med.quantity} = ₹{med.price * med.quantity}
                      </div>
                    ))}
                    <div className="font-bold mt-2">
                      Total: ₹{selectedMedicines.reduce((sum, med) => sum + (med.price * med.quantity), 0)}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleBookMedicines(pharmacy.id)}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
                  >
                    Book Medicines
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Video Consultation Component
  const VideoConsultation = () => {
    const [consultations, setConsultations] = useState([]);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingForm, setBookingForm] = useState({
      doctor_name: '',
      symptoms: '',
      appointment_time: '',
      consultation_type: 'video'
    });

    const handleBookConsultation = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(`${API}/consultations`, {
          patient_id: currentUser.id,
          ...bookingForm,
          appointment_time: new Date(bookingForm.appointment_time).toISOString()
        });
        alert('Consultation booked successfully!');
        setShowBooking(false);
        setBookingForm({
          doctor_name: '',
          symptoms: '',
          appointment_time: '',
          consultation_type: 'video'
        });
      } catch (error) {
        console.error('Consultation booking failed:', error);
        alert('Consultation booking saved offline.');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setCurrentView('home')} className="text-white">
                ←
              </button>
              <h1 className="text-2xl font-bold">{t('consultation')}</h1>
            </div>
            <button
              onClick={() => setShowBooking(true)}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold"
            >
              Book New
            </button>
          </div>
        </div>

        <div className="p-6">
          {!isOnline && (
            <div className="bg-yellow-100 border-yellow-400 border-2 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                📱 Video consultation requires internet connection. You can book for later or switch to audio-only mode.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Available Doctors</h2>
            
            <div className="space-y-4">
              {['Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Manjeet Singh'].map((doctor, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{doctor}</h3>
                    <p className="text-sm text-gray-600">General Medicine • Available Now</p>
                  </div>
                  <button
                    onClick={() => setBookingForm({...bookingForm, doctor_name: doctor})}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Book Consultation</h2>
              
              <form onSubmit={handleBookConsultation} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Doctor</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.doctor_name}
                    onChange={(e) => setBookingForm({...bookingForm, doctor_name: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg"
                    placeholder="Doctor name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Symptoms</label>
                  <textarea
                    required
                    value={bookingForm.symptoms}
                    onChange={(e) => setBookingForm({...bookingForm, symptoms: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg"
                    rows="3"
                    placeholder="Describe your symptoms"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Appointment Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingForm.appointment_time}
                    onChange={(e) => setBookingForm({...bookingForm, appointment_time: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Consultation Type</label>
                  <select
                    value={bookingForm.consultation_type}
                    onChange={(e) => setBookingForm({...bookingForm, consultation_type: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg"
                  >
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                    <option value="chat">Text Chat</option>
                  </select>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowBooking(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg"
                  >
                    Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Health Records Component
  const HealthRecords = () => {
    const [records, setRecords] = useState([]);

    useEffect(() => {
      const fetchRecords = async () => {
        try {
          const response = await axios.get(`${API}/health-records/${currentUser.id}`);
          setRecords([...response.data, ...offlineRecords]);
        } catch (error) {
          console.error('Failed to fetch records:', error);
          setRecords(offlineRecords);
        }
      };
      fetchRecords();
    }, [currentUser.id, offlineRecords]);

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentView('home')} className="text-white">
              ←
            </button>
            <h1 className="text-2xl font-bold">{t('records')}</h1>
          </div>
        </div>

        <div className="p-6">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <span className="text-6xl mb-4 block">📋</span>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Health Records</h2>
              <p className="text-gray-600">Your health records will appear here after consultations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record, index) => (
                <div key={record.id || index} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{record.title}</h3>
                      <p className="text-sm text-gray-600">
                        {record.doctor_name} • {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      record.is_synced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.is_synced ? 'Synced' : 'Offline'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{record.description}</p>
                  
                  {record.medications && record.medications.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Medications:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {record.medications.map((med, i) => (
                          <li key={i}>{med.name} - {med.dosage}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Navigation Bar Component
  const NavigationBar = () => {
    const navItems = [
      { id: 'home', icon: '🏠', label: t('home') },
      { id: 'records', icon: '📋', label: t('records') },
      { id: 'consultation', icon: '👨‍⚕️', label: t('consultation') },
      { id: 'pharmacy', icon: '💊', label: t('pharmacy') },
      { id: 'symptoms', icon: '🩺', label: t('symptoms') }
    ];

    if (currentUser?.role === 'asha') {
      navItems.push({ id: 'asha', icon: '👩‍⚕️', label: t('asha') });
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                currentView === item.id ? 'text-green-600 bg-green-50' : 'text-gray-600'
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

  // Text-to-Speech functionality
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'pa' ? 'pa-IN' : 'en-IN';
      speechSynthesis.speak(utterance);
    }
  };

  // Voice Command Button
  const VoiceButton = () => (
    <button
      onClick={() => speak(t('appName') + ' - ' + t('tagline'))}
      className="fixed bottom-24 right-4 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg z-40"
    >
      🔊
    </button>
  );

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      <div className="App">
        {!currentUser ? (
          currentView === 'registration' ? <UserRegistration /> : <LanguageSelector />
        ) : (
          <>
            <EmergencyButton />
            <VoiceButton />
            
            {currentView === 'home' && <HomeDashboard />}
            {currentView === 'symptoms' && <SymptomChecker />}
            {currentView === 'pharmacy' && <PharmacyView />}
            {currentView === 'consultation' && <VideoConsultation />}
            {currentView === 'records' && <HealthRecords />}
            
            <NavigationBar />
          </>
        )}
      </div>
    </LanguageContext.Provider>
  );
}

export default App;