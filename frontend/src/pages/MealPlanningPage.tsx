import { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, endOfWeek } from 'date-fns';
import { fi } from 'date-fns/locale';
import Layout from '../components/Layout';
import AddMealPlanModal from '../components/AddMealPlanModal';
import { mealPlansAPI } from '../services/api';
import type { MealPlan } from '../types';

type ViewMode = 'day' | 'week' | 'month';

export default function MealPlanningPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      let startDate: Date;
      let endDate: Date;

      if (viewMode === 'day') {
        startDate = currentDate;
        endDate = currentDate;
      } else if (viewMode === 'week') {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = addDays(startDate, 6);
      } else {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      }

      const data = await mealPlansAPI.getAll({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
      setMealPlans(data.mealPlans);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, [currentDate, viewMode]);

  const handleDelete = async (id: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän ateriasuunnitelman?')) return;

    try {
      await mealPlansAPI.delete(id);
      await fetchMealPlans();
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      alert('Poistaminen epäonnistui');
    }
  };

  const handleEdit = (mealPlan: MealPlan) => {
    setEditingMealPlan(mealPlan);
    setIsModalOpen(true);
  };

  const handleAddForDate = (date: Date) => {
    setSelectedDate(date);
    setEditingMealPlan(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMealPlan(null);
    setSelectedDate(null);
  };

  const handleSaveSuccess = () => {
    fetchMealPlans();
    handleModalClose();
  };

  const getMealPlanForDate = (date: Date) => {
    return mealPlans.find((mp) => isSameDay(new Date(mp.date), date));
  };

  const navigatePrev = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    } else if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      const prevMonth = new Date(currentDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentDate(prevMonth);
    }
  };

  const navigateNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentDate(nextMonth);
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const getViewTitle = () => {
    if (viewMode === 'day') {
      return format(currentDate, 'EEEE, d. MMMM yyyy', { locale: fi });
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'd.M.')} - ${format(weekEnd, 'd.M.yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy', { locale: fi });
    }
  };

  const renderDayView = () => {
    const mealPlan = getMealPlanForDate(currentDate);

    return (
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{format(currentDate, 'EEEE', { locale: fi })}</h2>
          {!mealPlan && (
            <button onClick={() => handleAddForDate(currentDate)} className="btn btn-primary">
              + Lisää ateriasuunnitelma
            </button>
          )}
        </div>
        {mealPlan ? (
          <DayCard mealPlan={mealPlan} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Ei ateriasuunnitelmaa tälle päivälle
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => {
          const mealPlan = getMealPlanForDate(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`card ${isToday ? 'border-2 border-primary-500' : ''}`}
            >
              <div className="text-center mb-3">
                <div className="text-xs text-gray-500 uppercase">
                  {format(day, 'EEE', { locale: fi })}
                </div>
                <div className={`text-lg font-bold ${isToday ? 'text-primary-600' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
              {mealPlan ? (
                <div className="space-y-2">
                  {mealPlan.dietType && (
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                      {mealPlan.dietType}
                    </span>
                  )}
                  <div className="text-sm space-y-1">
                    {mealPlan.meals.map((meal) => (
                      <div key={meal.id} className="text-xs text-gray-600">
                        <span className="font-medium">{getMealTypeEmoji(meal.mealType)}</span> {meal.name}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => handleEdit(mealPlan)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Muokkaa
                    </button>
                    <button
                      onClick={() => handleDelete(mealPlan.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Poista
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleAddForDate(day)}
                  className="text-xs text-gray-500 hover:text-primary-600 w-full text-center py-2"
                >
                  + Lisää
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const mealPlan = getMealPlanForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={day.toISOString()}
                className={`card min-h-[100px] ${isToday ? 'border-2 border-primary-500' : ''} ${
                  !isCurrentMonth ? 'opacity-40' : ''
                }`}
              >
                <div className="text-right mb-1">
                  <span className={`text-sm ${isToday ? 'font-bold text-primary-600' : 'text-gray-600'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                {mealPlan ? (
                  <div className="space-y-1">
                    {mealPlan.dietType && (
                      <span className="inline-block px-1 py-0.5 bg-primary-100 text-primary-700 text-[10px] rounded">
                        {mealPlan.dietType}
                      </span>
                    )}
                    <div className="text-[10px] text-gray-600">
                      {mealPlan.meals.length} ateriaa
                    </div>
                    <button
                      onClick={() => handleEdit(mealPlan)}
                      className="text-[10px] text-primary-600 hover:text-primary-700"
                    >
                      Katso
                    </button>
                  </div>
                ) : (
                  isCurrentMonth && (
                    <button
                      onClick={() => handleAddForDate(day)}
                      className="text-[10px] text-gray-400 hover:text-primary-600"
                    >
                      + Lisää
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ateriasuunnittelu</h1>
            <p className="text-gray-600 mt-1">Suunnittele ateriat etukäteen</p>
          </div>
          <button onClick={() => handleAddForDate(currentDate)} className="btn btn-primary">
            + Lisää ateriasuunnitelma
          </button>
        </div>

        {/* View controls */}
        <div className="card">
          <div className="flex justify-between items-center flex-wrap gap-4">
            {/* View mode selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'day'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Päivä
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Viikko
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Kuukausi
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button onClick={navigatePrev} className="btn btn-secondary">
                ←
              </button>
              <button onClick={navigateToday} className="btn btn-secondary">
                Tänään
              </button>
              <button onClick={navigateNext} className="btn btn-secondary">
                →
              </button>
            </div>

            {/* Current view title */}
            <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {getViewTitle()}
            </div>
          </div>
        </div>

        {/* Calendar view */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ladataan...</p>
          </div>
        ) : (
          <>
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddMealPlanModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSaveSuccess}
          editingMealPlan={editingMealPlan}
          preselectedDate={selectedDate}
        />
      )}
    </Layout>
  );
}

// Helper component for day details
function DayCard({
  mealPlan,
  onEdit,
  onDelete,
}: {
  mealPlan: MealPlan;
  onEdit: (mp: MealPlan) => void;
  onDelete: (id: string) => void;
}) {
  const totalCalories = mealPlan.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = mealPlan.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = mealPlan.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = mealPlan.meals.reduce((sum, m) => sum + (m.fat || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {mealPlan.dietType && (
          <div className="col-span-2 md:col-span-4">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
              {mealPlan.dietType}
            </span>
          </div>
        )}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Kalorit</p>
          <p className="text-lg font-bold text-blue-700">{totalCalories.toFixed(0)} kcal</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Proteiini</p>
          <p className="text-lg font-bold text-green-700">{totalProtein.toFixed(0)} g</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Hiilihydraatit</p>
          <p className="text-lg font-bold text-yellow-700">{totalCarbs.toFixed(0)} g</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Rasva</p>
          <p className="text-lg font-bold text-orange-700">{totalFat.toFixed(0)} g</p>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Ateriat</h3>
        {mealPlan.meals.map((meal) => (
          <div key={meal.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-2xl">{getMealTypeEmoji(meal.mealType)}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{meal.name}</p>
                {meal.description && <p className="text-sm text-gray-600">{meal.description}</p>}
                {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    {meal.calories && <span>{meal.calories} kcal</span>}
                    {meal.protein && <span>P: {meal.protein}g</span>}
                    {meal.carbs && <span>C: {meal.carbs}g</span>}
                    {meal.fat && <span>F: {meal.fat}g</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {mealPlan.notes && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 italic">{mealPlan.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onEdit(mealPlan)} className="btn btn-secondary">
          Muokkaa
        </button>
        <button onClick={() => onDelete(mealPlan.id)} className="btn btn-secondary text-red-600">
          Poista
        </button>
      </div>
    </div>
  );
}

function getMealTypeEmoji(mealType: string) {
  switch (mealType) {
    case 'BREAKFAST':
      return '🌅';
    case 'LUNCH':
      return '🍽️';
    case 'DINNER':
      return '🌙';
    case 'SNACK':
      return '🍎';
    default:
      return '🍴';
  }
}
