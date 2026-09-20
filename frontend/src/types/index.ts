export interface RiskFactor {
  feature: string;
  name: string;
  value: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
  contribution_pct?: number;
}


export interface RecommendationItem {
  id: string;
  category: string;
  title: string;
  action: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PredictionResponse {
  animal_id: string;
  risk_score: number;
  risk_category: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk';
  forecast: string;
  prediction: number;
  probability: number;
  risk_factors: RiskFactor[];
  recommendations: RecommendationItem[];
}

export interface Animal {
  animal_id: str;
  record_id?: string;
  farm_id: string;
  breed: string;
  age_years: number;
  lactation_number: number;
  days_in_milk: number;
  previous_mastitis: number;
  disease_history: string;
  vaccination_status: string;
  treatment_history?: string | null;
  milk_yield_l_day: number;
  scc_cells_ml: number;
  milk_conductivity_ms_cm?: number | null;
  milk_temperature_c: number;
  body_temperature_c?: number | null;
  udder_surface_temperature_c?: number | null;
  activity_percent?: number | null;
  rumination_min_day?: number | null;
  feeding_behavior_score: number;
  water_intake_l_day: number;
  feed_quality_score?: number | null;
  hygiene_score: number;
  housing_condition_score: number;
  milking_hygiene_score: number;
  worker_hygiene_score?: number | null;
  milking_frequency_per_day: number;
  milking_schedule: string;
  ambient_temperature_c: number;
  relative_humidity_percent: number;
  climate_risk: string;
  co_morbidity: number;
  sensor_status: string;
  mastitis_within_7_14_days?: number;
  updated_at?: string;
  risk_score?: number;
  risk_category?: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk';
  ai_assessment?: PredictionResponse;
}

export type str = string;

export interface HighRiskAnimalSummary {
  animal_id: string;
  farm_id: string;
  breed: string;
  milk_yield_l_day: number;
  scc_cells_ml: number;
  risk_score: number;
  risk_category: string;
  primary_factor: string;
  forecast_window?: string;
  alert_status?: string;
}

export interface HerdSummary {
  total_animals: number;
  animals_monitored?: number;
  no_risk_count: number;
  low_risk_count: number;
  moderate_risk_count: number;
  high_risk_count: number;
  overall_herd_risk: 'NO RISK' | 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK';
  high_risk_animals: HighRiskAnimalSummary[];
  average_scc: number;
  average_milk_yield: number;
  average_conductivity: number;
  average_activity: number;
  average_rumination: number;
}

export interface Alert {
  id: number;
  animal_id: string;
  farm_id: string;
  alert_type: 'HIGH RISK' | 'MODERATE RISK' | 'SENSOR WARNING' | 'HERD WARNING' | string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  title: string;
  message: string;
  main_indicators: string[];
  is_reviewed: boolean;
  created_at: string;
  risk_score?: number;
  risk_category?: string;
  sms_status?: string;
}


export interface ModelMetrics {
  random_forest: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
  };
  logistic_regression: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
  };
  feature_importances: {
    feature: string;
    name?: string;
    importance: number;
  }[];
}

export interface SensorSimulateRequest {
  animal_id: string;
  body_temperature_c: number;
  udder_surface_temperature_c: number;
  milk_conductivity_ms_cm: number;
  milk_temperature_c: number;
  milk_yield_l_day: number;
  activity_percent: number;
  rumination_min_day: number;
  scc_cells_ml: number;
  water_intake_l_day?: number;
  feeding_behavior_score?: number;
  ambient_temperature_c?: number;
  relative_humidity_percent?: number;
}


// ---------------------------------------------------------------------------
// SMS Notification Types
// ---------------------------------------------------------------------------

export interface SMSNotification {
  id: number;
  animal_id: string;
  farm_id: string;
  recipient: string;
  message: string;
  risk_category: string;
  risk_score: number;
  status: 'SENT_SIMULATED' | 'FAILED' | 'SKIPPED';
  mode: 'SIMULATED' | 'REAL';
  sent_at: string | null;
}

export interface SMSSettings {
  id: number;
  enabled: boolean;
  farmer_phone: string;
  vet_phone: string;
  mode: 'SIMULATED' | 'REAL';
}

export interface SMSSendResult {
  success: boolean;
  status: string;
  id?: number;
  animal_id?: string;
  recipient?: string;
  message?: string;
  mode?: string;
  sent_at?: string;
  duplicate_suppressed?: boolean;
  note?: string;
  reason?: string;
}

