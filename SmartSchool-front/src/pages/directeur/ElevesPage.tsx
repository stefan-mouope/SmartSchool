import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { createInscription, getAllInscriptions, InscriptionResult } from "@/api/inscription";
import { useAuthStore } from "@/store/authStore";
import { getClassroomsBySchool } from "@/api/registration-service/classroom.api";

interface StudentTable {
  id: number;
  matricule: string;
  nom: string;
  classe: string;
  statut: string;
  montant: string;
}

export const ElevesPage: React.FC = () => {

  const schoolId = useAuthStore((state) => state.school_id);
  const academieYear_id = useAuthStore((state) => state.academic_year_id);

  const [classrooms, setClassrooms] = useState<any>([]);
  const [eleves, setEleves] = useState<StudentTable[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    birth_date: "",
    adress: "",
    sex: "",
    phone_parent: "",
    school_id: schoolId || "",
    academieYear_id: academieYear_id || "",
    classRoom_id: "",
  });

  const fetchClassRoom = async (schoolId:number) => {
    const response = await getClassroomsBySchool(schoolId);
    setClassrooms(response);
    }

  // 🔹 Charger les inscriptions au montage
  useEffect(() => {
    fetchEleves();
    fetchClassRoom(schoolId!);
  }, []);

  const fetchEleves = async () => {
    try {
      const res: InscriptionResult[] = await getAllInscriptions();
      const data = res.map((s) => ({
        id: s.Student.id,
        matricule: s.Student.matricule,
        nom: `${s.Student.last_name} ${s.Student.first_name}`,
        // classe: "N/A", // adapter si tu as les infos de la classe
        // statut: "Non payé",
        // montant: "150 000 FCFA",
      }));
      setEleves(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        student: {
          last_name: formData.last_name,
          first_name: formData.first_name,
          birth_date: formData.birth_date,
          adress: formData.adress,
          sex: formData.sex,
          phone_parent: formData.phone_parent,
          school_id: Number(formData.school_id),
        },
        academieYear_id: Number(formData.academieYear_id),
        classRoom_id: Number(formData.classRoom_id),
      };

      const res = await createInscription(payload);

      // Ajouter le nouvel élève au tableau
      const newEleve: StudentTable = {
        id: res.Student.id,
        matricule: res.Student.matricule,
        nom: `${res.Student.last_name} ${res.Student.first_name}`,
        classe: "N/A",
        statut: "Non payé",
        montant: "150 000 FCFA",
      };

      setEleves([...eleves, newEleve]);
      setShowForm(false);
      setFormData({
        last_name: "",
        first_name: "",
        birth_date: "",
        adress: "",
        sex: "",
        phone_parent: "",
        school_id: "",
        academieYear_id: "",
        classRoom_id: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { key: "matricule", label: "Matricule", align: "left" as const },
    { key: "nom", label: "Nom complet", align: "left" as const },
    // { key: "classe", label: "Classe", align: "left" as const },
    // {
    //   key: "statut",
    //   label: "Statut paiement",
    //   align: "center" as const,
    //   render: (value: string) => (
    //     <span
    //       className={`px-3 py-1 rounded-full text-xs font-medium ${
    //         value === "Payé" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
    //       }`}
    //     >
    //       {value}
    //     </span>
    //   ),
    // },
    // { key: "montant", label: "Montant", align: "right" as const },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Gestion des Élèves</h2>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-card-foreground">Liste des élèves inscrits</h3>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Inscrire un élève
          </button>
        </div>

        <DataTable columns={columns} data={eleves} onEdit={(id) => console.log("Edit", id)} />
      </div>

      {/* 🔹 Formulaire modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4"
          >
            <h3 className="text-lg font-semibold">Nouvel élève</h3>
            <input
              type="text"
              name="last_name"
              placeholder="Nom"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="first_name"
              placeholder="Prénom"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="adress"
              placeholder="Adresse"
              value={formData.adress}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Sexe</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
            <input
              type="text"
              name="phone_parent"
              placeholder="Téléphone parent"
              value={formData.phone_parent}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
        
           
            <select
              name="classRoom_id"
              value={formData.classRoom_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              {classrooms.map((classroom: any) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded"
              >
                Annuler
              </button>
              <button onClick={handleSubmit} type="submit" className="px-4 py-2 bg-primary text-white rounded">
                Inscrire
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
