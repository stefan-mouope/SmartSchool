import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAppreciation, getAppreciationColor } from '@/utils/calculations';
import { api, BASE_INSCRIPTION_SERVICE, BASE_NOTE_SERVICE } from '@/api/axios';

type Note = {
  id: number;
  nom: string;
  matricule: string;
  note: string;
  interrogation: string;
  appreciation: string;
};

export const NotesPage: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedClass, setSelectedClass] = useState('CM2 A');
  const [selectedPeriod, setSelectedPeriod] = useState('Séquence 1');
  const [selectedMatiere, setSelectedMatiere] = useState('Mathématiques');

  // Mapping classe -> id pour ton backend
  const classMapping: Record<string, number> = {
    'CM2 A': 5,
    'CM1 B': 6,
    'CE2 A': 7,
  };

  const yearMapping: Record<string, number> = {
    '2024-2025': 2,
    '2023-2024': 1,
  };

  const periodMapping: Record<string, string> = {
    'Séquence 1': 'sequence1',
    'Séquence 2': 'sequence2',
    'Trimestre 1': 'trimestre1',
    'Trimestre 2': 'trimestre2',
    'Trimestre 3': 'trimestre3',
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const classRoomId = classMapping[selectedClass];
      const academieYearId = yearMapping[selectedYear];

      const response = await api.get(
        `${BASE_INSCRIPTION_SERVICE}/api/inscriptions/class/${classRoomId}/year/${academieYearId}/students`
      );

      if (response.data && response.data.status) {
        console.log(response.data)
        const studentsData: Note[] = response.data.data.map((s: any) => {
          const periodKey = periodMapping[selectedPeriod];
          const firstNote = s.notes[0]?.sequences?.[periodKey] ?? '';
          return {
            id: s.inscription_id,
            nom: `${s.student.last_name} ${s.student.first_name}`,
            matricule: s.student.matricule,
            note: firstNote.toString(),
            interrogation: firstNote.toString(),
            appreciation: firstNote ? getAppreciation(firstNote) : ''
          };
        });
        setNotes(studentsData);
      }
    } catch (error) {
      console.error('Erreur récupération élèves + notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedYear, selectedClass, selectedPeriod]);

  const handleNoteChange = (id: number, field: 'interrogation' | 'note', value: string) => {
    setNotes(notes.map(note => {
      if (note.id === id) {
        const updated = { ...note, [field]: value };
        if (field === 'note' && value) {
          const noteValue = parseFloat(value);
          if (!isNaN(noteValue)) {
            updated.appreciation = getAppreciation(value);
          }
        }
        return updated;
      }
      return note;
    }));
  };

  const calculerMoyenneClasse = (field: 'interrogation' | 'note') => {
    const valeurs = notes.map(n => parseFloat(n[field] || '0')).filter(v => v > 0);
    if (valeurs.length === 0) return '--';
    const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
    return moyenne.toFixed(2);
  };

  const countElevesAvecNotes = () => notes.filter(n => n.note && parseFloat(n.note) > 0).length;

  if (loading) return <div>Chargement des élèves...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Saisie des Notes - Tableur</h2>

      {/* Filtres */}
      <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Année scolaire</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option>2024-2025</option>
              <option>2023-2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option>CM2 A</option>
              <option>CM1 B</option>
              <option>CE2 A</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Matière</label>
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option>Mathématiques</option>
              <option>Français</option>
              <option>Sciences</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Période</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option>Séquence 1</option>
              <option>Séquence 2</option>
              <option>Trimestre 1</option>
              <option>Trimestre 2</option>
              <option>Trimestre 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau de saisie */}
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                Tableur de saisie - {selectedClass} - {selectedMatiere} - {selectedPeriod}
              </h3>
              <p className="text-sm opacity-90 mt-1">
                Effectif: {notes.length} élèves • Type: {selectedPeriod}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm">
                <Upload className="w-4 h-4 mr-2" /> Importer Excel
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" /> Exporter Excel
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold text-center w-12">#</th>
                <th className="border border-border bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold text-left w-32">Matricule</th>
                <th className="border border-border bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold text-left min-w-[180px]">Nom et Prénom</th>
                <th className="border border-border bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold text-center min-w-[120px]">Interrogation<br />/20</th>
                <th className="border border-border bg-stats-green text-white px-3 py-2 text-xs font-semibold text-center min-w-[120px]">Note<br />/20</th>
                <th className="border border-border bg-stats-green text-white px-4 py-2 text-xs font-semibold text-center min-w-[140px]">Appréciation</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((eleve, index) => (
                <tr key={eleve.id} className="hover:bg-muted/50">
                  <td className="border border-border px-3 py-1 text-center text-sm bg-muted/30 font-medium">{index + 1}</td>
                  <td className="border border-border px-3 py-1 text-sm bg-muted/30 font-mono">{eleve.matricule}</td>
                  <td className="border border-border px-4 py-1 text-sm font-medium bg-muted/30">{eleve.nom}</td>
                  <td className="border border-border p-0">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={eleve.interrogation}
                      onChange={(e) => handleNoteChange(eleve.id, 'interrogation', e.target.value)}
                      onFocus={() => setSelectedCell(`${eleve.id}-inter`)}
                      className={`w-full h-full px-3 py-2 text-center text-sm border-none rounded-none focus:ring-2 focus:ring-ring ${
                        selectedCell === `${eleve.id}-inter` ? 'bg-yellow-50 dark:bg-yellow-950' : ''
                      }`}
                      placeholder="--"
                    />
                  </td>
                  <td className="border border-border p-0">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={eleve.note}
                      onChange={(e) => handleNoteChange(eleve.id, 'note', e.target.value)}
                      onFocus={() => setSelectedCell(`${eleve.id}-note`)}
                      className={`w-full h-full px-3 py-2 text-center text-sm border-none rounded-none focus:ring-2 focus:ring-ring ${
                        selectedCell === `${eleve.id}-note` ? 'bg-yellow-50 dark:bg-yellow-950' : ''
                      }`}
                      placeholder="--"
                    />
                  </td>
                  <td className={`border border-border px-4 py-2 text-center text-xs font-semibold ${
                    eleve.appreciation ? getAppreciationColor(eleve.appreciation) : 'bg-muted/30'
                  }`}>
                    {eleve.appreciation || '--'}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted font-semibold">
                <td colSpan={3} className="border border-border px-4 py-2 text-sm text-right">Moyennes de la classe:</td>
                <td className="border border-border px-3 py-2 text-center text-sm">{calculerMoyenneClasse('interrogation')}</td>
                <td className="border border-border px-3 py-2 text-center text-sm bg-stats-green/20">{calculerMoyenneClasse('note')}</td>
                <td className="border border-border px-4 py-2 text-center text-xs">{countElevesAvecNotes()} élève(s)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-muted/30 px-6 py-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-50 dark:bg-yellow-950 border border-border mr-2"></div>
              <span>Cellule sélectionnée</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-stats-green/20 border border-border mr-2"></div>
              <span>Calcul automatique</span>
            </div>
          </div>
          <div>Les appréciations sont calculées automatiquement</div>
        </div>
      </div>
    </div>
  );
};
