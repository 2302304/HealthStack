import { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import { mealPlansAPI } from '../services/api';
import type { MealPlan, CreateMealInput, DietType, MealType } from '../types';

interface AddMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMealPlan?: MealPlan | null;
  preselectedDate?: Date | null;
}

export default function AddMealPlanModal({
  isOpen,
  onClose,
  onSuccess,
  editingMealPlan,
  preselectedDate,
}: AddMealPlanModalProps) {
  const [formData, setFormData] = useState({
    date: format(preselectedDate || new Date(), 'yyyy-MM-dd'),
    dietType: '' as DietType | '',
    targetCalories: '',
    targetProtein: '',
    targetCarbs: '',
    targetFat: '',
    notes: '',
  });
  const [meals, setMeals] = useState<CreateMealInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMealPlan) {
      setFormData({
        date: format(new Date(editingMealPlan.date), 'yyyy-MM-dd'),
        dietType: editingMealPlan.dietType || '',
        targetCalories: editingMealPlan.targetCalories?.toString() || '',
        targetProtein: editingMealPlan.targetProtein?.toString() || '',
        targetCarbs: editingMealPlan.targetCarbs?.toString() || '',
        targetFat: editingMealPlan.targetFat?.toString() || '',
        notes: editingMealPlan.notes || '',
      });
      setMeals(
        editingMealPlan.meals.map((m) => ({
          mealType: m.mealType,
          name: m.name,
          description: m.description || '',
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
        }))
      );
    } else {
      setFormData({
        date: format(preselectedDate || new Date(), 'yyyy-MM-dd'),
        dietType: '',
        targetCalories: '',
        targetProtein: '',
        targetCarbs: '',
        targetFat: '',
        notes: '',
      });
      setMeals([]);
    }
  }, [editingMealPlan, isOpen, preselectedDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        date: new Date(formData.date).toISOString(),
        dietType: formData.dietType || undefined,
        targetCalories: formData.targetCalories ? parseFloat(formData.targetCalories) : undefined,
        targetProtein: formData.targetProtein ? parseFloat(formData.targetProtein) : undefined,
        targetCarbs: formData.targetCarbs ? parseFloat(formData.targetCarbs) : undefined,
        targetFat: formData.targetFat ? parseFloat(formData.targetFat) : undefined,
        notes: formData.notes || undefined,
        meals: meals.length > 0 ? meals : undefined,
      };

      if (editingMealPlan) {
        await mealPlansAPI.update(editingMealPlan.id, data);
      } else {
        await mealPlansAPI.create(data);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Tallennus epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        mealType: 'BREAKFAST',
        name: '',
        description: '',
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined,
      },
    ]);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const updateMeal = (index: number, field: keyof CreateMealInput, value: any) => {
    const updatedMeals = [...meals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setMeals(updatedMeals);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingMealPlan ? 'Muokkaa ateriasuunnitelmaa' : 'Lisää ateriasuunnitelma'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Päivämäärä *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="dietType" className="block text-sm font-medium text-gray-700 mb-1">
                  Ruokavaliotyyppi
                </label>
                <select
                  id="dietType"
                  value={formData.dietType}
                  onChange={(e) => setFormData({ ...formData, dietType: e.target.value as DietType })}
                  className="input"
                >
                  <option value="">Ei valittu</option>
                  <option value="KETO">Keto</option>
                  <option value="PALEO">Paleo</option>
                  <option value="VEGAN">Vegaani</option>
                  <option value="VEGETARIAN">Kasvissyöjä</option>
                  <option value="MEDITERRANEAN">Välimeri</option>
                  <option value="BALANCED">Tasapainoinen</option>
                </select>
              </div>
            </div>

            {/* Targets */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Tavoitteet (valinnainen)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="targetCalories" className="block text-sm font-medium text-gray-700 mb-1">
                    Kalorit (kcal)
                  </label>
                  <input
                    type="number"
                    id="targetCalories"
                    value={formData.targetCalories}
                    onChange={(e) => setFormData({ ...formData, targetCalories: e.target.value })}
                    className="input"
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <label htmlFor="targetProtein" className="block text-sm font-medium text-gray-700 mb-1">
                    Proteiini (g)
                  </label>
                  <input
                    type="number"
                    id="targetProtein"
                    value={formData.targetProtein}
                    onChange={(e) => setFormData({ ...formData, targetProtein: e.target.value })}
                    className="input"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label htmlFor="targetCarbs" className="block text-sm font-medium text-gray-700 mb-1">
                    Hiilihydraatit (g)
                  </label>
                  <input
                    type="number"
                    id="targetCarbs"
                    value={formData.targetCarbs}
                    onChange={(e) => setFormData({ ...formData, targetCarbs: e.target.value })}
                    className="input"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label htmlFor="targetFat" className="block text-sm font-medium text-gray-700 mb-1">
                    Rasva (g)
                  </label>
                  <input
                    type="number"
                    id="targetFat"
                    value={formData.targetFat}
                    onChange={(e) => setFormData({ ...formData, targetFat: e.target.value })}
                    className="input"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Meals */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Ateriat</h3>
                <button
                  type="button"
                  onClick={addMeal}
                  className="btn btn-secondary text-sm"
                >
                  + Lisää ateria
                </button>
              </div>

              {meals.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Ei lisättyjä aterioita</p>
                  <button
                    type="button"
                    onClick={addMeal}
                    className="btn btn-primary mt-3"
                  >
                    Lisää ensimmäinen ateria
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {meals.map((meal, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">Ateria {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeMeal(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Poista
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ateriatyyppi *
                          </label>
                          <select
                            value={meal.mealType}
                            onChange={(e) => updateMeal(index, 'mealType', e.target.value as MealType)}
                            className="input"
                            required
                          >
                            <option value="BREAKFAST">Aamupala</option>
                            <option value="LUNCH">Lounas</option>
                            <option value="DINNER">Päivällinen</option>
                            <option value="SNACK">Välipala</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nimi *
                          </label>
                          <input
                            type="text"
                            value={meal.name}
                            onChange={(e) => updateMeal(index, 'name', e.target.value)}
                            className="input"
                            placeholder="Esim. Kaurapuuro"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kuvaus
                          </label>
                          <input
                            type="text"
                            value={meal.description || ''}
                            onChange={(e) => updateMeal(index, 'description', e.target.value)}
                            className="input"
                            placeholder="Esim. Kaurapuuro mansikoilla ja manteleilla"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kalorit (kcal)
                          </label>
                          <input
                            type="number"
                            value={meal.calories || ''}
                            onChange={(e) => updateMeal(index, 'calories', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="input"
                            min="0"
                            step="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proteiini (g)
                          </label>
                          <input
                            type="number"
                            value={meal.protein || ''}
                            onChange={(e) => updateMeal(index, 'protein', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="input"
                            min="0"
                            step="0.1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hiilihydraatit (g)
                          </label>
                          <input
                            type="number"
                            value={meal.carbs || ''}
                            onChange={(e) => updateMeal(index, 'carbs', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="input"
                            min="0"
                            step="0.1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rasva (g)
                          </label>
                          <input
                            type="number"
                            value={meal.fat || ''}
                            onChange={(e) => updateMeal(index, 'fat', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="input"
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                placeholder="Esim. Valmista aamupala edellisenä iltana"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tallennetaan...' : editingMealPlan ? 'Tallenna muutokset' : 'Lisää suunnitelma'}
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
