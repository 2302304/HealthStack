import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import AddFoodLogModal from '../components/AddFoodLogModal';
import { foodLogsAPI } from '../services/api';
import type { FoodLog } from '../types';

export default function FoodLogsPage() {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchFoodLogs = async () => {
    try {
      setLoading(true);
      const data = await foodLogsAPI.getAll({
        startDate: selectedDate,
        endDate: selectedDate,
      });
      setFoodLogs(data.foodLogs);
      setTotals(data.totals);
    } catch (error) {
      console.error('Error fetching food logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodLogs();
  }, [selectedDate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän merkinnän?')) return;

    try {
      await foodLogsAPI.delete(id);
      await fetchFoodLogs();
    } catch (error) {
      console.error('Error deleting food log:', error);
      alert('Poistaminen epäonnistui');
    }
  };

  const handleEdit = (log: FoodLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLog(null);
  };

  const handleSaveSuccess = () => {
    fetchFoodLogs();
    handleModalClose();
  };

  const getMealTypeName = (mealType: string) => {
    const names: Record<string, string> = {
      BREAKFAST: 'Aamiainen',
      LUNCH: 'Lounas',
      DINNER: 'Päivällinen',
      SNACK: 'Välipala',
    };
    return names[mealType] || mealType;
  };

  const getMealTypeIcon = (mealType: string) => {
    const icons: Record<string, string> = {
      BREAKFAST: '🌅',
      LUNCH: '🍽️',
      DINNER: '🌙',
      SNACK: '🍎',
    };
    return icons[mealType] || '🍴';
  };

  // Group logs by meal type
  const groupedLogs = foodLogs.reduce((acc, log) => {
    if (!acc[log.mealType]) {
      acc[log.mealType] = [];
    }
    acc[log.mealType].push(log);
    return acc;
  }, {} as Record<string, FoodLog[]>);

  const mealTypeOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ruokapäiväkirja</h1>
            <p className="text-gray-600 mt-1">Seuraa päivittäistä ravintosi</p>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card border-2 border-orange-200 bg-orange-50">
            <p className="text-sm text-gray-600 mb-1">Kalorit</p>
            <p className="text-2xl font-bold text-orange-700">
              {Math.round(totals.calories)}
              <span className="text-sm ml-1">kcal</span>
            </p>
          </div>
          <div className="card border-2 border-blue-200 bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">Proteiini</p>
            <p className="text-2xl font-bold text-blue-700">
              {Math.round(totals.protein)}
              <span className="text-sm ml-1">g</span>
            </p>
          </div>
          <div className="card border-2 border-yellow-200 bg-yellow-50">
            <p className="text-sm text-gray-600 mb-1">Hiilihydraatit</p>
            <p className="text-2xl font-bold text-yellow-700">
              {Math.round(totals.carbs)}
              <span className="text-sm ml-1">g</span>
            </p>
          </div>
          <div className="card border-2 border-red-200 bg-red-50">
            <p className="text-sm text-gray-600 mb-1">Rasva</p>
            <p className="text-2xl font-bold text-red-700">
              {Math.round(totals.fat)}
              <span className="text-sm ml-1">g</span>
            </p>
          </div>
          <div className="card border-2 border-green-200 bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Kuitu</p>
            <p className="text-2xl font-bold text-green-700">
              {Math.round(totals.fiber)}
              <span className="text-sm ml-1">g</span>
            </p>
          </div>
        </div>

        {/* Food Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ladataan...</p>
          </div>
        ) : foodLogs.length === 0 ? (
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
            {mealTypeOrder.map((mealType) => {
              const logs = groupedLogs[mealType];
              if (!logs || logs.length === 0) return null;

              return (
                <div key={mealType} className="card">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">{getMealTypeIcon(mealType)}</span>
                    {getMealTypeName(mealType)}
                  </h2>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{log.foodName}</h3>
                            {log.servingSize && (
                              <p className="text-sm text-gray-600">{log.servingSize}</p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-orange-600">{Math.round(log.calories)} kcal</span>
                              {log.protein !== undefined && (
                                <span className="text-blue-600">P: {Math.round(log.protein)}g</span>
                              )}
                              {log.carbs !== undefined && (
                                <span className="text-yellow-600">C: {Math.round(log.carbs)}g</span>
                              )}
                              {log.fat !== undefined && (
                                <span className="text-red-600">F: {Math.round(log.fat)}g</span>
                              )}
                            </div>
                            {log.notes && (
                              <p className="text-sm text-gray-500 mt-2 italic">{log.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(log)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Muokkaa
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
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
        <AddFoodLogModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSaveSuccess}
          editingLog={editingLog}
        />
      )}
    </Layout>
  );
}
