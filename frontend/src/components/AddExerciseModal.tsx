import { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import { exercisesAPI } from '../services/api';
import type { Exercise, ExerciseType, Intensity } from '../types';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingExercise?: Exercise | null;
}

export default function AddExerciseModal({
  isOpen,
  onClose,
  onSuccess,
  editingExercise,
}: AddExerciseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    exerciseType: 'CARDIO' as ExerciseType,
    duration: '',
    calories: '',
    distance: '',
    intensity: '' as Intensity | '',
    notes: '',
    performedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExercise) {
      setFormData({
        name: editingExercise.exerciseName,
        exerciseType: editingExercise.exerciseType,
        duration: editingExercise.duration.toString(),
        calories: editingExercise.calories?.toString() || '',
        distance: editingExercise.distance?.toString() || '',
        intensity: editingExercise.intensity || '',
        notes: editingExercise.notes || '',
        performedAt: format(new Date(editingExercise.loggedAt), "yyyy-MM-dd'T'HH:mm"),
      });
    } else {
      // Reset form when adding new
      setFormData({
        name: '',
        exerciseType: 'CARDIO',
        duration: '',
        calories: '',
        distance: '',
        intensity: '',
        notes: '',
        performedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [editingExercise, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        exerciseName: formData.name,
        exerciseType: formData.exerciseType,
        duration: parseFloat(formData.duration),
        calories: formData.calories ? parseFloat(formData.calories) : undefined,
        distance: formData.distance ? parseFloat(formData.distance) : undefined,
        intensity: formData.intensity || undefined,
        notes: formData.notes || undefined,
        loggedAt: new Date(formData.performedAt).toISOString(),
      };

      if (editingExercise) {
        await exercisesAPI.update(editingExercise.id, data);
      } else {
        await exercisesAPI.create(data);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tallennus epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingExercise ? 'Muokkaa merkintää' : 'Lisää liikuntamerkintä'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Exercise Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Liikunta *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="esim. Juoksu, Kuntosaliharjoittelu"
                required
              />
            </div>

            {/* Exercise Type */}
            <div>
              <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 mb-1">
                Liikuntatyyppi *
              </label>
              <select
                id="exerciseType"
                value={formData.exerciseType}
                onChange={(e) => setFormData({ ...formData, exerciseType: e.target.value as ExerciseType })}
                className="input"
                required
              >
                <option value="CARDIO">Kardio</option>
                <option value="STRENGTH">Voimaharjoittelu</option>
                <option value="FLEXIBILITY">Liikkuvuus</option>
                <option value="SPORTS">Urheilulajit</option>
                <option value="OTHER">Muu</option>
              </select>
            </div>

            {/* Duration and Calories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Kesto (min) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input"
                  placeholder="30"
                  step="1"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                  Kalorit (kcal)
                </label>
                <input
                  type="number"
                  id="calories"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="input"
                  placeholder="250"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            {/* Distance and Intensity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
                  Matka (km)
                </label>
                <input
                  type="number"
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  className="input"
                  placeholder="5.0"
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-1">
                  Intensiteetti
                </label>
                <select
                  id="intensity"
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: e.target.value as Intensity | '' })}
                  className="input"
                >
                  <option value="">Ei valittu</option>
                  <option value="LOW">Matala</option>
                  <option value="MODERATE">Kohtalainen</option>
                  <option value="HIGH">Korkea</option>
                </select>
              </div>
            </div>

            {/* Performed At */}
            <div>
              <label htmlFor="performedAt" className="block text-sm font-medium text-gray-700 mb-1">
                Ajankohta *
              </label>
              <input
                type="datetime-local"
                id="performedAt"
                value={formData.performedAt}
                onChange={(e) => setFormData({ ...formData, performedAt: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Muistiinpanot
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={3}
                placeholder="Esim. hyvä fiilis, polvi kipeä..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tallennetaan...' : editingExercise ? 'Tallenna muutokset' : 'Lisää merkintä'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Peruuta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
