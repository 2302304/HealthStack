import { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import { moodLogsAPI } from '../services/api';
import type { MoodLog } from '../types';

interface AddMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMood?: MoodLog | null;
}

export default function AddMoodModal({
  isOpen,
  onClose,
  onSuccess,
  editingMood,
}: AddMoodModalProps) {
  const [formData, setFormData] = useState({
    mood: '5',
    energy: '',
    stress: '',
    notes: '',
    loggedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMood) {
      setFormData({
        mood: editingMood.mood.toString(),
        energy: editingMood.energy?.toString() || '',
        stress: editingMood.stress?.toString() || '',
        notes: editingMood.notes || '',
        loggedAt: format(new Date(editingMood.loggedAt), "yyyy-MM-dd'T'HH:mm"),
      });
    } else {
      setFormData({
        mood: '5',
        energy: '',
        stress: '',
        notes: '',
        loggedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [editingMood, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        mood: parseInt(formData.mood),
        energy: formData.energy ? parseInt(formData.energy) : undefined,
        stress: formData.stress ? parseInt(formData.stress) : undefined,
        notes: formData.notes || undefined,
        loggedAt: new Date(formData.loggedAt).toISOString(),
      };

      if (editingMood) {
        await moodLogsAPI.update(editingMood.id, data);
      } else {
        await moodLogsAPI.create(data);
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
              {editingMood ? 'Muokkaa mielialamerkintää' : 'Lisää mielialamerkintä'}
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
            {/* Mood */}
            <div>
              <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
                Mieliala: {formData.mood}/10 *
              </label>
              <input
                type="range"
                id="mood"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>😢 Huono</span>
                <span>😄 Erinomainen</span>
              </div>
            </div>

            {/* Energy */}
            <div>
              <label htmlFor="energy" className="block text-sm font-medium text-gray-700 mb-1">
                Energia: {formData.energy ? `${formData.energy}/10` : 'Ei valittu'}
              </label>
              <input
                type="range"
                id="energy"
                min="1"
                max="10"
                value={formData.energy}
                onChange={(e) => setFormData({ ...formData, energy: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>⚡ Vähän</span>
                <span>⚡⚡⚡ Paljon</span>
              </div>
            </div>

            {/* Stress */}
            <div>
              <label htmlFor="stress" className="block text-sm font-medium text-gray-700 mb-1">
                Stressi: {formData.stress ? `${formData.stress}/10` : 'Ei valittu'}
              </label>
              <input
                type="range"
                id="stress"
                min="1"
                max="10"
                value={formData.stress}
                onChange={(e) => setFormData({ ...formData, stress: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>😌 Vähän</span>
                <span>😰 Paljon</span>
              </div>
            </div>

            {/* Logged At */}
            <div>
              <label htmlFor="loggedAt" className="block text-sm font-medium text-gray-700 mb-1">
                Ajankohta *
              </label>
              <input
                type="datetime-local"
                id="loggedAt"
                value={formData.loggedAt}
                onChange={(e) => setFormData({ ...formData, loggedAt: e.target.value })}
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
                placeholder="Mitä tunteita tai ajatuksia sinulla on?"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tallennetaan...' : editingMood ? 'Tallenna muutokset' : 'Lisää merkintä'}
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
