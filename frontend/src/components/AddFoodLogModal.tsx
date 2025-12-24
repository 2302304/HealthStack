import { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import { foodLogsAPI } from '../services/api';
import type { FoodLog, MealType } from '../types';

interface AddFoodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingLog?: FoodLog | null;
}

export default function AddFoodLogModal({
  isOpen,
  onClose,
  onSuccess,
  editingLog,
}: AddFoodLogModalProps) {
  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    mealType: 'BREAKFAST' as MealType,
    servingSize: '',
    notes: '',
    loggedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLog) {
      setFormData({
        foodName: editingLog.foodName,
        calories: editingLog.calories.toString(),
        protein: editingLog.protein?.toString() || '',
        carbs: editingLog.carbs?.toString() || '',
        fat: editingLog.fat?.toString() || '',
        fiber: editingLog.fiber?.toString() || '',
        mealType: editingLog.mealType,
        servingSize: editingLog.servingSize || '',
        notes: editingLog.notes || '',
        loggedAt: format(new Date(editingLog.loggedAt), "yyyy-MM-dd'T'HH:mm"),
      });
    } else {
      // Reset form when adding new
      setFormData({
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        mealType: 'BREAKFAST',
        servingSize: '',
        notes: '',
        loggedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      });
    }
  }, [editingLog, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        foodName: formData.foodName,
        calories: parseFloat(formData.calories),
        protein: formData.protein ? parseFloat(formData.protein) : undefined,
        carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
        fat: formData.fat ? parseFloat(formData.fat) : undefined,
        fiber: formData.fiber ? parseFloat(formData.fiber) : undefined,
        mealType: formData.mealType,
        servingSize: formData.servingSize || undefined,
        notes: formData.notes || undefined,
        loggedAt: new Date(formData.loggedAt).toISOString(),
      };

      if (editingLog) {
        await foodLogsAPI.update(editingLog.id, data);
      } else {
        await foodLogsAPI.create(data);
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
              {editingLog ? 'Muokkaa merkintää' : 'Lisää ruokamerkintä'}
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
            {/* Food Name */}
            <div>
              <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 mb-1">
                Ruoka *
              </label>
              <input
                type="text"
                id="foodName"
                value={formData.foodName}
                onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                className="input"
                placeholder="esim. Kaurapuuro"
                required
              />
            </div>

            {/* Meal Type and Serving Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
                  Ateriatyyppi *
                </label>
                <select
                  id="mealType"
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value as MealType })}
                  className="input"
                  required
                >
                  <option value="BREAKFAST">Aamiainen</option>
                  <option value="LUNCH">Lounas</option>
                  <option value="DINNER">Päivällinen</option>
                  <option value="SNACK">Välipala</option>
                </select>
              </div>

              <div>
                <label htmlFor="servingSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Annoskoko
                </label>
                <input
                  type="text"
                  id="servingSize"
                  value={formData.servingSize}
                  onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                  className="input"
                  placeholder="esim. 1 kulho, 100g"
                />
              </div>
            </div>

            {/* Calories */}
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                Kalorit (kcal) *
              </label>
              <input
                type="number"
                id="calories"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="input"
                placeholder="350"
                step="0.1"
                min="0"
                required
              />
            </div>

            {/* Macros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
                  Proteiini (g)
                </label>
                <input
                  type="number"
                  id="protein"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  className="input"
                  placeholder="12"
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
                  Hiilihydr. (g)
                </label>
                <input
                  type="number"
                  id="carbs"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  className="input"
                  placeholder="55"
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
                  Rasva (g)
                </label>
                <input
                  type="number"
                  id="fat"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  className="input"
                  placeholder="8"
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="fiber" className="block text-sm font-medium text-gray-700 mb-1">
                  Kuitu (g)
                </label>
                <input
                  type="number"
                  id="fiber"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                  className="input"
                  placeholder="10"
                  step="0.1"
                  min="0"
                />
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
                placeholder="Esim. kotitekoinen, ravintolalounas..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tallennetaan...' : editingLog ? 'Tallenna muutokset' : 'Lisää merkintä'}
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
