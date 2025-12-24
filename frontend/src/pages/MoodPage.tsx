import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import AddMoodModal from '../components/AddMoodModal';
import { moodLogsAPI } from '../services/api';
import type { MoodLog } from '../types';

export default function MoodPage() {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [totals, setTotals] = useState({
    totalLogs: 0,
    averageMood: 0,
    averageEnergy: 0,
    averageStress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState<MoodLog | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchMoodLogs = async () => {
    try {
      setLoading(true);
      const data = await moodLogsAPI.getAll({
        startDate: selectedDate,
        endDate: selectedDate,
      });
      setMoodLogs(data.moodLogs);
      setTotals(data.totals);
    } catch (error) {
      console.error('Error fetching mood logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodLogs();
  }, [selectedDate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän merkinnän?')) return;

    try {
      await moodLogsAPI.delete(id);
      await fetchMoodLogs();
    } catch (error) {
      console.error('Error deleting mood log:', error);
      alert('Poistaminen epäonnistui');
    }
  };

  const handleEdit = (mood: MoodLog) => {
    setEditingMood(mood);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMood(null);
  };

  const handleSaveSuccess = () => {
    fetchMoodLogs();
    handleModalClose();
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😢';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-yellow-600';
    if (mood >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mielialapäiväkirja</h1>
            <p className="text-gray-600 mt-1">Seuraa mielialaasi, energiaa ja stressiä</p>
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
          <div className="card border-2 border-blue-200 bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">Merkintöjä</p>
            <p className="text-2xl font-bold text-blue-700">
              {totals.totalLogs || 0}
              <span className="text-sm ml-1">kpl</span>
            </p>
          </div>
          <div className="card border-2 border-purple-200 bg-purple-50">
            <p className="text-sm text-gray-600 mb-1">Keskim. mieliala</p>
            <p className="text-2xl font-bold text-purple-700">
              {(totals.averageMood || 0).toFixed(1)}
              <span className="text-sm ml-1">/ 10</span>
            </p>
          </div>
          <div className="card border-2 border-green-200 bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Keskim. energia</p>
            <p className="text-2xl font-bold text-green-700">
              {(totals.averageEnergy || 0).toFixed(1)}
              <span className="text-sm ml-1">/ 10</span>
            </p>
          </div>
          <div className="card border-2 border-orange-200 bg-orange-50">
            <p className="text-sm text-gray-600 mb-1">Keskim. stressi</p>
            <p className="text-2xl font-bold text-orange-700">
              {(totals.averageStress || 0).toFixed(1)}
              <span className="text-sm ml-1">/ 10</span>
            </p>
          </div>
        </div>

        {/* Mood Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ladataan...</p>
          </div>
        ) : moodLogs.length === 0 ? (
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
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Mielialamerkinnät</h2>
            <div className="space-y-3">
              {moodLogs.map((mood) => (
                <div
                  key={mood.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getMoodEmoji(mood.mood)}</span>
                        <div>
                          <p className="text-sm text-gray-500">
                            {format(new Date(mood.loggedAt), 'HH:mm')}
                          </p>
                          <div className="flex gap-4 mt-1 text-sm">
                            <span className={`font-medium ${getMoodColor(mood.mood)}`}>
                              Mieliala: {mood.mood}/10
                            </span>
                            {mood.energy !== undefined && mood.energy !== null && (
                              <span className="text-green-600">
                                Energia: {mood.energy}/10
                              </span>
                            )}
                            {mood.stress !== undefined && mood.stress !== null && (
                              <span className="text-orange-600">
                                Stressi: {mood.stress}/10
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {mood.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{mood.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(mood)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Muokkaa
                      </button>
                      <button
                        onClick={() => handleDelete(mood.id)}
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddMoodModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSaveSuccess}
          editingMood={editingMood}
        />
      )}
    </Layout>
  );
}
