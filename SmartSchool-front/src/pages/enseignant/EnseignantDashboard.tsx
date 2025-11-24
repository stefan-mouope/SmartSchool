import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Clock, Users, BarChart3, Award } from 'lucide-react';

interface Note {
  id: number;
  id_inscription: number;
  id_matiere: number;
  sequence1: number;
  sequence2: number;
  sequence3: number;
  sequence4: number;
  sequence5: number;
  sequence6: number;
  created_at?: string;
}

const EnseignantDashboard: React.FC = () => {
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [idMatiere, setIdMatiere] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const fetchRecentNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/notes/matiere/${idMatiere}/`
      );
      if (response.ok) {
        const data = await response.json();
        // Trier par ID décroissant pour avoir les plus récents
        const sorted = data.sort((a: Note, b: Note) => b.id - a.id);
        setRecentNotes(sorted.slice(0, 10)); // 10 dernières notes
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentNotes();
  }, [idMatiere]);

  const calculateTrimestre = (seq1: number, seq2: number) => {
    return ((seq1 + seq2) / 2).toFixed(2);
  };

  const calculateMoyenneGenerale = (note: Note) => {
    const t1 = (note.sequence1 + note.sequence2) / 2;
    const t2 = (note.sequence3 + note.sequence4) / 2;
    const t3 = (note.sequence5 + note.sequence6) / 2;
    return ((t1 + t2 + t3) / 3).toFixed(2);
  };

  const calculateStats = () => {
    if (recentNotes.length === 0) return { moyenne: 0, min: 0, max: 0, total: 0 };
    
    const moyennes = recentNotes.map(note => parseFloat(calculateMoyenneGenerale(note)));
    return {
      moyenne: (moyennes.reduce((a, b) => a + b, 0) / moyennes.length).toFixed(2),
      min: Math.min(...moyennes).toFixed(2),
      max: Math.max(...moyennes).toFixed(2),
      total: recentNotes.length
    };
  };

  const stats = calculateStats();

  const getColorForNote = (note: number) => {
    if (note >= 15) return 'text-green-600 bg-green-50';
    if (note >= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Tableau de Bord Enseignant
              </h1>
              <p className="text-gray-600">Vue d'ensemble et statistiques de votre matière</p>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-lg shadow-md p-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <div>
                <label className="text-sm text-gray-600 block">Matière</label>
                <input
                  type="number"
                  value={idMatiere}
                  onChange={(e) => setIdMatiere(Number(e.target.value))}
                  className="font-bold text-lg border-none focus:outline-none w-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <BarChart3 className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Étudiants</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <Award className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-green-100 text-sm mb-1">Moyenne Classe</p>
            <p className="text-4xl font-bold">{stats.moyenne} / 20</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-orange-100 text-sm mb-1">Meilleure Note</p>
            <p className="text-4xl font-bold">{stats.max} / 20</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-red-100 text-sm mb-1">Note la Plus Basse</p>
            <p className="text-4xl font-bold">{stats.min} / 20</p>
          </div>
        </div>

        {/* Recent Notes Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Notes Récentes</h2>
              </div>
              <button
                onClick={fetchRecentNotes}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Actualiser
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune note enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Étudiant (Inscription)</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Trimestre 1</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Trimestre 2</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Trimestre 3</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Moyenne Générale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentNotes.map((note) => {
                    const t1 = calculateTrimestre(note.sequence1, note.sequence2);
                    const t2 = calculateTrimestre(note.sequence3, note.sequence4);
                    const t3 = calculateTrimestre(note.sequence5, note.sequence6);
                    const moyGen = calculateMoyenneGenerale(note);

                    return (
                      <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                            {note.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">Inscription #{note.id_inscription}</p>
                            {note.id_enseignant && (
                              <p className="text-sm text-gray-500">Enseignant #{note.id_enseignant}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-block px-3 py-1 rounded-full font-semibold ${getColorForNote(parseFloat(t1))}`}>
                            {t1}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {note.sequence1} • {note.sequence2}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-block px-3 py-1 rounded-full font-semibold ${getColorForNote(parseFloat(t2))}`}>
                            {t2}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {note.sequence3} • {note.sequence4}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-block px-3 py-1 rounded-full font-semibold ${getColorForNote(parseFloat(t3))}`}>
                            {t3}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {note.sequence5} • {note.sequence6}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${getColorForNote(parseFloat(moyGen))}`}>
                            {moyGen}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        {recentNotes.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-1">Étudiants ≥ 15/20</p>
              <p className="text-2xl font-bold text-green-600">
                {recentNotes.filter(n => parseFloat(calculateMoyenneGenerale(n)) >= 15).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 mb-1">Étudiants 10-15/20</p>
              <p className="text-2xl font-bold text-yellow-600">
                {recentNotes.filter(n => {
                  const moy = parseFloat(calculateMoyenneGenerale(n));
                  return moy >= 10 && moy < 15;
                }).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 mb-1">Étudiants {'<'} 10/20</p>
              <p className="text-2xl font-bold text-red-600">
                {recentNotes.filter(n => parseFloat(calculateMoyenneGenerale(n)) < 10).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnseignantDashboard;