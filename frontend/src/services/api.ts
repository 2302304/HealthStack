import axios from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  FoodLogsResponse,
  CreateFoodLogInput,
  FoodLog,
  ExercisesResponse,
  CreateExerciseInput,
  Exercise,
  SleepLogsResponse,
  CreateSleepLogInput,
  SleepLog,
  MoodLogsResponse,
  CreateMoodLogInput,
  MoodLog,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data} = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data;
  },
};

// Food Logs API
export const foodLogsAPI = {
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    mealType?: string;
  }): Promise<FoodLogsResponse> => {
    const { data } = await api.get<FoodLogsResponse>('/food-logs', { params });
    return data;
  },

  getById: async (id: string): Promise<{ foodLog: FoodLog }> => {
    const { data } = await api.get<{ foodLog: FoodLog }>(`/food-logs/${id}`);
    return data;
  },

  create: async (input: CreateFoodLogInput): Promise<{ message: string; foodLog: FoodLog }> => {
    const { data } = await api.post<{ message: string; foodLog: FoodLog }>('/food-logs', input);
    return data;
  },

  update: async (
    id: string,
    input: Partial<CreateFoodLogInput>
  ): Promise<{ message: string; foodLog: FoodLog }> => {
    const { data } = await api.put<{ message: string; foodLog: FoodLog }>(`/food-logs/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/food-logs/${id}`);
    return data;
  },
};

// Exercises API
export const exercisesAPI = {
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    exerciseType?: string;
  }): Promise<ExercisesResponse> => {
    const { data } = await api.get<ExercisesResponse>('/exercises', { params });
    return data;
  },

  getById: async (id: string): Promise<{ exercise: Exercise }> => {
    const { data } = await api.get<{ exercise: Exercise }>(`/exercises/${id}`);
    return data;
  },

  create: async (input: CreateExerciseInput): Promise<{ message: string; exercise: Exercise }> => {
    const { data } = await api.post<{ message: string; exercise: Exercise }>('/exercises', input);
    return data;
  },

  update: async (
    id: string,
    input: Partial<CreateExerciseInput>
  ): Promise<{ message: string; exercise: Exercise }> => {
    const { data } = await api.put<{ message: string; exercise: Exercise }>(`/exercises/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/exercises/${id}`);
    return data;
  },
};

// Sleep Logs API
export const sleepLogsAPI = {
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<SleepLogsResponse> => {
    const { data } = await api.get<SleepLogsResponse>('/sleep-logs', { params });
    return data;
  },

  getById: async (id: string): Promise<{ sleepLog: SleepLog }> => {
    const { data} = await api.get<{ sleepLog: SleepLog }>(`/sleep-logs/${id}`);
    return data;
  },

  create: async (input: CreateSleepLogInput): Promise<{ message: string; sleepLog: SleepLog }> => {
    const { data } = await api.post<{ message: string; sleepLog: SleepLog }>('/sleep-logs', input);
    return data;
  },

  update: async (
    id: string,
    input: Partial<CreateSleepLogInput>
  ): Promise<{ message: string; sleepLog: SleepLog }> => {
    const { data } = await api.put<{ message: string; sleepLog: SleepLog }>(`/sleep-logs/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/sleep-logs/${id}`);
    return data;
  },
};

// Mood Logs API
export const moodLogsAPI = {
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<MoodLogsResponse> => {
    const { data } = await api.get<MoodLogsResponse>('/mood-logs', { params });
    return data;
  },

  getById: async (id: string): Promise<{ moodLog: MoodLog }> => {
    const { data } = await api.get<{ moodLog: MoodLog }>(`/mood-logs/${id}`);
    return data;
  },

  create: async (input: CreateMoodLogInput): Promise<{ message: string; moodLog: MoodLog }> => {
    const { data } = await api.post<{ message: string; moodLog: MoodLog }>('/mood-logs', input);
    return data;
  },

  update: async (
    id: string,
    input: Partial<CreateMoodLogInput>
  ): Promise<{ message: string; moodLog: MoodLog }> => {
    const { data } = await api.put<{ message: string; moodLog: MoodLog }>(`/mood-logs/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/mood-logs/${id}`);
    return data;
  },
};

export default api;
