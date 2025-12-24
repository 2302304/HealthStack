import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { foodLogsAPI, exercisesAPI } from '../services/api';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayCalories: 0,
    todayProtein: 0,
    todayExercises: 0,
    todayExerciseMinutes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');

        const [foodData, exerciseData] = await Promise.all([
          foodLogsAPI.getAll({ startDate: today, endDate: today }),
          exercisesAPI.getAll({ startDate: today, endDate: today }),
        ]);

        setStats({
          todayCalories: foodData.totals.calories,
          todayProtein: foodData.totals.protein,
          todayExercises: exerciseData.totals.totalExercises,
          todayExerciseMinutes: exerciseData.totals.totalDuration,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayStats();
  }, []);

  const statCards = [
    {
      label: 'Kalorit tänään',
      value: loading ? '-' : Math.round(stats.todayCalories),
      unit: 'kcal',
      icon: '🔥',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-700',
    },
    {
      label: 'Proteiini tänään',
      value: loading ? '-' : Math.round(stats.todayProtein),
      unit: 'g',
      icon: '💪',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      label: 'Harjoitukset tänään',
      value: loading ? '-' : stats.todayExercises,
      unit: 'kpl',
      icon: '🏃',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
    },
    {
      label: 'Liikunta tänään',
      value: loading ? '-' : stats.todayExerciseMinutes,
      unit: 'min',
      icon: '⏱️',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), "EEEE, d. MMMM yyyy")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`card border-2 ${stat.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                    <span className="text-lg ml-1">{stat.unit}</span>
                  </p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Pikalinkit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/food-logs"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🍽️</span>
                <div>
                  <h3 className="font-medium text-gray-900">Lisää ruokamerkintä</h3>
                  <p className="text-sm text-gray-600">Kirjaa tänään syödyt ateriat</p>
                </div>
              </div>
            </a>

            <a
              href="/exercises"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">💪</span>
                <div>
                  <h3 className="font-medium text-gray-900">Lisää harjoitus</h3>
                  <p className="text-sm text-gray-600">Kirjaa liikuntasuoritukset</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <h2 className="text-2xl font-bold mb-2">Tervetuloa HealthStackiin!</h2>
          <p className="text-primary-50">
            Aloita päiväsi kirjaamalla aamiainen tai aamun harjoitus. Seuraa edistymistäsi ja saavuta tavoitteesi!
          </p>
        </div>
      </div>
    </Layout>
  );
}
