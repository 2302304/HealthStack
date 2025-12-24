import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import AddSleepModal from '../components/AddSleepModal';
import { sleepLogsAPI } from '../services/api';
import type { SleepLog } from '../types';

export default function SleepPage() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [totals, setTotals] = useState({
    totalLogs: 0,
    totalDuration: 0,
    averageQuality: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSleep, setEditingSleep] = useState<SleepLog | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchSleepLogs = async () => {
    try {
      setLoading(true);
      const data = await sleepLogsAPI.getAll({
        startDate: selectedDate,
        endDate: selectedDate,
      });
      setSleepLogs(data.sleepLogs);
      setTotals(data.totals);
    } catch (error) {
      console.error('Error fetching sleep logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepLogs();
  }, [selectedDate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän merkinnän?')) return;

    try {
      await sleepLogsAPI.delete(id);
      await fetchSleepLogs();
    } catch (error) {
      console.error('Error deleting sleep log:', error);
      alert('Poistaminen epäonnistui');
    }
  };

  const handleEdit = (sleep: SleepLog) => {
    setEditingSleep(sleep);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSleep(null);
  };

  const handleSaveSuccess = () => {
    fetchSleepLogs();
    handleModalClose();
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-green-600';
    if (quality >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityEmoji = (quality: number) => {
    if (quality >= 8) return '😴';
    if (quality >= 6) return '😊';
    return '😫';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unipäiväkirja</h1>
            <p className="text-gray-600 mt-1">Seuraa unen laatua ja määrää</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card border-2 border-blue-200 bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">Unikerrat</p>
            <p className="text-2xl font-bold text-blue-700">
              {totals.totalLogs || 0}
              <span className="text-sm ml-1">kpl</span>
            </p>
          </div>
          <div className="card border-2 border-purple-200 bg-purple-50">
            <p className="text-sm text-gray-600 mb-1">Unen määrä</p>
            <p className="text-2xl font-bold text-purple-700">
              {(totals.totalDuration || 0).toFixed(1)}
              <span className="text-sm ml-1">h</span>
            </p>
          </div>
          <div className="card border-2 border-green-200 bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Keskiarvo laatu</p>
            <p className="text-2xl font-bold text-green-700">
              {(totals.averageQuality || 0).toFixed(1)}
              <span className="text-sm ml-1">/ 10</span>
            </p>
          </div>
        </div>

        {/* Sleep Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ladataan...</p>
          </div>
        ) : sleepLogs.length === 0 ? (
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
            <h2 className="text-xl font-semibold mb-4">Unimerkinnät</h2>
            <div className="space-y-3">
              {sleepLogs.map((sleep) => (
                <div
                  key={sleep.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getQualityEmoji(sleep.quality)}</span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(sleep.sleepStart), 'HH:mm')} - {format(new Date(sleep.sleepEnd), 'HH:mm')}
                          </p>
                          <div className="flex gap-4 mt-1 text-sm">
                            <span className="text-purple-600">
                              {sleep.duration.toFixed(1)} h
                            </span>
                            <span className={`font-medium ${getQualityColor(sleep.quality)}`}>
                              Laatu: {sleep.quality}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      {sleep.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{sleep.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(sleep)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Muokkaa
                      </button>
                      <button
                        onClick={() => handleDelete(sleep.id)}
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
        <AddSleepModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSaveSuccess}
          editingSleep={editingSleep}
        />
      )}
    </Layout>
  );
}
