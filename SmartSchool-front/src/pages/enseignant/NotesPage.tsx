import React, { useState, useEffect } from 'react';
import { Save, User, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface Matiere {
  id: number;
  nom: string;
}

interface NoteData {
  id_matiere: number;
  sequence1: number | null;
  sequence2: number | null;
  sequence3: number | null;
  sequence4: number | null;
  sequence5: number | null;
  sequence6: number | null;
}

const NotesPage: React.FC = () => {
  const [nomEleve, setNomEleve] = useState('Tamo');
  const [idInscription, setIdInscription] = useState<number>(1);
  const [trimestreActif, setTrimestreActif] = useState<1 | 2 | 3>(1);
  const [matieres, setMatieres] = useState<Matiere[]>([
    { id: 1, nom: 'Mathématiques' },
    { id: 2, nom: 'Français' },
    { id: 3, nom: 'Anglais' },
    { id: 4, nom: 'Physique-Chimie' },
    { id: 5, nom: 'SVT' },
  ]);
  const [notes, setNotes] = useState<Record<number, NoteData>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Initialiser les notes pour chaque matière
    const initialNotes: Record<number, NoteData> = {};
    matieres.forEach(matiere => {
      initialNotes[matiere.id] = {
        id_matiere: matiere.id,
        sequence1: null,
        sequence2: null,
        sequence3: null,
        sequence4: null,
        sequence5: null,
        sequence6: null,
      };
    });
    setNotes(initialNotes);
  }, []);

  const getSequencesForTrimestre = (trimestre: 1 | 2 | 3): ['sequence1' | 'sequence2' | 'sequence3' | 'sequence4' | 'sequence5' | 'sequence6', 'sequence1' | 'sequence2' | 'sequence3' | 'sequence4' | 'sequence5' | 'sequence6'] => {
    if (trimestre === 1) return ['sequence1', 'sequence2'];
    if (trimestre === 2) return ['sequence3', 'sequence4'];
    return ['sequence5', 'sequence6'];
  };

  const handleNoteChange = (matiereId: number, sequence: keyof NoteData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== null && (numValue < 0 || numValue > 20)) return;

    setNotes(prev => ({
      ...prev,
      [matiereId]: {
        ...prev[matiereId],
        [sequence]: numValue,
      },
    }));
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    setMessage(null);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const matiere of matieres) {
        const noteData = notes[matiere.id];
        
        // Vérifier si au moins une note est remplie
        const hasData = Object.values(noteData).some(v => v !== null && typeof v === 'number');
        if (!hasData) continue;

        try {
          const response = await fetch(
            `http://localhost:8000/notes/create/${idInscription}/${matiere.id}/`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sequence1: noteData.sequence1 || 0,
                sequence2: noteData.sequence2 || 0,
                sequence3: noteData.sequence3 || 0,
                sequence4: noteData.sequence4 || 0,
                sequence5: noteData.sequence5 || 0,
                sequence6: noteData.sequence6 || 0,
              }),
            }
          );

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setMessage({
          type: 'success',
          text: `${successCount} matière(s) enregistrée(s) avec succès${errorCount > 0 ? ` (${errorCount} erreur(s))` : ''}`,
        });
      } else if (errorCount > 0) {
        setMessage({
          type: 'error',
          text: `Erreur lors de l'enregistrement des notes`,
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'enregistrement',
      });
    } finally {
      setSaving(false);
    }
  };

  const [seq1, seq2] = getSequencesForTrimestre(trimestreActif);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <input
                  type="text"
                  value={nomEleve}
                  onChange={(e) => setNomEleve(e.target.value)}
                  className="text-3xl font-bold text-gray-800 border-none focus:outline-none bg-transparent"
                  placeholder="Nom de l'élève"
                />
                <div className="flex items-center gap-2 mt-1">
                  <label className="text-sm text-gray-600">Inscription:</label>
                  <input
                    type="number"
                    value={idInscription}
                    onChange={(e) => setIdInscription(Number(e.target.value))}
                    className="text-sm font-medium text-gray-700 border border-gray-300 rounded px-2 py-1 w-20"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              message.type === 'success'
                ? 'bg-green-50 border-l-4 border-green-500'
                : 'bg-red-50 border-l-4 border-red-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <p
                className={`font-medium ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Tabs Trimestres */}
        <div className="bg-white rounded-t-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            {[1, 2, 3].map((trimestre) => (
              <button
                key={trimestre}
                onClick={() => setTrimestreActif(trimestre as 1 | 2 | 3)}
                className={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
                  trimestreActif === trimestre
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Trimestre {trimestre}
              </button>
            ))}
          </div>

          {/* Table des notes */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 w-12">#</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Matière</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 w-40">
                    Séquence {trimestreActif === 1 ? '1' : trimestreActif === 2 ? '3' : '5'}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 w-40">
                    Séquence {trimestreActif === 1 ? '2' : trimestreActif === 2 ? '4' : '6'}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-indigo-700 w-40 bg-indigo-50">
                    Moyenne T{trimestreActif}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {matieres.map((matiere, index) => {
                  const noteMatiere = notes[matiere.id] || {};
                  const val1 = noteMatiere[seq1];
                  const val2 = noteMatiere[seq2];
                  const moyenne = val1 !== null && val2 !== null 
                    ? ((val1 + val2) / 2).toFixed(2) 
                    : '-';

                  return (
                    <tr key={matiere.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-800">{matiere.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={val1 ?? ''}
                          onChange={(e) => handleNoteChange(matiere.id, seq1, e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-lg font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          placeholder="-"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={val2 ?? ''}
                          onChange={(e) => handleNoteChange(matiere.id, seq2, e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-lg font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          placeholder="-"
                        />
                      </td>
                      <td className="px-6 py-4 bg-indigo-50">
                        <div className="text-center">
                          <span className={`text-xl font-bold ${
                            moyenne === '-' ? 'text-gray-400' : 
                            parseFloat(moyenne) >= 15 ? 'text-green-600' :
                            parseFloat(moyenne) >= 10 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {moyenne}
                          </span>
                          {moyenne !== '-' && (
                            <span className="text-sm text-gray-500"> / 20</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-b-lg shadow-lg p-4 border-t-2 border-indigo-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>📝 Notes sur 20</span>
              <span>🟢 ≥ 15 Excellent</span>
              <span>🟡 10-15 Bien</span>
              <span>🔴 {'<'} 10 À améliorer</span>
            </div>
            <span className="font-medium">
              {matieres.length} matières
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;