import React, { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { Note } from '@/types';
import { getAppreciation, getAppreciationColor } from '@/utils/calculations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const NotesPage: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, nom: 'Kamga Jean', matricule: 'CM2A001', interrogation: '', note: '', appreciation: '' },
    { id: 2, nom: 'Ngo Bik Marie', matricule: 'CM2A002', interrogation: '', note: '', appreciation: '' },
    { id: 3, nom: 'Fouda Paul', matricule: 'CM2A003', interrogation: '', note: '', appreciation: '' },
    { id: 4, nom: 'Ateba Claire', matricule: 'CM2A004', interrogation: '', note: '', appreciation: '' },
    { id: 5, nom: 'Mballa Simon', matricule: 'CM2A005', interrogation: '', note: '', appreciation: '' },
    { id: 6, nom: 'Nkolo Celine', matricule: 'CM2A006', interrogation: '', note: '', appreciation: '' },
    { id: 7, nom: 'Owona Patrick', matricule: 'CM2A007', interrogation: '', note: '', appreciation: '' },
    { id: 8, nom: 'Bella Sandrine', matricule: 'CM2A008', interrogation: '', note: '', appreciation: '' }
  ]);

  const handleNoteChange = (id: number, field: 'interrogation' | 'note', value: string) => {
    setNotes(notes.map(note => {
      if (note.id === id) {
        const updated = { ...note, [field]: value };
        
        // Calcul automatique de l'appréciation basée sur la note finale
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
    const valeurs = notes
      .map(n => parseFloat(n[field] || '0'))
      .filter(v => v > 0);
    
    if (valeurs.length === 0) return '--';
    const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
    return moyenne.toFixed(2);
  };

  const countElevesAvecNotes = () => {
    return notes.filter(n => n.note && parseFloat(n.note) > 0).length;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Saisie des Notes - Tableur</h2>

      {/* Filtres */}
      <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Année scolaire
            </label>
            <select className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
              <option>2024-2025</option>
              <option>2023-2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Classe
            </label>
            <select className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
              <option>CM2 A</option>
              <option>CM1 B</option>
              <option>CE2 A</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Matière
            </label>
            <select className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
              <option>Mathématiques</option>
              <option>Français</option>
              <option>Sciences</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Période
            </label>
            <select className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
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
        {/* En-tête avec info et boutons */}
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Tableur de saisie - CM2 A - Mathématiques - Séquence 1</h3>
              <p className="text-sm opacity-90 mt-1">
                Effectif: {notes.length} élèves • Type: Séquence (1 interrogation)
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importer Excel
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold text-center w-12">
                  #
                </th>
                <th className="border border-border bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold text-left w-32">
                  Matricule
                </th>
                <th className="border border-border bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold text-left min-w-[180px]">
                  Nom et Prénom
                </th>
                <th className="border border-border bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold text-center min-w-[120px]">
                  Interrogation<br />/20
                </th>
                <th className="border border-border bg-stats-green text-white px-3 py-2 text-xs font-semibold text-center min-w-[120px]">
                  Note<br />/20
                </th>
                <th className="border border-border bg-stats-green text-white px-4 py-2 text-xs font-semibold text-center min-w-[140px]">
                  Appréciation
                </th>
              </tr>
            </thead>
            <tbody>
              {notes.map((eleve, index) => (
                <tr key={eleve.id} className="hover:bg-muted/50">
                  <td className="border border-border px-3 py-1 text-center text-sm bg-muted/30 font-medium">
                    {index + 1}
                  </td>
                  <td className="border border-border px-3 py-1 text-sm bg-muted/30 font-mono">
                    {eleve.matricule}
                  </td>
                  <td className="border border-border px-4 py-1 text-sm font-medium bg-muted/30">
                    {eleve.nom}
                  </td>
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
              {/* Ligne de moyennes */}
              <tr className="bg-muted font-semibold">
                <td colSpan={3} className="border border-border px-4 py-2 text-sm text-right">
                  Moyennes de la classe:
                </td>
                <td className="border border-border px-3 py-2 text-center text-sm">
                  {calculerMoyenneClasse('interrogation')}
                </td>
                <td className="border border-border px-3 py-2 text-center text-sm bg-stats-green/20">
                  {calculerMoyenneClasse('note')}
                </td>
                <td className="border border-border px-4 py-2 text-center text-xs">
                  {countElevesAvecNotes()} élève(s)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Légende */}
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
          <div>
            Les appréciations sont calculées automatiquement
          </div>
        </div>
      </div>
    </div>
  );
};
