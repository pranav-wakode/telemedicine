from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
# from emergentintegrations.llm.chat import LlmChat, UserMessage
import google.generativeai as genai
import json
import asyncio
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ArogyaCircle - Rural Healthcare Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# =============================================================================
# MODELS
# =============================================================================

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    village: str
    language: str = "en"
    role: str = "patient"  # patient, asha, doctor
    emergency_contact: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    phone: str
    village: str
    language: str = "en"
    role: str = "patient"
    emergency_contact: Optional[str] = None

class HealthRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # consultation, prescription, test_result, vitals
    title: str
    description: str
    doctor_name: Optional[str] = None
    medications: List[Dict[str, Any]] = []
    attachments: List[str] = []
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_synced: bool = True
    offline_id: Optional[str] = None

class HealthRecordCreate(BaseModel):
    user_id: str
    type: str
    title: str
    description: str
    doctor_name: Optional[str] = None
    medications: List[Dict[str, Any]] = []
    attachments: List[str] = []
    is_synced: bool = True
    offline_id: Optional[str] = None

class Pharmacy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    phone: str
    medicines: Dict[str, Dict[str, Any]] = {}  # medicine_name: {stock, price, expiry}
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MedicineRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_phone: str
    medicines: List[Dict[str, Any]]
    pharmacy_id: str
    status: str = "pending"  # pending, confirmed, ready, completed
    booking_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    pickup_date: Optional[datetime] = None

class MedicineRequestCreate(BaseModel):
    user_id: str
    user_name: str
    user_phone: str
    medicines: List[Dict[str, Any]]
    pharmacy_id: str

class Consultation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    doctor_id: Optional[str] = None
    doctor_name: str
    symptoms: str
    diagnosis: Optional[str] = None
    prescription: List[Dict[str, Any]] = []
    status: str = "scheduled"  # scheduled, ongoing, completed, cancelled
    appointment_time: datetime
    consultation_type: str = "video"  # video, audio, chat
    room_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConsultationCreate(BaseModel):
    patient_id: str
    doctor_name: str
    symptoms: str
    appointment_time: datetime
    consultation_type: str = "video"

class SymptomCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    symptoms: List[str]
    assessment: str
    severity: str  # low, medium, high, emergency
    recommendations: List[str]
    referral_needed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SymptomCheckCreate(BaseModel):
    user_id: str
    symptoms: List[str]
    additional_info: Optional[str] = None

class EmergencyAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_phone: str
    location: Dict[str, float]  # lat, lng
    alert_type: str = "medical"  # medical, accident
    description: Optional[str] = None
    status: str = "active"  # active, responded, resolved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    responders_notified: List[str] = []

class EmergencyAlertCreate(BaseModel):
    user_id: str
    user_name: str
    user_phone: str
    location: Dict[str, float]
    alert_type: str = "medical"
    description: Optional[str] = None

class ASHAVisit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asha_id: str
    patient_id: str
    patient_name: str
    visit_type: str  # routine, follow_up, emergency
    findings: str
    action_taken: str
    next_visit_date: Optional[datetime] = None
    vital_signs: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ASHAVisitCreate(BaseModel):
    asha_id: str
    patient_id: str
    patient_name: str
    visit_type: str
    findings: str
    action_taken: str
    next_visit_date: Optional[datetime] = None
    vital_signs: Dict[str, Any] = {}

# =============================================================================
# AUTHENTICATION & USERS
# =============================================================================

@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    """Create a new user (patient, ASHA worker, or doctor)"""
    user_dict = user.dict()
    user_obj = User(**user_dict)
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user details by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.get("/users", response_model=List[User])
async def get_users(role: Optional[str] = None, village: Optional[str] = None):
    """Get all users, optionally filtered by role or village"""
    query = {}
    if role:
        query["role"] = role
    if village:
        query["village"] = village
    
    users = await db.users.find(query).to_list(1000)
    return [User(**user) for user in users]

# =============================================================================
# HEALTH RECORDS (OFFLINE-FIRST EHR)
# =============================================================================

@api_router.post("/health-records", response_model=HealthRecord)
async def create_health_record(record: HealthRecordCreate):
    """Create a new health record with offline sync support"""
    record_dict = record.dict()
    record_obj = HealthRecord(**record_dict)
    await db.health_records.insert_one(record_obj.dict())
    return record_obj

@api_router.get("/health-records/{user_id}", response_model=List[HealthRecord])
async def get_user_health_records(user_id: str):
    """Get all health records for a user"""
    records = await db.health_records.find({"user_id": user_id}).sort("date", -1).to_list(1000)
    return [HealthRecord(**record) for record in records]

@api_router.post("/health-records/sync")
async def sync_offline_records(records: List[HealthRecordCreate]):
    """Sync offline health records to cloud"""
    synced_records = []
    for record_data in records:
        if record_data.offline_id:
            # Check if already synced
            existing = await db.health_records.find_one({"offline_id": record_data.offline_id})
            if not existing:
                record_dict = record_data.dict()
                record_obj = HealthRecord(**record_dict)
                await db.health_records.insert_one(record_obj.dict())
                synced_records.append(record_obj)
    
    return {"synced_count": len(synced_records), "records": synced_records}

# =============================================================================
# PHARMACY INVENTORY & BOOKING
# =============================================================================

@api_router.post("/pharmacies", response_model=Pharmacy)
async def create_pharmacy(pharmacy: Pharmacy):
    """Create or update pharmacy information"""
    await db.pharmacies.insert_one(pharmacy.dict())
    return pharmacy

@api_router.get("/pharmacies", response_model=List[Pharmacy])
async def get_pharmacies():
    """Get all pharmacies with current inventory"""
    pharmacies = await db.pharmacies.find().to_list(100)
    return [Pharmacy(**pharmacy) for pharmacy in pharmacies]

@api_router.get("/pharmacies/{pharmacy_id}/medicines/{medicine_name}")
async def check_medicine_availability(pharmacy_id: str, medicine_name: str):
    """Check if a specific medicine is available at a pharmacy"""
    pharmacy = await db.pharmacies.find_one({"id": pharmacy_id})
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")
    
    medicine = pharmacy.get("medicines", {}).get(medicine_name.lower())
    if not medicine:
        return {"available": False, "stock": 0}
    
    return {"available": medicine["stock"] > 0, **medicine}

@api_router.post("/medicine-requests", response_model=MedicineRequest)
async def book_medicines(request: MedicineRequestCreate, background_tasks: BackgroundTasks):
    """Book medicines at a pharmacy"""
    request_dict = request.dict()
    request_obj = MedicineRequest(**request_dict)
    await db.medicine_requests.insert_one(request_obj.dict())
    
    # Simulate SMS notification (you would integrate with a real SMS service)
    background_tasks.add_task(send_sms_notification, request_obj.user_phone, 
                            f"Medicine booking confirmed. Booking ID: {request_obj.id[:8]}")
    
    return request_obj

@api_router.get("/medicine-requests/{user_id}", response_model=List[MedicineRequest])
async def get_user_medicine_requests(user_id: str):
    """Get all medicine requests for a user"""
    requests = await db.medicine_requests.find({"user_id": user_id}).sort("booking_date", -1).to_list(100)
    return [MedicineRequest(**req) for req in requests]

# =============================================================================
# AI SYMPTOM CHECKER
# =============================================================================

@api_router.post("/symptom-check", response_model=SymptomCheck)
async def perform_symptom_check(symptom_data: SymptomCheckCreate):
    """AI-powered symptom assessment optimized for rural healthcare"""
    try:
        # 1. Configure the API key from your .env file
        api_key = os.environ.get("GOOGLE_API_KEY") # Or use "EMERGENT_LLM_KEY" if you didn't rename it
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service API key not configured")
        genai.configure(api_key=api_key)

        # 2. Define the system prompt for the AI model
        system_prompt = """You are a medical AI assistant specialized in rural healthcare in India.
        Provide symptom assessment focused on common rural health issues. Always recommend consulting
        with a doctor for serious symptoms. Be culturally sensitive and use simple language.
        Respond in JSON format with: assessment, severity (low/medium/high/emergency),
        recommendations (list), and referral_needed (boolean)."""

        # 3. Initialize the model with the system prompt
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            system_instruction=system_prompt
        )

        symptoms_text = ", ".join(symptom_data.symptoms)
        additional_info = symptom_data.additional_info or ""
        user_prompt = f"Patient symptoms: {symptoms_text}. Additional information: {additional_info}. Please provide a medical assessment suitable for rural healthcare context."

        # 4. Send the prompt asynchronously and get the response
        response = await model.generate_content_async(user_prompt)

        # 5. Parse the AI response text
        try:
            # The response now includes formatting, so we clean it
            cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
            ai_result = json.loads(cleaned_response)
        except Exception as json_error:
            # Fallback if JSON parsing fails
            ai_result = {
                "assessment": response.text[:500],
                "severity": "medium",
                "recommendations": ["Consult with healthcare provider", "Monitor symptoms"],
                "referral_needed": True
            }

        # Create symptom check record
        symptom_check = SymptomCheck(
            user_id=symptom_data.user_id,
            symptoms=symptom_data.symptoms,
            assessment=ai_result.get("assessment", "Assessment completed"),
            severity=ai_result.get("severity", "medium"),
            recommendations=ai_result.get("recommendations", []),
            referral_needed=ai_result.get("referral_needed", True)
        )

        await db.symptom_checks.insert_one(symptom_check.dict())
        return symptom_check

    except Exception as e:
        # The existing offline fallback logic remains the same
        severity = "medium"
        if any(symptom.lower() in ["chest pain", "difficulty breathing", "severe bleeding", "unconscious"]
               for symptom in symptom_data.symptoms):
            severity = "emergency"
        elif any(symptom.lower() in ["fever", "headache", "cough"]
                for symptom in symptom_data.symptoms):
            severity = "low"

        symptom_check = SymptomCheck(
            user_id=symptom_data.user_id,
            symptoms=symptom_data.symptoms,
            assessment="Basic symptom assessment completed offline. Please consult with healthcare provider.",
            severity=severity,
            recommendations=["Consult with nearest healthcare provider", "Monitor symptoms carefully"],
            referral_needed=True
        )

        await db.symptom_checks.insert_one(symptom_check.dict())
        return symptom_check
        
    except Exception as e:
        # Offline fallback for symptom checking
        severity = "medium"
        if any(symptom.lower() in ["chest pain", "difficulty breathing", "severe bleeding", "unconscious"] 
               for symptom in symptom_data.symptoms):
            severity = "emergency"
        elif any(symptom.lower() in ["fever", "headache", "cough"] 
                for symptom in symptom_data.symptoms):
            severity = "low"
        
        symptom_check = SymptomCheck(
            user_id=symptom_data.user_id,
            symptoms=symptom_data.symptoms,
            assessment="Basic symptom assessment completed offline. Please consult with healthcare provider.",
            severity=severity,
            recommendations=["Consult with nearest healthcare provider", "Monitor symptoms carefully"],
            referral_needed=True
        )
        
        await db.symptom_checks.insert_one(symptom_check.dict())
        return symptom_check

@api_router.get("/symptom-checks/{user_id}", response_model=List[SymptomCheck])
async def get_user_symptom_checks(user_id: str):
    """Get symptom check history for a user"""
    checks = await db.symptom_checks.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return [SymptomCheck(**check) for check in checks]

# =============================================================================
# TELEMEDICINE CONSULTATIONS
# =============================================================================

@api_router.post("/consultations", response_model=Consultation)
async def book_consultation(consultation: ConsultationCreate):
    """Book a telemedicine consultation"""
    consultation_dict = consultation.dict()
    # Generate unique room ID for video calls
    consultation_dict["room_id"] = f"room_{uuid.uuid4().hex[:8]}"
    consultation_obj = Consultation(**consultation_dict)
    await db.consultations.insert_one(consultation_obj.dict())
    return consultation_obj

@api_router.get("/consultations/{user_id}", response_model=List[Consultation])
async def get_user_consultations(user_id: str):
    """Get all consultations for a user"""
    consultations = await db.consultations.find({"patient_id": user_id}).sort("appointment_time", -1).to_list(100)
    return [Consultation(**consultation) for consultation in consultations]

@api_router.get("/consultations/room/{room_id}")
async def get_consultation_room(room_id: str):
    """Get consultation room details for video call"""
    consultation = await db.consultations.find_one({"room_id": room_id})
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation room not found")
    
    return {
        "room_id": room_id,
        "consultation": Consultation(**consultation),
        "webrtc_config": {
            "iceServers": [
                {"urls": "stun:stun.l.google.com:19302"},
                {"urls": "stun:stun1.l.google.com:19302"}
            ]
        }
    }

# =============================================================================
# EMERGENCY RESPONSE
# =============================================================================

@api_router.post("/emergency-alert", response_model=EmergencyAlert)
async def create_emergency_alert(alert: EmergencyAlertCreate, background_tasks: BackgroundTasks):
    """Create emergency alert and notify responders"""
    alert_dict = alert.dict()
    alert_obj = EmergencyAlert(**alert_dict)
    await db.emergency_alerts.insert_one(alert_obj.dict())
    
    # Notify emergency responders
    background_tasks.add_task(notify_emergency_responders, alert_obj)
    
    return alert_obj

@api_router.get("/emergency-alerts")
async def get_emergency_alerts(status: str = "active"):
    """Get emergency alerts for responders"""
    alerts = await db.emergency_alerts.find({"status": status}).sort("created_at", -1).to_list(100)
    return [EmergencyAlert(**alert) for alert in alerts]

@api_router.put("/emergency-alerts/{alert_id}/respond")
async def respond_to_emergency(alert_id: str, responder_id: str):
    """Mark emergency alert as responded"""
    result = await db.emergency_alerts.update_one(
        {"id": alert_id},
        {"$set": {"status": "responded"}, "$push": {"responders_notified": responder_id}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Emergency alert not found")
    return {"message": "Emergency response logged"}

# =============================================================================
# ASHA WORKER PORTAL
# =============================================================================

@api_router.post("/asha-visits", response_model=ASHAVisit)
async def record_asha_visit(visit: ASHAVisitCreate):
    """Record ASHA worker home visit"""
    visit_dict = visit.dict()
    visit_obj = ASHAVisit(**visit_dict)
    await db.asha_visits.insert_one(visit_obj.dict())
    return visit_obj

@api_router.get("/asha-visits/{asha_id}", response_model=List[ASHAVisit])
async def get_asha_visits(asha_id: str):
    """Get all visits by an ASHA worker"""
    visits = await db.asha_visits.find({"asha_id": asha_id}).sort("created_at", -1).to_list(100)
    return [ASHAVisit(**visit) for visit in visits]

@api_router.get("/asha-visits/patient/{patient_id}", response_model=List[ASHAVisit])
async def get_patient_asha_visits(patient_id: str):
    """Get all ASHA visits for a patient"""
    visits = await db.asha_visits.find({"patient_id": patient_id}).sort("created_at", -1).to_list(100)
    return [ASHAVisit(**visit) for visit in visits]

# =============================================================================
# TRANSLATION & MULTILINGUAL SUPPORT
# =============================================================================

@api_router.post("/translate")
async def translate_text(text: str, target_language: str):
    """Translate text to target language using AI"""
    try:
        llm_key = os.environ.get("EMERGENT_LLM_KEY")
        if not llm_key:
            return {"translated_text": text}  # Return original if AI unavailable
        
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"translate_{datetime.now().timestamp()}",
            system_message=f"Translate the following text to {target_language}. Only respond with the translated text, nothing else."
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(text=text)
        response = await chat.send_message(user_message)
        
        return {"translated_text": response.strip()}
        
    except Exception as e:
        return {"translated_text": text}  # Fallback to original text

@api_router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {
        "languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "hi", "name": "Hindi", "native_name": "हिंदी"},
            {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ"},
            {"code": "bn", "name": "Bengali", "native_name": "বাংলা"},
            {"code": "te", "name": "Telugu", "native_name": "తెలుగు"},
            {"code": "mr", "name": "Marathi", "native_name": "मराठी"},
            {"code": "ta", "name": "Tamil", "native_name": "தமிழ்"},
            {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી"},
            {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ"},
            {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം"}
        ]
    }

# =============================================================================
# UTILITIES & HELPERS
# =============================================================================

async def send_sms_notification(phone: str, message: str):
    """Send SMS notification (mock implementation for free alternative)"""
    # In a real implementation, you would integrate with a free SMS service
    # For now, we'll just log the message
    print(f"SMS to {phone}: {message}")
    # You could integrate with services like:
    # - Twilio's free tier
    # - Your local telecom provider's API
    # - Government SMS gateway for rural healthcare

async def notify_emergency_responders(alert: EmergencyAlert):
    """Notify emergency responders about an alert"""
    # Find nearby ASHA workers and healthcare providers
    responders = await db.users.find({
        "role": {"$in": ["asha", "doctor"]},
        "village": {"$regex": ".*"}  # You would implement geo-based matching
    }).to_list(10)
    
    for responder in responders:
        # Send notification (SMS/push notification)
        await send_sms_notification(
            responder.get("phone", ""),
            f"EMERGENCY ALERT: {alert.user_name} needs help at location {alert.location}. Alert ID: {alert.id[:8]}"
        )

@api_router.get("/health")
async def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc),
        "services": {
            "database": "connected",
            "ai": "available" if os.environ.get("EMERGENT_LLM_KEY") else "unavailable"
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Initialize sample data on startup
@app.on_event("startup")
async def initialize_sample_data():
    """Initialize sample data for demo purposes"""
    try:
        # Check if data already exists
        user_count = await db.users.count_documents({})
        if user_count == 0:
            # Create sample pharmacy
            sample_pharmacy = Pharmacy(
                name="Civil Hospital Pharmacy",
                location="Civil Hospital, Village Center",
                phone="+91-9876543210",
                medicines={
                    "paracetamol": {"stock": 50, "price": 10, "expiry": "2025-12-31"},
                    "amoxicillin": {"stock": 30, "price": 45, "expiry": "2025-10-15"},
                    "metformin": {"stock": 25, "price": 25, "expiry": "2025-11-20"},
                    "aspirin": {"stock": 40, "price": 8, "expiry": "2025-09-30"}
                }
            )
            await db.pharmacies.insert_one(sample_pharmacy.dict())
            
            logger.info("Sample data initialized")
    except Exception as e:
        logger.error(f"Error initializing sample data: {e}")