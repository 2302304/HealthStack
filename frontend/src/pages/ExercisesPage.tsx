import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import AddExerciseModal from '../components/AddExerciseModal';
import { exercisesAPI } from '../services/api';
import type { Exercise } from '../types';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totals, setTotals] = useState({
    totalExercises: 0,
    totalDuration: 0,
    totalCalories: 0,
    totalDistance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await exercisesAPI.getAll({
        startDate: selectedDate,
        endDate: selectedDate,
      });
      setExercises(data.exercises);
      setTotals(data.totals);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [selectedDate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän merkinnän?')) return;

    try {
      await exercisesAPI.delete(id);
      await fetchExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Poistaminen epäonnistui');
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  const handleSaveSuccess = () => {
    fetchExercises();
    handleModalClose();
  };

  const getExerciseTypeName = (exerciseType: string) => {
    const names: Record<string, string> = {
      CARDIO: 'Kardio',
      STRENGTH: 'Voimaharjoittelu',
      FLEXIBILITY: 'Liikkuvuus',
      SPORTS: 'Urheilulajit',
      OTHER: 'Muu',
    };
    return names[exerciseType] || exerciseType;
  };

  const getExerciseTypeIcon = (exerciseType: string) => {
    const icons: Record<string, string> = {
      CARDIO: '🏃',
      STRENGTH: '💪',
      FLEXIBILITY: '🧘',
      SPORTS: '⚽',
      OTHER: '🏋️',
    };
    return icons[exerciseType] || '🏋️';
  };

  const getIntensityName = (intensity: string | undefined) => {
    if (!intensity) return '';
    const names: Record<string, string> = {
      LOW: 'Matala',
      MODERATE: 'Kohtalainen',
      HIGH: 'Korkea',
    };
    return names[intensity] || intensity;
  };

  // Group exercises by type
  const groupedExercises = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.exerciseType]) {
      acc[exercise.exerciseType] = [];
    }
    acc[exercise.exerciseType].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const exerciseTypeOrder = ['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'SPORTS', 'OTHER'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Liikuntapäiväkirja</h1>
            <p className="text-gray-600 mt-1">Seuraa harjoitteluasi</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            + Lisää merkintä
          </button>
        </div>

        {/* Date Picker */}
        <div className="card">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Valitse päivämäärä
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input max-w-xs"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card border-2 border-purple-200 bg-purple-50">
            <p className="text-sm text-gray-600 mb-1">Harjoituksia</p>
            <p className="text-2xl font-bold text-purple-700">
              {totals.totalExercises}
              <span className="text-sm ml-1">kpl</span>
            </p>
          </div>
          <div className="card border-2 border-blue-200 bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">Kesto</p>
            <p className="text-2xl font-bold text-blue-700">
              {Math.round(totals.totalDuration)}
              <span className="text-sm ml-1">min</span>
            </p>
          </div>
          <div className="card border-2 border-orange-200 bg-orange-50">
            <p className="text-sm text-gray-600 mb-1">Kalorit</p>
            <p className="text-2xl font-bold text-orange-700">
              {Math.round(totals.totalCalories)}
              <span className="text-sm ml-1">kcal</span>
            </p>
          </div>
          <div className="card border-2 border-green-200 bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Matka</p>
            <p className="text-2xl font-bold text-green-700">
              {(totals.totalDistance || 0).toFixed(1)}
              <span className="text-sm ml-1">km</span>
            </p>
          </div>
        </div>

        {/* Exercise Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ladataan...</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">Ei merkintöjä tälle päivälle</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary mt-4"
            >
              Lisää ensimmäinen merkintä
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {exerciseTypeOrder.map((exerciseType) => {
              const logs = groupedExercises[exerciseType];
              if (!logs || logs.length === 0) return null;

              return (
                <div key={exerciseType} className="card">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">{getExerciseTypeIcon(exerciseType)}</span>
                    {getExerciseTypeName(exerciseType)}
                  </h2>
                  <div className="space-y-3">
                    {logs.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{exercise.exerciseName}</h3>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-blue-600">{Math.round(exercise.duration)} min</span>
                              {exercise.calories !== undefined && (
                                <span className="text-orange-600">{Math.round(exercise.calories)} kcal</span>
                              )}
                              {exercise.distance !== undefined && (
                                <span className="text-green-600">{exercise.distance.toFixed(1)} km</span>
                              )}
                              {exercise.intensity && (
                                <span className="text-purple-600">
                                  Intensiteetti: {getIntensityName(exercise.intensity)}
                                </span>
                              )}
                            </div>
                            {exercise.notes && (
                              <p className="text-sm text-gray-500 mt-2 italic">{exercise.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(exercise)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Muokkaa
                            </button>
                            <button
                              onClick={() => handleDelete(exercise.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Poista
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddExerciseModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSaveSuccess}
          editingExercise={editingExercise}
        />
      )}
    </Layout>
  );
}
