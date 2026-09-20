import axios from 'axios';
import {
  Animal,
  PredictionResponse,
  HerdSummary,
  Alert,
  ModelMetrics,
  SensorSimulateRequest,
  SMSNotification,
  SMSSettings,
  SMSSendResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSystemHealth = async () => {
  const res = await api.get('/');
  return res.data;
};

export const getAnimals = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  farm_id?: string;
  breed?: string;
  risk_category?: string;
  previous_mastitis?: number;
  sensor_status?: string;
}) => {
  const res = await api.get<{
    total: number;
    page: number;
    limit: number;
    animals: Animal[];
  }>('/animals', { params });
  return res.data;
};

export const getAnimalDetail = async (animalId: string) => {
  const res = await api.get<Animal>(`/animals/${animalId}`);
  return res.data;
};

export const runPrediction = async (animalData: Partial<Animal>) => {
  const res = await api.post<PredictionResponse>('/predict', animalData);
  return res.data;
};

export const getHerdSummary = async () => {
  const res = await api.get<HerdSummary>('/herd-summary');
  return res.data;
};

export const getAlerts = async () => {
  const res = await api.get<Alert[]>('/alerts');
  return res.data;
};

export const markAlertAsReviewed = async (alertId: number) => {
  const res = await api.post(`/alerts/${alertId}/review`);
  return res.data;
};

export const getAnalyticsData = async () => {
  const res = await api.get('/analytics');
  return res.data;
};

export const getModelMetrics = async () => {
  const res = await api.get<ModelMetrics>('/model-metrics');
  return res.data;
};

export const simulateSensorData = async (payload: SensorSimulateRequest) => {
  const res = await api.post('/simulate-sensor', payload);
  return res.data;
};

export const uploadCsvData = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload-data', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// ---------------------------------------------------------------------------
// SMS Notification API Functions
// ---------------------------------------------------------------------------

export const getSmsHistory = async (limit = 50): Promise<SMSNotification[]> => {
  const res = await api.get<SMSNotification[]>('/sms/history', { params: { limit } });
  return res.data;
};

export const getSmsSettings = async (): Promise<SMSSettings> => {
  const res = await api.get<SMSSettings>('/sms/settings');
  return res.data;
};

export const updateSmsSettings = async (settings: {
  enabled: boolean;
  farmer_phone: string;
  vet_phone: string;
  mode: string;
}): Promise<SMSSettings> => {
  const res = await api.post<SMSSettings>('/sms/settings', settings);
  return res.data;
};

export const sendTestSms = async (recipient: string): Promise<SMSSendResult> => {
  const res = await api.post<SMSSendResult>('/sms/test', { recipient, mode: 'SIMULATED' });
  return res.data;
};

export const sendSmsForAnimal = async (
  animal_id: string,
  recipient: string
): Promise<SMSSendResult> => {
  const res = await api.post<SMSSendResult>('/sms/send', { animal_id, recipient });
  return res.data;
};

export default api;
