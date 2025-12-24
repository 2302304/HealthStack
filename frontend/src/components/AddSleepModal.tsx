import { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import { sleepLogsAPI } from '../services/api';
import type { SleepLog } from '../types';

interface AddSleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSleep?: SleepLog | null;
}

export default function AddSleepModal({
  isOpen,
  onClose,
  onSuccess,
  editingSleep,
}: AddSleepModalProps) {
  const [formData, setFormData] = useState({
    sleepStart: '',
    sleepEnd: '',
    quality: '7',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSleep) {
      setFormData({
        sleepStart: format(new Date(editingSleep.sleepStart), "yyyy-MM-dd'T'HH:mm"),
        sleepEnd: format(new Date(editingSleep.sleepEnd), "yyyy-MM-dd'T'HH:mm"),
        quality: editingSleep.quality.toString(),
        notes: editingSleep.notes || '',
      });
    } else {
      // Default to yesterday evening to this morning
      const now = new Date();
      const thisMorning = new Date(now);
      thisMorning.setHours(7, 0, 0, 0);

      const lastNight = new Date(now);
      lastNight.setDate(lastNight.getDate() - 1);
      lastNight.setHours(23, 0, 0, 0);

      setFormData({
        sleepStart: format(lastNight, "yyyy-MM-dd'T'HH:mm"),
        sleepEnd: format(thisMorning, "yyyy-MM-dd'T'HH:mm"),
        quality: '7',
        notes: '',
      });
    }
  }, [editingSleep, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        sleepStart: new Date(formData.sleepStart).toISOString(),
        sleepEnd: new Date(formData.sleepEnd).toISOString(),
        quality: parseInt(formData.quality),
        notes: formData.notes || undefined,
      };

      if (editingSleep) {
        await sleepLogsAPI.update(editingSleep.id, data);
      } else {
        await sleepLogsAPI.create(data);
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
              {editingSleep ? 'Muokkaa unimerkintää' : 'Lisää unimerkintä'}
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
            {/* Sleep Start */}
            <div>
              <label htmlFor="sleepStart" className="block text-sm font-medium text-gray-700 mb-1">
                Nukahtumisaika *
              </label>
              <input
                type="datetime-local"
                id="sleepStart"
                value={formData.sleepStart}
                onChange={(e) => setFormData({ ...formData, sleepStart: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Sleep End */}
            <div>
              <label htmlFor="sleepEnd" className="block text-sm font-medium text-gray-700 mb-1">
                Heräämisaika *
              </label>
              <input
                type="datetime-local"
                id="sleepEnd"
                value={formData.sleepEnd}
                onChange={(e) => setFormData({ ...formData, sleepEnd: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Quality */}
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">
                Unen laatu: {formData.quality}/10
              </label>
              <input
                type="range"
                id="quality"
                min="1"
                max="10"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Huono</span>
                <span>Erinomainen</span>
              </div>
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
                placeholder="Esim. heräsin yöllä, unia painajaisia..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tallennetaan...' : editingSleep ? 'Tallenna muutokset' : 'Lisää merkintä'}
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
