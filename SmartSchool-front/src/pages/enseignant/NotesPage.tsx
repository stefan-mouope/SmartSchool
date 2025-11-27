
// src/pages/NotesPage.tsx
import React, { useState, useEffect } from 'react';
import { Upload, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAppreciation, getAppreciationColor } from '@/utils/calculations';
import { api, BASE_INSCRIPTION_SERVICE, BASE_REGISTRATION} from '@/api/axios';
import { saveOrUpdateNote, updateNote, type NotePayload } from '@/api/noteService';
import { useAuthStore } from '@/store/authStore';

type Note = {
  id: number;
  nom: string;
  matricule: string;
  note: string;
  interrogation: string;
  appreciation: string;
};

type AcademicYear = {
  id: number;
  name?: string;
  label?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  displayName?: string;
};

type Classroom = { id: number; name: string };
type Matiere = { id: number; name: string };

// Fonction pour formater proprement l'année scolaire
const formatAcademicYear = (year: AcademicYear): string => {
  if (year.name) return year.name;
  if (year.label) return year.label;

  const start = new Date(year.start_date || year.startDate || '');
  const end = new Date(year.end_date || year.endDate || '');

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return `Année ${year.id}`;

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // Si l'année commence en août/septembre → 2025-2026
  return start.getMonth() >= 7 ? `${startYear}-${endYear}` : `${startYear - 1}-${startYear}`;
};

export const NotesPage: React.FC = () => {
  const school_id = useAuthStore(state => state.school_id)
  const schoolId = school_id; // À remplacer par useAuth().user.schoolId plus tard

  // États de données
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // États de sélection
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('sequence1');

  // États de chargement
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingMatieres, setLoadingMatieres] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);



  // --- RESTAURATION / PERSISTENCE localStorage ---
  useEffect(() => {
    try {
      const savedYear = localStorage.getItem("selectedYear");
      const savedClass = localStorage.getItem("selectedClass");
      const savedMatiere = localStorage.getItem("selectedMatiere");
      const savedPeriod = localStorage.getItem("selectedPeriod");

      if (savedYear) setSelectedYear(Number(savedYear));
      if (savedClass) setSelectedClass(Number(savedClass));
      if (savedMatiere) setSelectedMatiere(Number(savedMatiere));
      if (savedPeriod) setSelectedPeriod(savedPeriod);
    } catch (e) {
      // localStorage peut échouer en environnement fermé — on ne veut pas casser l'app
      console.warn("Impossible d'accéder à localStorage :", e);
    }
  }, []);

  useEffect(() => {
    try {
      if (selectedYear !== null) localStorage.setItem("selectedYear", String(selectedYear));
    } catch {}
  }, [selectedYear]);

  useEffect(() => {
    try {
      if (selectedClass !== null) localStorage.setItem("selectedClass", String(selectedClass));
    } catch {}
  }, [selectedClass]);

  useEffect(() => {
    try {
      if (selectedMatiere !== null) localStorage.setItem("selectedMatiere", String(selectedMatiere));
    } catch {}
  }, [selectedMatiere]);

  useEffect(() => {
    try {
      if (selectedPeriod) localStorage.setItem("selectedPeriod", selectedPeriod);
    } catch {}
  }, [selectedPeriod]);

  // 1. Charger années + année courante
  useEffect(() => {
    const loadYears = async () => {
      try {
        setLoadingYears(true);
        const [allRes, currentRes] = await Promise.all([
          api.get(`${BASE_REGISTRATION}/api/academic-years`),
          api.get(`${BASE_REGISTRATION}/api/academic-years/current/${schoolId}`)
        ]);

        const rawYears = (allRes.data?.data || allRes.data || []);
        const formattedYears = rawYears.map((y: any) => ({
          ...y,
          displayName: formatAcademicYear(y)
        }));

        setYears(formattedYears);

        const current = currentRes.data;
        const savedYear = localStorage.getItem("selectedYear");
        // si l'utilisateur a déjà une sélection sauvegardée, ne pas écraser
        if (!savedYear && current?.id) {
          setSelectedYear(current.id);
          console.log("Année courante chargée :", formatAcademicYear(current));
        }
      } catch (err: any) {
        console.error("Erreur années :", err.response?.data || err);
      } finally {
        setLoadingYears(false);
      }
    };

    loadYears();
  }, []);

  // 2. Charger classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await api.get(`${BASE_REGISTRATION}/api/classrooms/school/${schoolId}`);
        const data = (res.data?.data || res.data || []);
        setClasses(data);

        // si aucune classe sélectionnée (ni via localStorage), choisir la première
        const savedClass = localStorage.getItem("selectedClass");
        if (data.length > 0 && !savedClass && !selectedClass) {
          setSelectedClass(data[0].id);
        }
      } catch (err) {
        console.error("Erreur classes :", err);
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  // 3. Charger matières
  useEffect(() => {
    const loadMatieres = async () => {
      try {
        setLoadingMatieres(true);
        const res = await api.get(`${BASE_REGISTRATION}/api/matters/school/${schoolId}`);
        const data = (res.data?.data || res.data || []);
        setMatieres(data);

        const savedMatiere = localStorage.getItem("selectedMatiere");
        if (data.length > 0 && !savedMatiere && !selectedMatiere) {
          setSelectedMatiere(data[0].id);
        }
      } catch (err) {
        console.error("Erreur matières :", err);
      } finally {
        setLoadingMatieres(false);
      }
    };

    loadMatieres();
  }, []);

  // 4. Charger élèves + notes
  useEffect(() => {
    if (!selectedYear || !selectedClass || !selectedMatiere) {
      setNotes([]);
      return;
    }

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await api.get(
          `${BASE_INSCRIPTION_SERVICE}/api/inscriptions/class/${selectedClass}/year/${selectedYear}/students`
        );

        const students = res.data?.data || [];

        // DEBUG léger — utile si tu veux vérifier les données reçues
        console.debug('Données reçues pour la classe/année/matiere :', {
          selectedClass,
          selectedYear,
          selectedMatiere,
          totalStudents: students.length
        });

        const notesData: Note[] = students.map((s: any) => {
          const noteForMatiere = (s.notes || []).find((n: any) =>
            Number(n.id_matiere) === Number(selectedMatiere)
          );

          const value = noteForMatiere?.sequences?.[selectedPeriod] ?? '';
          const strValue = value != null ? String(value) : '';

          return {
            id: s.inscription_id,
            nom: `${s.student.last_name} ${s.student.first_name}`.trim(),
            matricule: s.student.matricule || 'N/A',
            note: strValue,
            interrogation: strValue,
            appreciation: strValue ? getAppreciation(parseFloat(strValue)) : ''
          };
        });

        setNotes(notesData);
      } catch (err: any) {
        console.error("Erreur chargement notes :", err);
        setNotes([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedYear, selectedClass, selectedMatiere, selectedPeriod]);

  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());

  const handleNoteChange = async (
    inscriptionId: number,
    field: 'note' | 'interrogation',
    value: string
  ) => {
    if (!selectedMatiere) return;

    const numericValue = value === '' ? null : parseFloat(value);
    if (value !== '' && (isNaN(numericValue!) || numericValue! < 0 || numericValue! > 20)) {
      return; // Optionnel : tu peux afficher un toast d'erreur
    }

    // Mise à jour optimiste de l'UI
    setNotes(prev =>
      prev.map(n =>
        n.id === inscriptionId
          ? {
              ...n,
              [field]: value,
              appreciation: value ? getAppreciation(parseFloat(value)) : '',
            }
          : n
      )
    );

    const cellKey = `${inscriptionId}-${selectedPeriod}`;
    setSavingCells(prev => new Set(prev).add(cellKey));

    // Préparer les données à envoyer selon la période
    let payload: Partial<NotePayload> = {};

    // Note: NotePayload keys are expected to match the backend naming (e.g. sequence1, trimestre1...)
    payload[selectedPeriod as keyof NotePayload] = numericValue;

    // const result = await updateNote(inscriptionId, selectedMatiere, payload);
    const result = await saveOrUpdateNote(inscriptionId, selectedMatiere, payload);


    // Retirer le loader
    setSavingCells(prev => {
      const next = new Set(prev);
      next.delete(cellKey);
      return next;
    });

    // Optionnel : rollback en cas d'échec
    if (!result.success) {
      // Remettre l'ancienne valeur (tu peux stocker l'ancienne avant si tu veux rollback exact)
      setNotes(prev =>
        prev.map(n =>
          n.id === inscriptionId
            ? {
                ...n,
                [field]: '', // on vide pour indiquer échec
                appreciation: '',
              }
            : n
        )
      );

      // Alerte simple — remplace par ton système de toast si tu en as un
      alert(result.message || "Erreur lors de la sauvegarde");
    }
  };

  const calculerMoyenneClasse = (field: 'note' | 'interrogation') => {
    const vals = notes.map(n => parseFloat(n[field] || '0')).filter(v => v > 0);
    return vals.length === 0 ? '--' : (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  const countElevesAvecNotes = () => notes.filter(n => n.note && parseFloat(n.note) > 0).length;

  // Rendu conditionnel
  if (loadingYears || loadingClasses || loadingMatieres) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg">Chargement des données de l'établissement...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      <h2 className="text-3xl font-bold mb-8">Saisie des Notes</h2>

      {/* Filtres */}
      <div className="bg-card border rounded-lg p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Année scolaire */}
          <div>
            <label className="block text-sm font-semibold mb-2">Année scolaire</label>
            <select
              value={selectedYear ?? ''}
              onChange={(e) => setSelectedYear(Number(e.target.value) || null)}
              className="w-full px-4 py-3 border rounded-md bg-background font-medium text-foreground"
            >
              <option value="">Choisir une année</option>
              {years.map(year => (
                <option key={year.id} value={year.id}>
                  {year.displayName || formatAcademicYear(year)}
                </option>
              ))}
            </select>
          </div>

          {/* Classe */}
          <div>
            <label className="block text-sm font-semibold mb-2">Classe</label>
            <select
              value={selectedClass ?? ''}
              onChange={(e) => setSelectedClass(Number(e.target.value) || null)}
              className="w-full px-4 py-3 border rounded-md bg-background"
            >
              <option value="">Choisir...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Matière */}
          <div>
            <label className="block text-sm font-semibold mb-2">Matière</label>
            <select
              value={selectedMatiere ?? ''}
              onChange={(e) => setSelectedMatiere(Number(e.target.value) || null)}
              className="w-full px-4 py-3 border rounded-md bg-background"
            >
              <option value="">Choisir...</option>
              {matieres.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-semibold mb-2">Période</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-3 border rounded-md bg-background"
            >
              <option value="sequence1">Séquence 1</option>
              <option value="sequence2">Séquence 2</option>
              <option value="sequence3">Séquence 3</option>
              <option value="sequence4">Séquence 4</option>
              <option value="sequence5">Séquence 5</option>
              <option value="sequence6">Séquence 6</option>
              <option value="trimestre1">Trimestre 1</option>
              <option value="trimestre2">Trimestre 2</option>
              <option value="trimestre3">Trimestre 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {loadingStudents ? (
        <div className="text-center py-16 text-lg">Chargement des élèves...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          Aucun élève inscrit dans cette classe pour l'année sélectionnée.
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-primary text-primary-foreground px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">
                  {classes.find(c => c.id === selectedClass)?.name} • {matieres.find(m => m.id === selectedMatiere)?.name} • {selectedPeriod.replace('sequence', 'Séquence ').replace('trimestre', 'Trimestre ')}
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  Effectif : {notes.length} élèves • Année : {years.find(y => y.id === selectedYear)?.displayName || (selectedYear ? formatAcademicYear(years.find(y => y.id === selectedYear) as AcademicYear) : '')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm"><Upload className="w-4 h-4 mr-2" /> Importer</Button>
                <Button variant="secondary" size="sm"><Download className="w-4 h-4 mr-2" /> Exporter</Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border px-4 py-3 text-left font-bold w-12">#</th>
                  <th className="border px-4 py-3 text-left font-bold">Matricule</th>
                  <th className="border px-6 py-3 text-left font-bold min-w-[220px]">Nom & Prénom</th>
                  <th className="border px-6 py-3 text-center font-bold bg-green-100 text-green-800">Note /20</th>
                  <th className="border px-6 py-3 text-center font-bold bg-green-100 text-green-800">Appréciation</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((eleve, i) => (
                  <tr key={eleve.id} className="hover:bg-muted/30 transition">
                    <td className="border px-4 py-3 text-center font-medium bg-muted/20">{i + 1}</td>
                    <td className="border px-4 py-3 font-mono text-xs bg-muted/20">{eleve.matricule}</td>
                    <td className="border px-6 py-3 font-medium">{eleve.nom}</td>
                    <td className="border p-0 relative">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={eleve.note}
                        onChange={(e) => handleNoteChange(eleve.id, 'note', e.target.value)}
                        className="w-full h-12 text-center border-none rounded-none focus:ring-2 focus:ring-blue-500 pr-10"
                        placeholder="--"
                      />
                      {savingCells.has(`${eleve.id}-${selectedPeriod}`) && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </td>
                    <td className={`border px-6 py-3 text-center font-bold ${eleve.appreciation ? getAppreciationColor(eleve.appreciation) : 'bg-muted/20'}`}>
                      {eleve.appreciation || '--'}
                    </td>
                  </tr>
                ))}

                <tr className="bg-muted font-bold text-foreground">
                  <td colSpan={3} className="border px-6 py-4 text-right">Moyenne de la classe :</td>
                  <td className="border px-6 py-4 text-center bg-green-100 text-green-800">
                    {calculerMoyenneClasse('note')}
                  </td>
                  <td className="border px-6 py-4 text-center">
                    {countElevesAvecNotes()} / {notes.length} notés
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;