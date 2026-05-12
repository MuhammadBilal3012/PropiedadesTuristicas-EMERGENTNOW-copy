from fastapi import FastAPI, APIRouter, HTTPException, Query, UploadFile, File, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import shutil
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'propiedades-turisticas-rd-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ==================== AUTH MODELS ====================

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "agente"
    nombre_completo: Optional[str] = None
    telefono_whatsapp: Optional[str] = None
    foto_perfil: Optional[str] = None

class UserUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    telefono_whatsapp: Optional[str] = None
    foto_perfil: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# ==================== AGENCY SETTINGS MODEL ====================

class StyleSettings(BaseModel):
    primary_color: str = "#0F172A"
    secondary_color: str = "#C5A059"
    background_color: str = "#FAFAF9"
    heading_font: str = "Playfair Display"
    body_font: str = "Manrope"
    heading_size: str = "large"  # small, medium, large
    body_size: str = "medium"
    layout_alignment: str = "center"  # left, center, right
    hero_text_position: str = "center"  # left, center, right

class AgencySettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Propiedades Turísticas RD"
    logo_url: Optional[str] = None  # Logo for header (all pages except home)
    hero_logo_url: Optional[str] = None  # Floating logo for hero section (home page only)
    hero_logo_width: int = 150  # Width in pixels for hero logo
    hero_logo_height: int = 100  # Height in pixels for hero logo
    hero_image_url: Optional[str] = None
    hero_images: List[str] = []
    whatsapp: str = "+18098475498"
    phone: str = "+18098475498"
    email: str = "info@propiedadesturisticasrd.com"
    address: str = "Santo Domingo, República Dominicana"
    facebook_url: str = "https://facebook.com"
    instagram_url: str = "https://instagram.com"
    tiktok_url: str = "https://tiktok.com"
    video_url: Optional[str] = None
    hero_headline: str = "Encuentra tu Paraíso en RD"
    hero_subheadline: str = "Propiedades exclusivas para una vida extraordinaria"
    hero_video_url: Optional[str] = None
    logo_position: str = "top-left"  # Position of floating hero logo
    # Hero title styling
    hero_title_size: int = 48  # Font size in pixels
    hero_title_position: str = "center"  # left, center, right
    hero_subtitle_size: int = 18  # Font size in pixels
    hero_title_vertical_position: int = 50  # Vertical position in percentage (0-100, 50 = center)
    # About page - Mission, Vision, Values
    about_mission_title: str = "Misión"
    about_mission: str = "Nuestra misión es ayudarte a encontrar la propiedad perfecta que se adapte a tus necesidades y estilo de vida."
    about_vision_title: str = "Visión"
    about_vision: str = "Ser la inmobiliaria líder en República Dominicana, reconocida por nuestra excelencia en servicio al cliente."
    about_values_title: str = "Valores"
    about_values: str = "Compromiso, honestidad, transparencia y dedicación en cada transacción que realizamos."
    # About Us page content
    about_title: str = "Sobre Nosotros"
    about_description: str = "Somos expertos en bienes raíces con más de 15 años de experiencia."
    about_mission: str = "Nuestra misión es ayudarte a encontrar la propiedad perfecta que se adapte a tus necesidades y estilo de vida."
    about_vision: str = "Ser la inmobiliaria líder en República Dominicana, reconocida por nuestra excelencia en servicio al cliente."
    about_years_experience: int = 15
    about_properties_sold: int = 500
    about_happy_clients: int = 1000
    about_team_members: int = 25
    # Features section (Why choose us)
    feature1_title: str = "Experiencia Comprobada"
    feature1_description: str = "Más de 15 años de experiencia en el mercado inmobiliario dominicano."
    feature2_title: str = "Atención Personalizada"
    feature2_description: str = "Un equipo dedicado a encontrar la propiedad perfecta para ti."
    feature3_title: str = "Precios Competitivos"
    feature3_description: str = "Las mejores opciones de inversión al mejor precio del mercado."
    # Analytics
    total_views: int = 0
    style: StyleSettings = StyleSettings()

class AgencySettingsUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    hero_logo_url: Optional[str] = None
    hero_logo_width: Optional[int] = None
    hero_logo_height: Optional[int] = None
    hero_image_url: Optional[str] = None
    hero_images: Optional[List[str]] = None
    whatsapp: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    video_url: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_headline: Optional[str] = None
    hero_subheadline: Optional[str] = None
    logo_position: Optional[str] = None
    hero_title_size: Optional[int] = None
    hero_title_position: Optional[str] = None
    hero_subtitle_size: Optional[int] = None
    hero_title_vertical_position: Optional[int] = None
    about_mission_title: Optional[str] = None
    about_mission: Optional[str] = None
    about_vision_title: Optional[str] = None
    about_vision: Optional[str] = None
    about_values_title: Optional[str] = None
    about_values: Optional[str] = None
    about_title: Optional[str] = None
    about_description: Optional[str] = None
    about_mission: Optional[str] = None
    about_vision: Optional[str] = None
    about_years_experience: Optional[int] = None
    about_properties_sold: Optional[int] = None
    about_happy_clients: Optional[int] = None
    about_team_members: Optional[int] = None
    feature1_title: Optional[str] = None
    feature1_description: Optional[str] = None
    feature2_title: Optional[str] = None
    feature2_description: Optional[str] = None
    feature3_title: Optional[str] = None
    feature3_description: Optional[str] = None
    style: Optional[dict] = None

# ==================== LOCATION MODEL ====================

class Location(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    image_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LocationCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    image_url: Optional[str] = None
    is_active: bool = True

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

# ==================== PROPERTY MODELS ====================

class PropertyImage(BaseModel):
    url: str
    alt: str = ""

class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    currency: str = "USD"
    location: str
    address: str = ""
    bedrooms: int
    bathrooms: int
    area: float
    property_type: str
    status: str = "Disponible"  # Disponible, Vendido, Reservado
    images: List[PropertyImage] = []
    video_urls: List[str] = []  # YouTube URLs
    is_featured: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    amenities: List[str] = []
    views: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    currency: str = "USD"
    location: str
    address: str = ""
    bedrooms: int
    bathrooms: int
    area: float
    property_type: str
    status: str = "Disponible"
    images: List[PropertyImage] = []
    video_urls: List[str] = []
    is_featured: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    amenities: List[str] = []

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    property_type: Optional[str] = None
    status: Optional[str] = None
    images: Optional[List[PropertyImage]] = None
    video_urls: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    amenities: Optional[List[str]] = None

# ==================== VISIT TRACKING MODEL ====================

class PageVisit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: str
    property_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_agent: str = ""
    ip_hash: str = ""

# ==================== CONTACT MODEL ====================

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    message: str
    property_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str
    property_id: Optional[str] = None

# ==================== SELL REQUEST MODEL ====================

class SellRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str = ""
    property_description: str
    property_type: str = ""
    location: str = ""
    status: str = "pending"  # pending, contacted, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SellRequestCreate(BaseModel):
    name: str
    phone: str
    email: str = ""
    property_description: str
    property_type: str = ""
    location: str = ""

# ==================== JOB APPLICATION MODEL ====================

class JobApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str
    cv_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    message: str = ""
    position: str = ""
    status: str = "pending"  # pending, reviewed, interviewed, hired, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobApplicationCreate(BaseModel):
    name: str
    phone: str
    email: str
    cv_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    message: str = ""
    position: str = ""

# ==================== PAGINATION ====================

class PaginatedProperties(BaseModel):
    properties: List[Property]
    total: int
    page: int
    limit: int
    total_pages: int

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, username: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user: UserCreate):
    existing = await db.users.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    
    user_id = str(uuid.uuid4())
    hashed = hash_password(user.password)
    
    await db.users.insert_one({
        "id": user_id,
        "username": user.username,
        "password": hashed,
        "role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    token = create_token(user_id, user.username, user.role)
    return TokenResponse(
        access_token=token,
        user={"id": user_id, "username": user.username, "role": user.role}
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Handle both 'id' and '_id' fields for compatibility
    user_id = user.get("id") or str(user.get("_id", ""))
    token = create_token(user_id, user["username"], user["role"])
    return TokenResponse(
        access_token=token,
        user={
            "id": user_id, 
            "username": user["username"], 
            "role": user["role"],
            "nombre_completo": user.get("nombre_completo", ""),
            "telefono_whatsapp": user.get("telefono_whatsapp", ""),
            "foto_perfil": user.get("foto_perfil", "")
        }
    )

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/setup")
async def setup_admin():
    """Create default admin user if none exists"""
    existing = await db.users.find_one({"role": "admin"})
    if existing:
        return {"message": "Admin user already exists", "username": existing["username"]}
    
    user_id = str(uuid.uuid4())
    hashed = hash_password("admin123")
    
    await db.users.insert_one({
        "id": user_id,
        "username": "admin",
        "password": hashed,
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Admin user created", "username": "admin", "password": "admin123"}

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@api_router.post("/auth/change-password")
async def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Change password for current user"""
    user = await db.users.find_one({"id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not verify_password(req.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    
    new_hashed = hash_password(req.new_password)
    await db.users.update_one(
        {"id": current_user["sub"]},
        {"$set": {"password": new_hashed}}
    )
    
    return {"message": "Contraseña actualizada exitosamente"}

# ==================== USER MANAGEMENT ROUTES ====================

class UserResponse(BaseModel):
    id: str
    username: str
    role: str
    nombre_completo: Optional[str] = None
    telefono_whatsapp: Optional[str] = None
    foto_perfil: Optional[str] = None
    created_at: str

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    """Get all users (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    
    cursor = db.users.find({}, {"_id": 0, "password": 0})
    users = await cursor.to_list(length=100)
    
    # Format users for response
    formatted_users = []
    for user in users:
        # Handle created_at conversion
        created_at = user.get('created_at')
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        elif not created_at:
            created_at = datetime.now(timezone.utc).isoformat()
        
        formatted_users.append({
            "id": user.get("id", str(user.get("_id", ""))),
            "username": user.get("username", ""),
            "role": user.get("role", "agente"),
            "nombre_completo": user.get("nombre_completo", ""),
            "telefono_whatsapp": user.get("telefono_whatsapp", ""),
            "foto_perfil": user.get("foto_perfil", ""),
            "created_at": created_at
        })
    
    return formatted_users

@api_router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    """Create a new user (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    
    existing = await db.users.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    user_id = str(uuid.uuid4())
    hashed = hash_password(user.password)
    created_at = datetime.now(timezone.utc).isoformat()
    
    await db.users.insert_one({
        "id": user_id,
        "username": user.username,
        "password": hashed,
        "role": user.role,
        "nombre_completo": user.nombre_completo,
        "telefono_whatsapp": user.telefono_whatsapp,
        "foto_perfil": user.foto_perfil,
        "created_at": created_at
    })
    
    return UserResponse(
        id=user_id, 
        username=user.username, 
        role=user.role, 
        nombre_completo=user.nombre_completo,
        telefono_whatsapp=user.telefono_whatsapp,
        foto_perfil=user.foto_perfil,
        created_at=created_at
    )

@api_router.put("/users/{user_id}/profile")
async def update_user_profile(user_id: str, profile: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile (own profile or admin)"""
    if current_user["sub"] != user_id and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    
    update_data = {}
    if profile.nombre_completo is not None:
        update_data["nombre_completo"] = profile.nombre_completo
    if profile.telefono_whatsapp is not None:
        update_data["telefono_whatsapp"] = profile.telefono_whatsapp
    if profile.foto_perfil is not None:
        update_data["foto_perfil"] = profile.foto_perfil
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return user

@api_router.get("/users/{user_id}/profile")
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a user (admin only, cannot delete self)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    
    if user_id == current_user["sub"]:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": "Usuario eliminado"}

# ==================== FILE UPLOAD ====================

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")
    
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOADS_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"/api/uploads/{unique_filename}", "filename": unique_filename}

# ==================== VISIT TRACKING ====================

@api_router.post("/track/visit")
async def track_visit(page: str = "home", property_id: Optional[str] = None):
    visit = {
        "id": str(uuid.uuid4()),
        "page": page,
        "property_id": property_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.visits.insert_one(visit)
    
    # Increment property views if tracking a property
    if property_id:
        await db.properties.update_one(
            {"id": property_id},
            {"$inc": {"views": 1}}
        )
    
    # Increment total views counter in agency settings
    await db.agency_settings.update_one(
        {},
        {"$inc": {"total_views": 1}},
        upsert=True
    )
    
    return {"success": True}

@api_router.get("/views/count")
async def get_views_count():
    """Get total page views"""
    settings = await db.agency_settings.find_one({}, {"_id": 0, "total_views": 1})
    return {"total_views": settings.get("total_views", 0) if settings else 0}

@api_router.get("/stats")
async def get_statistics():
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    
    # Daily visits (today)
    daily_visits = await db.visits.count_documents({
        "timestamp": {"$gte": today_start.isoformat()}
    })
    
    # Weekly visits
    weekly_visits = await db.visits.count_documents({
        "timestamp": {"$gte": week_ago.isoformat()}
    })
    
    # Total visits
    total_visits = await db.visits.count_documents({})
    
    # Top 3 most viewed properties this week
    pipeline = [
        {"$match": {"property_id": {"$ne": None}, "timestamp": {"$gte": week_ago.isoformat()}}},
        {"$group": {"_id": "$property_id", "views": {"$sum": 1}}},
        {"$sort": {"views": -1}},
        {"$limit": 3}
    ]
    
    top_properties_cursor = db.visits.aggregate(pipeline)
    top_property_ids = await top_properties_cursor.to_list(length=3)
    
    top_properties = []
    for item in top_property_ids:
        prop = await db.properties.find_one({"id": item["_id"]}, {"_id": 0})
        if prop:
            top_properties.append({
                "id": prop["id"],
                "title": prop["title"],
                "location": prop["location"],
                "price": prop["price"],
                "currency": prop.get("currency", "USD"),
                "image": prop.get("images", [{}])[0].get("url") if prop.get("images") else None,
                "weekly_views": item["views"],
                "total_views": prop.get("views", 0)
            })
    
    # Visits by day (last 7 days)
    visits_by_day = []
    for i in range(7):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        count = await db.visits.count_documents({
            "timestamp": {
                "$gte": day_start.isoformat(),
                "$lt": day_end.isoformat()
            }
        })
        
        visits_by_day.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "day_name": day_start.strftime("%A"),
            "visits": count
        })
    
    visits_by_day.reverse()
    
    # Total counts
    total_properties = await db.properties.count_documents({})
    total_locations = await db.locations.count_documents({})
    total_messages = await db.contact_messages.count_documents({})
    
    return {
        "daily_visits": daily_visits,
        "weekly_visits": weekly_visits,
        "total_visits": total_visits,
        "top_properties": top_properties,
        "visits_by_day": visits_by_day,
        "total_properties": total_properties,
        "total_locations": total_locations,
        "total_messages": total_messages
    }

# ==================== AGENCY ROUTES ====================

@api_router.get("/agency", response_model=AgencySettings)
async def get_agency_settings():
    settings = await db.agency_settings.find_one({}, {"_id": 0})
    if not settings:
        default = AgencySettings()
        doc = default.model_dump()
        doc['created_at'] = datetime.now(timezone.utc).isoformat()
        await db.agency_settings.insert_one(doc)
        return default
    
    # Ensure style exists
    if 'style' not in settings:
        settings['style'] = StyleSettings().model_dump()
    
    return AgencySettings(**settings)

@api_router.put("/agency", response_model=AgencySettings)
async def update_agency_settings(update: AgencySettingsUpdate):
    update_data = {}
    for k, v in update.model_dump().items():
        if v is not None:
            if k == 'style' and isinstance(v, dict):
                # Merge style updates
                current = await db.agency_settings.find_one({}, {"_id": 0})
                current_style = current.get('style', {}) if current else {}
                current_style.update(v)
                update_data['style'] = current_style
            else:
                update_data[k] = v
    
    if update_data:
        await db.agency_settings.update_one({}, {"$set": update_data}, upsert=True)
    
    settings = await db.agency_settings.find_one({}, {"_id": 0})
    if 'style' not in settings:
        settings['style'] = StyleSettings().model_dump()
    
    return AgencySettings(**settings)

# ==================== LOCATION ROUTES ====================

@api_router.post("/locations", response_model=Location)
async def create_location(loc: LocationCreate):
    location_obj = Location(**loc.model_dump())
    doc = location_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.locations.insert_one(doc)
    return location_obj

@api_router.get("/locations", response_model=List[Location])
async def get_locations(active_only: bool = False):
    query = {"is_active": True} if active_only else {}
    cursor = db.locations.find(query, {"_id": 0}).sort("name", 1)
    locations_list = await cursor.to_list(length=100)
    
    for loc in locations_list:
        if isinstance(loc.get('created_at'), str):
            loc['created_at'] = datetime.fromisoformat(loc['created_at'])
    
    return [Location(**loc_item) for loc_item in locations_list]

@api_router.put("/locations/{location_id}", response_model=Location)
async def update_location(location_id: str, update: LocationUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    result = await db.locations.update_one({"id": location_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    
    loc = await db.locations.find_one({"id": location_id}, {"_id": 0})
    if isinstance(loc.get('created_at'), str):
        loc['created_at'] = datetime.fromisoformat(loc['created_at'])
    
    return Location(**loc)

@api_router.delete("/locations/{location_id}")
async def delete_location(location_id: str):
    result = await db.locations.delete_one({"id": location_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    return {"message": "Ubicación eliminada"}

# ==================== PROPERTY ROUTES ====================

@api_router.post("/properties", response_model=Property)
async def create_property(prop: PropertyCreate, current_user: dict = Depends(get_current_user)):
    property_obj = Property(**prop.model_dump())
    doc = property_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    doc['created_by'] = current_user["sub"]  # Link property to the user who created it
    await db.properties.insert_one(doc)
    return property_obj

@api_router.get("/properties")
async def get_properties(
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=100),
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    property_type: Optional[str] = None,
    status: Optional[str] = None,
    featured_only: bool = False
):
    query = {}
    
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        query.setdefault("price", {})["$lte"] = max_price
    if bedrooms is not None:
        query["bedrooms"] = {"$gte": bedrooms}
    if property_type:
        query["property_type"] = property_type
    if status:
        query["status"] = status
    if featured_only:
        query["is_featured"] = True
    
    total = await db.properties.count_documents(query)
    skip = (page - 1) * limit
    
    cursor = db.properties.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    properties_list = await cursor.to_list(length=limit)
    
    # Populate creator info for each property
    result_properties = []
    for prop in properties_list:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at']).isoformat()
        else:
            prop['created_at'] = prop['created_at'].isoformat() if prop.get('created_at') else None
        if isinstance(prop.get('updated_at'), str):
            prop['updated_at'] = datetime.fromisoformat(prop['updated_at']).isoformat()
        else:
            prop['updated_at'] = prop['updated_at'].isoformat() if prop.get('updated_at') else None
        
        # Get creator info if available
        created_by_info = None
        if prop.get('created_by'):
            creator = await db.users.find_one({"id": prop['created_by']}, {"_id": 0, "password": 0})
            if creator:
                created_by_info = {
                    "username": creator.get("username"),
                    "nombre_completo": creator.get("nombre_completo"),
                    "telefono_whatsapp": creator.get("telefono_whatsapp"),
                    "foto_perfil": creator.get("foto_perfil")
                }
        prop['created_by_info'] = created_by_info
        result_properties.append(prop)
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "properties": result_properties,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@api_router.get("/properties/featured")
async def get_featured_properties(limit: int = Query(6, ge=1, le=12)):
    cursor = db.properties.find({"is_featured": True}, {"_id": 0}).limit(limit)
    properties_list = await cursor.to_list(length=limit)
    
    result_properties = []
    for prop in properties_list:
        if isinstance(prop.get('created_at'), str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at']).isoformat()
        else:
            prop['created_at'] = prop['created_at'].isoformat() if prop.get('created_at') else None
        if isinstance(prop.get('updated_at'), str):
            prop['updated_at'] = datetime.fromisoformat(prop['updated_at']).isoformat()
        else:
            prop['updated_at'] = prop['updated_at'].isoformat() if prop.get('updated_at') else None
        
        # Get creator info if available
        created_by_info = None
        if prop.get('created_by'):
            creator = await db.users.find_one({"id": prop['created_by']}, {"_id": 0, "password": 0})
            if creator:
                created_by_info = {
                    "username": creator.get("username"),
                    "nombre_completo": creator.get("nombre_completo"),
                    "telefono_whatsapp": creator.get("telefono_whatsapp"),
                    "foto_perfil": creator.get("foto_perfil")
                }
        prop['created_by_info'] = created_by_info
        result_properties.append(prop)
    
    return result_properties

@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    if isinstance(prop.get('created_at'), str):
        prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    if isinstance(prop.get('updated_at'), str):
        prop['updated_at'] = datetime.fromisoformat(prop['updated_at'])
    
    # Get creator info if available
    created_by_info = None
    if prop.get('created_by'):
        creator = await db.users.find_one({"id": prop['created_by']}, {"_id": 0, "password": 0})
        if creator:
            created_by_info = {
                "username": creator.get("username"),
                "nombre_completo": creator.get("nombre_completo"),
                "telefono_whatsapp": creator.get("telefono_whatsapp"),
                "foto_perfil": creator.get("foto_perfil")
            }
    
    response = Property(**prop).model_dump()
    response['created_by_info'] = created_by_info
    return response

@api_router.put("/properties/{property_id}", response_model=Property)
async def update_property(property_id: str, update: PropertyUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.properties.update_one({"id": property_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if isinstance(prop.get('created_at'), str):
        prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    if isinstance(prop.get('updated_at'), str):
        prop['updated_at'] = datetime.fromisoformat(prop['updated_at'])
    
    return Property(**prop)

@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str):
    result = await db.properties.delete_one({"id": property_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return {"message": "Propiedad eliminada"}

# ==================== CONTACT ROUTES ====================

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(msg: ContactMessageCreate):
    contact_obj = ContactMessage(**msg.model_dump())
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    return contact_obj

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    cursor = db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1)
    messages = await cursor.to_list(length=100)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return [ContactMessage(**m) for m in messages]

@api_router.delete("/contact/{message_id}")
async def delete_contact_message(message_id: str):
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return {"message": "Mensaje eliminado"}

# ==================== SELL REQUESTS ROUTES ====================

@api_router.post("/sell-requests", response_model=SellRequest)
async def create_sell_request(req: SellRequestCreate):
    sell_obj = SellRequest(**req.model_dump())
    doc = sell_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sell_requests.insert_one(doc)
    
    # Send WhatsApp notification
    await send_whatsapp_notification(
        "sell_request",
        f"Nueva solicitud de venta:\n• Nombre: {req.name}\n• Teléfono: {req.phone}\n• Tipo: {req.property_type or 'No especificado'}\n• Ubicación: {req.location or 'No especificada'}"
    )
    
    return sell_obj

@api_router.get("/sell-requests", response_model=List[SellRequest])
async def get_sell_requests(current_user: dict = Depends(get_current_user)):
    cursor = db.sell_requests.find({}, {"_id": 0}).sort("created_at", -1)
    requests = await cursor.to_list(length=100)
    
    for req in requests:
        if isinstance(req.get('created_at'), str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
    
    return [SellRequest(**r) for r in requests]

@api_router.put("/sell-requests/{request_id}/status")
async def update_sell_request_status(request_id: str, status: str, current_user: dict = Depends(get_current_user)):
    if status not in ["pending", "contacted", "closed"]:
        raise HTTPException(status_code=400, detail="Estado inválido")
    
    result = await db.sell_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    return {"message": "Estado actualizado"}

@api_router.delete("/sell-requests/{request_id}")
async def delete_sell_request(request_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.sell_requests.delete_one({"id": request_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return {"message": "Solicitud eliminada"}

# ==================== JOB APPLICATIONS ROUTES ====================

@api_router.post("/job-applications", response_model=JobApplication)
async def create_job_application(app: JobApplicationCreate):
    job_obj = JobApplication(**app.model_dump())
    doc = job_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.job_applications.insert_one(doc)
    
    # Send WhatsApp notification
    await send_whatsapp_notification(
        "job_application",
        f"Nueva aplicación de empleo:\n• Nombre: {app.name}\n• Email: {app.email}\n• Teléfono: {app.phone}\n• Posición: {app.position or 'No especificada'}"
    )
    
    return job_obj

@api_router.get("/job-applications", response_model=List[JobApplication])
async def get_job_applications(current_user: dict = Depends(get_current_user)):
    cursor = db.job_applications.find({}, {"_id": 0}).sort("created_at", -1)
    applications = await cursor.to_list(length=100)
    
    for app in applications:
        if isinstance(app.get('created_at'), str):
            app['created_at'] = datetime.fromisoformat(app['created_at'])
    
    return [JobApplication(**a) for a in applications]

@api_router.put("/job-applications/{application_id}/status")
async def update_job_application_status(application_id: str, status: str, current_user: dict = Depends(get_current_user)):
    valid_statuses = ["pending", "reviewed", "interviewed", "hired", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Estado inválido")
    
    result = await db.job_applications.update_one(
        {"id": application_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Aplicación no encontrada")
    
    return {"message": "Estado actualizado"}

@api_router.delete("/job-applications/{application_id}")
async def delete_job_application(application_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.job_applications.delete_one({"id": application_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aplicación no encontrada")
    return {"message": "Aplicación eliminada"}

# ==================== WHATSAPP NOTIFICATIONS ====================

async def send_whatsapp_notification(notification_type: str, message: str):
    """Send WhatsApp notification using the agency's WhatsApp number"""
    try:
        # Get agency settings for WhatsApp number
        settings = await db.agency_settings.find_one({}, {"_id": 0})
        whatsapp_number = settings.get('whatsapp', '') if settings else ''
        
        if not whatsapp_number:
            logger.info("No WhatsApp number configured for notifications")
            return
        
        # Clean the phone number
        clean_number = ''.join(filter(str.isdigit, whatsapp_number))
        
        # Store notification in database for tracking
        notification = {
            "id": str(uuid.uuid4()),
            "type": notification_type,
            "message": message,
            "whatsapp_number": clean_number,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.whatsapp_notifications.insert_one(notification)
        
        logger.info(f"WhatsApp notification queued: {notification_type} to {clean_number}")
        return {"status": "queued", "notification_id": notification["id"]}
        
    except Exception as e:
        logger.error(f"Error sending WhatsApp notification: {e}")
        return None

@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get all pending WhatsApp notifications"""
    cursor = db.whatsapp_notifications.find({}, {"_id": 0}).sort("created_at", -1).limit(50)
    notifications = await cursor.to_list(length=50)
    return notifications

@api_router.get("/notifications/whatsapp-link/{notification_id}")
async def get_whatsapp_link(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Generate WhatsApp click-to-chat link for a notification"""
    notification = await db.whatsapp_notifications.find_one({"id": notification_id}, {"_id": 0})
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    # Mark as sent
    await db.whatsapp_notifications.update_one(
        {"id": notification_id},
        {"$set": {"status": "sent"}}
    )
    
    # Generate WhatsApp API link
    import urllib.parse
    encoded_message = urllib.parse.quote(notification["message"])
    whatsapp_link = f"https://wa.me/{notification['whatsapp_number']}?text={encoded_message}"
    
    return {"link": whatsapp_link, "notification": notification}

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    count = await db.properties.count_documents({})
    if count > 0:
        return {"message": "Data already seeded", "count": count}
    
    # Seed locations
    default_locations = [
        {"name": "Punta Cana", "description": "Destino turístico de playas cristalinas"},
        {"name": "Santo Domingo", "description": "Capital de República Dominicana"},
        {"name": "Samaná", "description": "Península con playas vírgenes"},
        {"name": "La Romana", "description": "Hogar de Casa de Campo"},
        {"name": "Puerto Plata", "description": "Costa norte con montañas y playas"},
        {"name": "Jarabacoa", "description": "Montañas y clima fresco"},
        {"name": "Santiago", "description": "Segunda ciudad más grande"},
        {"name": "Bávaro", "description": "Zona hotelera premium"},
    ]
    
    for loc_data in default_locations:
        loc = Location(**loc_data)
        doc = loc.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.locations.insert_one(doc)
    
    # Seed properties
    sample_properties = [
        {
            "title": "Villa de Lujo con Piscina",
            "description": "Espectacular villa de lujo con vista al mar, piscina infinita, 4 habitaciones.",
            "price": 850000, "currency": "USD", "location": "Punta Cana",
            "address": "Cap Cana, Punta Cana", "bedrooms": 4, "bathrooms": 4, "area": 450,
            "property_type": "Villa", "status": "Disponible",
            "images": [{"url": "https://images.unsplash.com/photo-1760067537255-64d36262cb0a?w=800", "alt": "Villa"}],
            "video_urls": [], "is_featured": True,
            "amenities": ["Piscina", "Vista al mar", "Aire acondicionado", "Jardín"]
        },
        {
            "title": "Apartamento Moderno en Santo Domingo",
            "description": "Moderno apartamento en torre exclusiva, completamente amueblado.",
            "price": 195000, "currency": "USD", "location": "Santo Domingo",
            "address": "Piantini", "bedrooms": 2, "bathrooms": 2, "area": 120,
            "property_type": "Apartamento", "status": "Disponible",
            "images": [{"url": "https://images.unsplash.com/photo-1759722668087-efcc63c91ed2?w=800", "alt": "Apartamento"}],
            "video_urls": [], "is_featured": True,
            "amenities": ["Gimnasio", "Área social", "Seguridad 24/7"]
        },
        {
            "title": "Casa Frente al Mar en Samaná",
            "description": "Hermosa casa con acceso directo a la playa.",
            "price": 425000, "currency": "USD", "location": "Samaná",
            "address": "Las Terrenas", "bedrooms": 3, "bathrooms": 3, "area": 280,
            "property_type": "Casa", "status": "Disponible",
            "images": [{"url": "https://images.unsplash.com/photo-1724598260678-644e11a6febf?w=800", "alt": "Casa"}],
            "video_urls": [], "is_featured": True,
            "amenities": ["Frente al mar", "Terraza", "BBQ"]
        },
        {
            "title": "Penthouse de Lujo en La Romana",
            "description": "Impresionante penthouse con terraza privada y jacuzzi.",
            "price": 680000, "currency": "USD", "location": "La Romana",
            "address": "Casa de Campo", "bedrooms": 4, "bathrooms": 5, "area": 380,
            "property_type": "Apartamento", "status": "Vendido",
            "images": [{"url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "alt": "Penthouse"}],
            "video_urls": [], "is_featured": True,
            "amenities": ["Jacuzzi", "Terraza privada", "Vista panorámica"]
        },
        {
            "title": "Terreno en Puerto Plata",
            "description": "Excelente terreno con potencial para desarrollo.",
            "price": 150000, "currency": "USD", "location": "Puerto Plata",
            "address": "Sosúa", "bedrooms": 0, "bathrooms": 0, "area": 2500,
            "property_type": "Terreno", "status": "Disponible",
            "images": [{"url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800", "alt": "Terreno"}],
            "video_urls": [], "is_featured": False,
            "amenities": ["Cerca de la playa", "Acceso pavimentado"]
        },
        {
            "title": "Villa en Jarabacoa",
            "description": "Villa moderna de montaña con vistas espectaculares.",
            "price": 320000, "currency": "USD", "location": "Jarabacoa",
            "address": "La Vega", "bedrooms": 3, "bathrooms": 3, "area": 250,
            "property_type": "Villa", "status": "Disponible",
            "images": [{"url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "alt": "Villa"}],
            "video_urls": [], "is_featured": True,
            "amenities": ["Vista a montañas", "Chimenea", "Jardín"]
        }
    ]
    
    for prop_data in sample_properties:
        prop = Property(**prop_data)
        doc = prop.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.properties.insert_one(doc)
    
    return {"message": "Datos sembrados", "count": len(sample_properties), "locations": len(default_locations)}

@api_router.get("/")
async def root():
    return {"message": "Propiedades Turísticas RD API"}

# Include router and mount static files
app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
