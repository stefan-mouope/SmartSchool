// src/pages/BulletinViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, Download, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api, BASE_INSCRIPTION_SERVICE, BASE_REGISTRATION } from '@/api/axios';
import { genererBulletin} from '@/api/bulletins';
import { BulletinTemplate } from './BulletinTemplate';
import { exporterBulletinPDF } from '@/utils/pdfExport';
import { generateClassBulletinsZip } from '@/api/generateClassBulletins';
import { useAuthStore } from '@/store/authStore';


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

type Student = {
  id: number;           // inscription_id
  nom: string;
  matricule: string;
  classe: string;
};

type BulletinLine = {
  id: number;
  matiere: string;
  moyenne: number | null;
  sequence1_note?: number | null;
  sequence2_note?: number | null;
  coefficient?: number;
  appreciation: string;
};

type BulletinData = {
  id: number;
  inscription_id: number;
  student_name: string;
  matricule: string;
  classe: string;
  periode_label: string;        // ex: "Trimestre 1" ou "Séquence 3"
  trimestre?: number | null;
  sequence?: number | null;
  moyenne_generale: number | null;
  moyenne_classe: number | null;
  rang: string | null;
  date_creation: string;
  lignes: BulletinLine[];
};

const formatAcademicYear = (year: AcademicYear): string => {
  if (year.name) return year.name;
  if (year.label) return year.label;
  const start = new Date(year.start_date || year.startDate || '');
  const end = new Date(year.end_date || year.endDate || '');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return `Année ${year.id}`;
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  return start.getMonth() >= 7 ? `${startYear}-${endYear}` : `${startYear - 1}-${startYear}`;
};

export default function BulletinViewer() {
  const school_id= useAuthStore(state =>state.school_id)
  const schoolId = school_id;

  // États données
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinData | null>(null);

  // États filtres
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'sequence' | 'trimestre'>('trimestre');
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');

  // États chargement
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingMatieres, setLoadingMatieres] = useState(true);
  
  const bulletinRef = useRef<HTMLDivElement>(null);
  // 1. Chargement années scolaires + année courante
  useEffect(() => {
    const loadYears = async () => {
      try {
        setLoadingYears(true);
        const [allRes, currentRes] = await Promise.all([
          api.get(`${BASE_REGISTRATION}/api/academic-years`),
          api.get(`${BASE_REGISTRATION}/api/academic-years/current/${schoolId}`)
        ]);

        const rawYears = (allRes.data?.data || allRes.data || []);
        const formatted = rawYears.map((y: any) => ({
          ...y,
          displayName: formatAcademicYear(y)
        }));
        setYears(formatted);

        const current = currentRes.data;
        if (current?.id) setSelectedYear(current.id);
      } catch (err) {
        console.error("Erreur chargement années", err);
      } finally {
        setLoadingYears(false);
      }
    };
    loadYears();
  }, []);

  // 2. Chargement classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await api.get(`${BASE_REGISTRATION}/api/classrooms/school/${schoolId}`);
        const data = res.data?.data || res.data || [];
        setClasses(data);
        console.log("les classes trouvees", res.data)
        if (data.length > 0 && !selectedClass) {
          setSelectedClass(data[0].id);
        }
      } catch (err) {
        console.error("Erreur classes", err);
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
  

  // 3. Chargement élèves quand année + classe sélectionnées
  useEffect(() => {
    if (!selectedYear || !selectedClass) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await api.get(
          `${BASE_INSCRIPTION_SERVICE}/api/inscriptions/class/${selectedClass}/year/${selectedYear}/students`
        );
        const data = res.data?.data || [];
        const formatted: Student[] = data.map((s: any) => ({
          id: s.inscription_id,
          nom: `${s.student.last_name} ${s.student.first_name}`.trim(),
          matricule: s.student.matricule || 'N/A',
          classe: classes.find(c => c.id === selectedClass)?.name || ''
        }));
        setStudents(formatted);
      } catch (err) {
        console.error("Erreur élèves", err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedYear, selectedClass, classes]);

  const currentYearLabel = years.find(y => y.id === selectedYear)?.displayName || '';
  const currentClassLabel = classes.find(c => c.id === selectedClass)?.name || '';
  const periodeLabel = selectedPeriod === 'sequence'
    ? `Séquence ${selectedPeriodNumber}`
    : `Trimestre ${selectedPeriodNumber}`;

  const filteredStudents = students.filter(s =>
    s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );



const handleGenererUn = async (inscriptionId: number) => {
  setGenerating(true);
  try {
    const basePayload: any = {
      inscription_id: inscriptionId,
      classe_id: selectedClass,
      annee_id: selectedYear,
    };

    let data;
    let lignesCompletes: BulletinLine[] = [];
    const student = students.find(s => s.id === inscriptionId)!;
    const toutesLesMatieres = matieres;

    if (selectedPeriod === 'sequence') {
      // Pour séquence : simple
      const payload = { ...basePayload, sequence: selectedPeriodNumber };
      data = await genererBulletin(payload);

      const lignesAvecNotes = data.lignes || [];

      lignesCompletes = toutesLesMatieres.map((matiere, index) => {
        const ligneExistante = lignesAvecNotes.find((l: any) => {
          if (typeof l.matiere === 'string' && l.matiere.includes('Matière')) {
            const numStr = l.matiere.match(/Matière (\d+)/i)?.[1];
            const numeroDansListe = parseInt(numStr || '0');
            return numeroDansListe === index + 1;
          }
          return l.matiere === matiere.name || l.matiere_id === matiere.id;
        });

        return {
          id: ligneExistante?.id || matiere.id,
          matiere: matiere.name,
          moyenne: ligneExistante?.moyenne ?? null,
          coefficient: ligneExistante?.coefficient || '-',
          appreciation: ligneExistante?.appreciation || 'Non évalué'
        };
      });
    } else {
      // Pour trimestre : générer le bulletin trimestre + fetch les 2 séquences
      const payloadTrim = { ...basePayload, trimestre: selectedPeriodNumber };
      data = await genererBulletin(payloadTrim);

      const lignesTrimAvecNotes = data.lignes || [];

      // Fetch séquence 1 du trimestre (ex: trim1 -> seq1 et seq2)
      const seq1Num = selectedPeriodNumber * 2 - 1;
      const seq2Num = selectedPeriodNumber * 2;

      const payloadSeq1 = { ...basePayload, sequence: seq1Num };
      const dataSeq1 = await genererBulletin(payloadSeq1);
      const lignesSeq1 = dataSeq1.lignes || [];

      const payloadSeq2 = { ...basePayload, sequence: seq2Num };
      const dataSeq2 = await genererBulletin(payloadSeq2);
      const lignesSeq2 = dataSeq2.lignes || [];

      lignesCompletes = toutesLesMatieres.map((matiere, index) => {
        // Trouver ligne trimestre
        const ligneTrim = lignesTrimAvecNotes.find((l: any) => {
          if (typeof l.matiere === 'string' && l.matiere.includes('Matière')) {
            const numStr = l.matiere.match(/Matière (\d+)/i)?.[1];
            const numeroDansListe = parseInt(numStr || '0');
            return numeroDansListe === index + 1;
          }
          return l.matiere === matiere.name || l.matiere_id === matiere.id;
        });

        // Trouver notes séquences
        const ligneSeq1 = lignesSeq1.find((l: any) => {
          if (typeof l.matiere === 'string' && l.matiere.includes('Matière')) {
            const numStr = l.matiere.match(/Matière (\d+)/i)?.[1];
            const numeroDansListe = parseInt(numStr || '0');
            return numeroDansListe === index + 1;
          }
          return l.matiere === matiere.name || l.matiere_id === matiere.id;
        });

        const ligneSeq2 = lignesSeq2.find((l: any) => {
          if (typeof l.matiere === 'string' && l.matiere.includes('Matière')) {
            const numStr = l.matiere.match(/Matière (\d+)/i)?.[1];
            const numeroDansListe = parseInt(numStr || '0');
            return numeroDansListe === index + 1;
          }
          return l.matiere === matiere.name || l.matiere_id === matiere.id;
        });

        return {
          id: ligneTrim?.id || matiere.id,
          matiere: matiere.name,
          moyenne: ligneTrim?.moyenne ?? null,
          sequence1_note: ligneSeq1?.moyenne ?? null,
          sequence2_note: ligneSeq2?.moyenne ?? null,
          coefficient: ligneTrim?.coefficient || '-',
          appreciation: ligneTrim?.appreciation || 'Non évalué'
        };
      });
    }

    setSelectedBulletin({
      ...data,
      lignes: lignesCompletes,
      student_name: student.nom,
      matricule: student.matricule,
      classe: student.classe,
      periode_label: periodeLabel,
      trimestre: selectedPeriod === 'trimestre' ? selectedPeriodNumber : null,
      sequence: selectedPeriod === 'sequence' ? selectedPeriodNumber : null,
    });
  } catch (err) {
    console.error("Erreur génération bulletin", err);
    alert("Impossible de générer le bulletin");
  } finally {
    setGenerating(false);
  }
};



const handleTelechargerPDF = () => {
    if (!selectedBulletin || !bulletinRef.current) return;

    const nomFichier = `Bulletin_${selectedBulletin.student_name.replace(/\s+/g, '_')}_${selectedBulletin.periode_label.replace(/\s+/g, '_')}.pdf`;

    exporterBulletinPDF(bulletinRef.current, nomFichier);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Génération & Consultation des Bulletins</h1>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres de génération</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Année scolaire</label>
              <select
                value={selectedYear ?? ''}
                onChange={e => setSelectedYear(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Choisir...</option>
                {years.map(y => (
                  <option key={y.id} value={y.id}>{y.displayName || formatAcademicYear(y)}</option>
                ))}
              </select>
            </div>rang

            <div>
              <label className="block text-sm font-medium mb-1">Classe</label>
              <select
                value={selectedClass ?? ''}
                onChange={e => setSelectedClass(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Choisir...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

          {/* Matière */}
          {/* <div>
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
          </div> */}

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="trimestre">Trimestre</option>
                <option value="sequence">Séquence</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {selectedPeriod === 'sequence' ? 'Séquence' : 'Trimestre'}
              </label>
              <div className="flex gap-2 flex-wrap">
                {(selectedPeriod === 'sequence' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3]).map(n => (
                  <button
                    key={n}
                    onClick={() => setSelectedPeriodNumber(n)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      selectedPeriodNumber === n
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé + actions classe */}
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
            <div>
              <p className="font-semibold">{currentClassLabel || 'Aucune classe'}</p>
              <p className="text-sm text-muted-foreground">
                {students.length} élève(s) • {currentYearLabel} • {periodeLabel}
              </p>
            </div>
            <div className="flex gap-3">
              {/* <Button onClick={handleGenererTousPDF} disabled={generating}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger tous les bulletins (ZIP)
              </Button> */}
              {/* <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                ZIP classe
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste élèves */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Élèves</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingStudents ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              {selectedYear && selectedClass
                ? "Aucun élève dans cette classe pour l'année sélectionnée"
                : "Veuillez sélectionner une année et une classe"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">#</th>
                    <th className="text-left p-3">Matricule</th>
                    <th className="text-left p-3">Nom complet</th>
                    <th className="text-left p-3">Classe</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-muted/50">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-mono text-muted-foreground">{student.matricule}</td>
                      <td className="p-3 font-medium">{student.nom}</td>
                      <td className="p-3 text-muted-foreground">{student.classe}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenererUn(student.id)}
                          disabled={generating}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Aperçu
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

          {/* Aperçu du bulletin */}
          {selectedBulletin && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Bulletin • {selectedBulletin.student_name} • {selectedBulletin.periode_label}
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => window.print()} variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button onClick={handleTelechargerPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={bulletinRef}
                    id="bulletin-print-area"
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      // padding: '1mm 10mm',           // ← marge interne propre
                      background: 'white',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                      margin: '0 auto',
                      boxSizing: 'border-box',
                      fontFamily: "'Times New Roman', serif",
                    }}>
                <BulletinTemplate
                studentName={selectedBulletin.student_name}
                matricule={selectedBulletin.matricule}
                classe={selectedBulletin.classe}
                anneeScolaire={currentYearLabel}
                periodeLabel={selectedBulletin.periode_label}
                lignes={selectedBulletin.lignes}
                moyenneGenerale={selectedBulletin.moyenne_generale}
                moyenneClasse={selectedBulletin.moyenne_classe}
                rang={selectedBulletin.rang}
                trimestre={selectedBulletin.trimestre}
                sequence={selectedBulletin.sequence}
              />
              </div>
            </CardContent>
          </Card>
          )}
    </div>
  );
}