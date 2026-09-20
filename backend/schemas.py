from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class AnimalBase(BaseModel):
    animal_id: str
    farm_id: str
    breed: str
    age_years: float
    lactation_number: int
    days_in_milk: int
    previous_mastitis: int
    disease_history: str
    vaccination_status: str
    treatment_history: Optional[str] = None
    
    # Milk measurements
    milk_yield_l_day: float
    scc_cells_ml: int
    milk_conductivity_ms_cm: Optional[float] = None
    milk_temperature_c: float
    
    # Sensors
    body_temperature_c: Optional[float] = None
    udder_surface_temperature_c: Optional[float] = None
    activity_percent: Optional[float] = None
    rumination_min_day: Optional[float] = None
    feeding_behavior_score: float
    water_intake_l_day: float
    
    # Management & Environment
    feed_quality_score: Optional[float] = None
    hygiene_score: float
    housing_condition_score: float
    milking_hygiene_score: float
    worker_hygiene_score: Optional[float] = None
    milking_frequency_per_day: int
    milking_schedule: str
    ambient_temperature_c: float
    relative_humidity_percent: float
    climate_risk: str
    co_morbidity: int
    sensor_status: str

class AnimalResponse(AnimalBase):
    record_id: Optional[str] = None
    mastitis_within_7_14_days: Optional[int] = 0
    updated_at: Optional[datetime] = None
    
    # Computed risk status if evaluated
    risk_score: Optional[float] = None
    risk_category: Optional[str] = None

    class Config:
        from_attributes = True

class RiskFactor(BaseModel):
    feature: str
    name: str
    value: str
    impact: str
    description: str
    contribution_pct: Optional[float] = None


class RecommendationItem(BaseModel):
    id: str
    category: str
    title: str
    action: str
    priority: str

class PredictionRequest(BaseModel):
    animal_id: str
    farm_id: Optional[str] = "FARM-001"
    breed: Optional[str] = "Crossbreed"
    age_years: Optional[float] = 4.5
    lactation_number: Optional[int] = 2
    days_in_milk: Optional[int] = 120
    previous_mastitis: Optional[int] = 0
    disease_history: Optional[str] = "None"
    vaccination_status: Optional[str] = "Up to date"
    treatment_history: Optional[str] = None
    milk_yield_l_day: float
    scc_cells_ml: int
    milk_conductivity_ms_cm: Optional[float] = 5.2
    milk_temperature_c: Optional[float] = 35.0
    body_temperature_c: Optional[float] = 38.5
    udder_surface_temperature_c: Optional[float] = 35.5
    activity_percent: Optional[float] = 85.0
    rumination_min_day: Optional[float] = 480.0
    feeding_behavior_score: Optional[float] = 8.0
    water_intake_l_day: Optional[float] = 70.0
    feed_quality_score: Optional[float] = 8.0
    hygiene_score: Optional[float] = 7.5
    housing_condition_score: Optional[float] = 7.5
    milking_hygiene_score: Optional[float] = 8.0
    worker_hygiene_score: Optional[float] = 8.0
    milking_frequency_per_day: Optional[int] = 2
    milking_schedule: Optional[str] = "2x daily"
    ambient_temperature_c: Optional[float] = 28.0
    relative_humidity_percent: Optional[float] = 65.0
    climate_risk: Optional[str] = "Low"
    co_morbidity: Optional[int] = 0
    sensor_status: Optional[str] = "Active"

class PredictionResponse(BaseModel):
    animal_id: str
    risk_score: float
    risk_category: str
    forecast: str = "7–14 days"
    prediction: int
    probability: float
    risk_factors: List[RiskFactor]
    recommendations: List[RecommendationItem]

class HerdSummaryResponse(BaseModel):
    total_animals: int
    animals_monitored: Optional[int] = None
    no_risk_count: int
    low_risk_count: int
    moderate_risk_count: int
    high_risk_count: int
    overall_herd_risk: str
    high_risk_animals: List[Dict[str, Any]]
    average_scc: float
    average_milk_yield: float
    average_conductivity: float
    average_activity: float
    average_rumination: float

class AlertResponse(BaseModel):
    id: int
    animal_id: str
    farm_id: str
    alert_type: str
    severity: str
    title: str
    message: str
    main_indicators: List[str]
    is_reviewed: bool
    created_at: datetime
    risk_score: Optional[float] = None
    risk_category: Optional[str] = None
    sms_status: Optional[str] = None

    class Config:
        from_attributes = True


class ModelMetricsResponse(BaseModel):
    random_forest: Dict[str, Any]
    logistic_regression: Dict[str, Any]
    feature_importances: List[Dict[str, Any]]

class SensorSimulateRequest(BaseModel):
    animal_id: str
    body_temperature_c: float
    udder_surface_temperature_c: float
    milk_conductivity_ms_cm: float
    milk_temperature_c: float
    milk_yield_l_day: float
    activity_percent: float
    rumination_min_day: float
    scc_cells_ml: int
    water_intake_l_day: Optional[float] = None
    feeding_behavior_score: Optional[float] = None
    ambient_temperature_c: Optional[float] = None
    relative_humidity_percent: Optional[float] = None



# ---------------------------------------------------------------------------
# SMS Notification Schemas
# ---------------------------------------------------------------------------

class SMSSendRequest(BaseModel):
    """Manual send: send SMS for a specific animal (uses its latest prediction data)."""
    animal_id: str
    recipient: str

class SMSTestRequest(BaseModel):
    """Test SMS dispatch — does not require an animal ID."""
    recipient: str
    mode: Optional[str] = "SIMULATED"

class SMSSettingsRequest(BaseModel):
    enabled: bool
    farmer_phone: Optional[str] = ""
    vet_phone: Optional[str] = ""
    mode: Optional[str] = "SIMULATED"

class SMSSettingsResponse(BaseModel):
    id: int
    enabled: bool
    farmer_phone: str
    vet_phone: str
    mode: str

class SMSNotificationResponse(BaseModel):
    id: int
    animal_id: str
    farm_id: Optional[str] = ""
    recipient: str
    message: str
    risk_category: str
    risk_score: float
    status: str
    mode: str
    sent_at: Optional[str] = None
