# ArogyaCircle: AI-Powered Rural Healthcare Companion 🩺

ArogyaCircle is a mobile-first healthcare application prototype designed to bridge the healthcare accessibility gap in rural communities. By leveraging AI and providing a suite of essential services, it aims to empower individuals with the tools they need for better health management.

<p align="center">
  <img src="../screenshots/arogya_circle.jpg" width="200" alt="Home">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="../screenshots/services.jpg" width="200" alt="Services">
</p>

---

## 🎯 The Problem

In many rural areas, access to timely medical advice, pharmacies with available stock, and emergency services is a significant challenge. This digital divide can lead to delayed treatment and poorer health outcomes. ArogyaCircle is designed to be a reliable first point of contact for non-critical health queries and a vital tool during emergencies.

## 💡 Our Solution

ArogyaCircle provides an intuitive, easy-to-navigate platform that offers:
* **Instant preliminary health assessment** through an AI-powered symptom checker.

<p align="center">
  <img src="../screenshots/symptom_checker.jpg" width="200" alt="AI-powered symptom checker">
</p>

* **Real-time information** on medicine availability and nearby medical facilities.

<p align="center">
  <img src="../screenshots/medicine.jpg" width="200" alt="Real-time medicine availability">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="../screenshots/nearby_hospitals.jpg" width="200" alt="Nearby Hospitals">
</p>

* **A centralized hub** for managing digital health records and accessing medical professionals.

<p align="center">
  <img src="../screenshots/health_records.jpg" width="200" alt="Health records">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="../screenshots/doctors-tips.jpg" width="200" alt="Available Doctors">
</p>

---

## ✨ Features In-Depth

* **🤖 AI-Powered Symptom Checker**
    * Select from a comprehensive list of common symptoms.
    * Receive an AI-generated assessment indicating potential severity (Low, Medium, High).
    * Get clear recommendations for next steps.
    * **Disclaimer**: This feature provides a preliminary assessment and is not a substitute for professional medical diagnosis.

* **🚑 Emergency Services**
    * **Nearby Hospitals**: View a list of local hospitals, sorted by distance.
    * **One-Tap Actions**: Call the hospital directly or get driving directions via Google Maps.
    * **24/7 Availability**: See which hospitals offer emergency services around the clock.

* **💊 Pharmacy Locator**
    * Search for medicines and view their real-time stock availability.
    * Filter medicines by category (General, Antibiotic, Diabetes, etc.).
    * Add required medicines to a cart for easy tracking.

* **🧑‍⚕️ Consultation & Health Records**
    * **Available Doctors**: View a list of doctors, their specialization, rating, and availability. (Booking is a prototype feature).
    * **Health Records**: Securely access your digital health history, including past treatments, lab reports, and check-ups.

---

## 🛠️ Tech Stack & Architecture

This project uses a modern client-server architecture.

#### **Frontend (Client)**
* **Framework**: [React.js](https://reactjs.org/)
* **Mobile Wrapper**: [Capacitor](https://capacitorjs.com/) (to build the native Android app)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
* **Package Manager**: [Yarn](https://yarnpkg.com/)

#### **Backend (Server)**
* **Language**: [Python](https://www.python.org/)
* **Dependencies**: Managed via `requirements.txt`

---

## 🚀 Getting Started

To get this project running on your local machine, follow these steps.

### **Prerequisites**
* Node.js (v18 or higher) & Yarn
* Python (v3.8 or higher) & Pip
* Android Studio & configured Android Emulator/Device

### **1. Clone the Repository**
```sh
git clone https://github.com/wakodepranav2005-git/telemedicine.git
cd telemedicine
```

### **2. Backend Setup**
```sh
cd backend
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run the backend server (typically on port 5000)
python server.py
```

### **3. Frontend Setup**
```sh
cd frontend

# Install dependencies
yarn install

# Run the React development server (typically on port 3000)
yarn start
```

### **4. Running on Android**
```sh
# In the /frontend directory
# Sync your web code with the native Android project
npx capacitor sync

# Open the Android project in Android Studio
npx capacitor open android
```
Once Android Studio is open, wait for Gradle to sync, then run the app on your selected emulator or physical device.

---

## 🗺️ Future Roadmap

This is a prototype, but here are some features planned for the future:
- [ ] **Video Consultation**: Implement live video calls with doctors.
- [ ] **Voice-Guided Navigation**: Complete the screen reader functionality for enhanced accessibility.
- [ ] **Multi-Language Support**: Add support for local languages.
- [ ] **Push Notifications**: Send reminders for appointments and medicine.
- [ ] **iOS Version**: Build and deploy an iOS version of the app.