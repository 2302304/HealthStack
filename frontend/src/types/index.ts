export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface FoodLog {
  id: string;
  userId: string;
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  mealType: MealType;
  servingSize?: string;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface CreateFoodLogInput {
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  mealType: MealType;
  servingSize?: string;
  notes?: string;
  loggedAt?: string;
}

export interface FoodLogsResponse {
  foodLogs: FoodLog[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  count: number;
}

export type ExerciseType = 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER';
export type Intensity = 'LOW' | 'MODERATE' | 'HIGH';

export interface Exercise {
  id: string;
  userId: string;
  exerciseName: string;
  exerciseType: ExerciseType;
  duration: number;
  calories?: number;
  distance?: number;
  intensity?: Intensity;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface CreateExerciseInput {
  exerciseName: string;
  exerciseType: ExerciseType;
  duration: number;
  calories?: number;
  distance?: number;
  intensity?: Intensity;
  notes?: string;
  loggedAt?: string;
}

export interface ExercisesResponse {
  exercises: Exercise[];
  totals: {
    totalExercises: number;
    totalDuration: number;
    totalCalories: number;
    totalDistance: number;
  };
}

// Sleep tracking
export interface SleepLog {
  id: string;
  userId: string;
  sleepStart: string;
  sleepEnd: string;
  duration: number;
  quality: number;
  notes?: string;
  createdAt: string;
}

export interface CreateSleepLogInput {
  sleepStart: string;
  sleepEnd: string;
  quality: number;
  notes?: string;
}

export interface SleepLogsResponse {
  sleepLogs: SleepLog[];
  totals: {
    totalLogs: number;
    totalDuration: number;
    averageQuality: number;
  };
}

// Mood tracking
export interface MoodLog {
  id: string;
  userId: string;
  mood: number;
  energy?: number;
  stress?: number;
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface CreateMoodLogInput {
  mood: number;
  energy?: number;
  stress?: number;
  notes?: string;
  loggedAt?: string;
}

export interface MoodLogsResponse {
  moodLogs: MoodLog[];
  totals: {
    totalLogs: number;
    averageMood: number;
    averageEnergy: number;
    averageStress: number;
  };
}
