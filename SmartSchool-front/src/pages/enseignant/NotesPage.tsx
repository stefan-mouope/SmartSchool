// src/pages/NotesPage.tsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAppreciation, getAppreciationColor } from '@/utils/calculations';

interface Eleve {
  id_inscription: number;
  matricule: string;
  nom: string;
  prenom: string;
  note: string;
  appreciation: string;
}

const INSCRIPTION_URL = "http://localhost:8002";
const NOTES_URL = "http://localhost:8000";

export const NotesPage: React.FC = () => {
  const [classeId, setClasseId] = useState("");
  const [matiereId, setMatiereId] = useState("");
  const [periode, setPeriode] = useState("sequence1");
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const teacherId = "1"; // à remplacer plus tard par le vrai

  useEffect(() => {
    if (classeId && matiereId) {
      chargerDonnees();
    } else {
      setEleves([]);
    }
  }, [classeId, matiereId, periode]);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      // 1. Élèves de la classe
      const res1 = await fetch(`${INSCRIPTION_URL}/api/inscriptions/class/${classeId}?current_year=current`);
      const inscriptions = await res1.json();

      // 2. Notes existantes
      const ids = inscriptions.map((i: any) => i.id).join(",");
      const res2 = await fetch(
        `${NOTES_URL}/api/notes/saisie/?ids_inscription=${ids}&matiere_id=${matiereId}&enseignant=${teacherId}&periode=${periode}`
      );
      const notesExistantes = res2.ok ? await res2.json() : {};

      const liste = inscriptions.map((i: any) => {
        const noteData = notesExistantes[i.id] || { valeur: "" };
        return {
          id_inscription: i.id,
          matricule: i.student.matricule,
          nom: i.student.last_name,
          prenom: i.student.first_name,
          note: noteData.valeur || "",
          appreciation: noteData.valeur ? getAppreciation(noteData.valeur) : ""
        };
      });

      setEleves(liste);
    } catch (err) {
      alert("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const sauvegarder = async () => {
    setSaving(true);
    try {
      await fetch(`${NOTES_URL}/api/notes/saisie/bulk/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enseignant_id: teacherId,
          matiere_id: matiereId,
          periode,
          notes: eleves.map(e => ({
            id_inscription: e.id_inscription,
            valeur: e.note ? parseFloat(e.note) : null
          }))
        })
      });
      alert("Notes sauvegardées !");
    } catch (err) {
      alert("Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleNoteChange = (id: number, value: string) => {
    setEleves(prev => prev.map(e =>
      e.id_inscription === id
        ? { ...e, note: value, appreciation: value ? getAppreciation(value) : "" }
        : e
    ));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Saisie des Notes</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Select onValueChange={setClasseId}>
          <SelectTrigger><SelectValue placeholder="Classe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">CM2 A</SelectItem>
            <SelectItem value="8">CM2 B</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setMatiereId}>
          <SelectTrigger><SelectValue placeholder="Matière" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Mathématiques</SelectItem>
            <SelectItem value="2">Français</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periode} onValueChange={setPeriode}>
          <SelectTrigger>Période</SelectTrigger>
          <SelectContent>
            <SelectItem value="sequence1">Séquence 1</SelectItem>
            <SelectItem value="sequence2">Séquence 2</SelectItem>
            <SelectItem value="trimestre1">Trimestre 1</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={sauvegarder} disabled={saving || eleves.length === 0}>
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="h-12 w-12 animate-spin mx-auto" /></div>
      ) : eleves.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Matricule</th>
                <th className="px-6 py-3 text-left">Élève</th>
                <th className="px-6 py-3 text-center">Note /20</th>
                <th className="px-6 py-3 text-center">Appréciation</th>
              </tr>
            </thead>
            <tbody>
              {eleves.map((e, i) => (
                <tr key={e.id_inscription} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{i + 1}</td>
                  <td className="px-6 py-4 font-mono">{e.matricule}</td>
                  <td className="px-6 py-4">{e.prenom} {e.nom}</td>
                  <td className="px-6 py-4 text-center">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={e.note}
                      onChange={(ev) => handleNoteChange(e.id_inscription, ev.target.value)}
                      className="w-24 mx-auto"
                    />
                  </td>
                  <td className={`px-6 py-4 text-center font-bold ${getAppreciationColor(e.appreciation)}`}>
                    {e.appreciation || "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-xl py-20">
          Sélectionnez une classe et une matière pour commencer
        </p>
      )}
    </div>
  );
};