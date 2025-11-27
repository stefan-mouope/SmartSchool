import React, { useEffect, useState } from "react";
import { Plus, DollarSign, TrendingUp, AlertCircle, Search, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { TableSkeleton } from "@/components/shared/SkeletonLoading";

import { PaymentCreationForm } from "@/components/forms/PaymentCreationForm";
import { DeletePaymentModal } from "@/components/forms/DeletePaymentModal";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { getInscriptionsByClassRoomId, InscriptionResult } from "@/api/inscription";
import { getClassroomsBySchool, ClassTypeResponse } from "@/api/registration-service/classroom.api";
import { getPayementByYearStats, getPayementStats, PayementStats } from "@/api/payment.api";

interface StudentPaymentData extends InscriptionResult {
  tranches_payees: number[];
}

export const PaiementsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState<StudentPaymentData | null>(null);
  const [students, setStudents] = useState<StudentPaymentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentPaymentData[]>([]);
  const [classRooms, setClassRooms] = useState<ClassTypeResponse[]>([]);
  const [stats, setStats] = useState<PayementStats>({
    total_collected: 0,
    total_pending: 0,
    total_expected: 0,
    collection_rate: 0,
    total_students: 0,
    students_paid: 0,
    students_pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassRoom, setSelectedClassRoom] = useState<string>("");
  
  const school_id = useAuthStore(state => state.school_id);
  const academieYear_id = useAuthStore(state => state.academic_year_id);

  const columns = [
    {
      key: "matricule",
      label: "Matricule",
      align: "left" as const,
      render: (value: any, row: StudentPaymentData) => (
        <span className="font-mono text-sm font-medium">
          {row.Student.matricule}
        </span>
      ),
    },
    {
      key: "student",
      label: "Nom complet",
      align: "left" as const,
      render: (value: any, row: StudentPaymentData) => (
        <div>
          <p className="font-medium">
            {row.Student.first_name} {row.Student.last_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.ClassRoom?.name || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "tranches_payees",
      label: "Tranches payées",
      align: "center" as const,
      render: (value: any, row: StudentPaymentData) => (
        <div className="flex items-center justify-center">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            row.tranches_payees && row.tranches_payees.length > 0
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {row.tranches_payees?.length || 0}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center" as const,
      render: (value: any, row: StudentPaymentData) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleAddPayment(row)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Ajouter un paiement"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => handleDeletePayment(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer un paiement"
            disabled={!row.tranches_payees || row.tranches_payees.length === 0}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handleAddPayment = (student: StudentPaymentData) => {
    setSelectedInscription(student);
    setShowModal(true);
  };

  const handleDeletePayment = (student: StudentPaymentData) => {
    setSelectedInscription(student);
    setShowDeleteModal(true);
  };

    const fetchStats = async () => {
    try {
      const statsData = await getPayementByYearStats(Number(academieYear_id));
      setStats(statsData.stats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques de paiement:", error);
    }
  }
  // Charger les classes et les stats au montage
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const classRoomsData = await getClassroomsBySchool(school_id)
      // const statsData = await getInscriptionsByClassRoomId(Number(school_id))
      // const [classRoomsData, statsData] = await Promise.all([
      //   getClassroomsBySchool(school_id),
       
      // ]);
      await fetchStats();
      
      setClassRooms(classRoomsData);
      console.log(
        "Classes chargées:", classRoomsData,
        // "Stats chargées:", statsData
      )
      // setStats(statsData);
      
      // Sélectionner automatiquement la première classe si elle existe
      if (classRoomsData.length > 0) {
        const firstClassRoomId = classRoomsData[0].id.toString();
        setSelectedClassRoom(firstClassRoomId);
        // Charger les inscriptions de la première classe
        await loadInscriptionsByClass(classRoomsData[0].id);
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError("Impossible de charger les données. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les inscriptions d'une classe spécifique
  const loadInscriptionsByClass = async (classRoomId: number) => {
    try {
      setIsLoadingStudents(true);
      const inscriptionsData = await getInscriptionsByClassRoomId(classRoomId);
      setStudents(inscriptionsData as StudentPaymentData[]);
      setFilteredStudents(inscriptionsData as StudentPaymentData[]);
    } catch (error) {
      console.error("Erreur lors du chargement des inscriptions:", error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Effet au montage de la page
  useEffect(() => {
    fetchInitialData();
  }, [school_id]);

  // Effet quand la classe sélectionnée change
  useEffect(() => {
    if (selectedClassRoom && !isLoading) {
      loadInscriptionsByClass(Number(selectedClassRoom));
    }
  }, [selectedClassRoom]);

  // Effet pour la recherche (filtre local uniquement)
  useEffect(() => {
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      const filtered = students.filter(student => {
        const fullName = `${student.Student.first_name} ${student.Student.last_name}`.toLowerCase();
        const matricule = student.Student.matricule.toLowerCase();
        return fullName.includes(search) || matricule.includes(search);
      });
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const handleClassRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassRoom(e.target.value);
    setSearchTerm(""); // Réinitialiser la recherche
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Gestion des Paiements
      </h2>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total perçu</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(stats.total_collected)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.students_paid} élève{stats.students_paid > 1 ? 's ont' : ' a'} payé
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">En attente</p>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(stats.total_pending)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.students_pending} élève{stats.students_pending > 1 ? 's' : ''} en attente
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Taux de recouvrement</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {/* {stats.collection_rate.toFixed(1)}% */}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sur {stats.total_students} élève{stats.total_students > 1 ? 's' : ''} inscrit{stats.total_students > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Liste des élèves */}
      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Liste des élèves
              </h3>
              {!isLoading && !isLoadingStudents && (
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredStudents.length} élève{filteredStudents.length > 1 ? "s" : ""} affiché{filteredStudents.length > 1 ? "s" : ""}
                  {searchTerm && ` (${students.length} dans cette classe)`}
                </p>
              )}
            </div>
            
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedClassRoom}
                onChange={handleClassRoomChange}
                disabled={isLoading}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary sm:w-48"
              >
                <option value="">Sélectionner une classe</option>
                {classRooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  disabled={!selectedClassRoom || isLoadingStudents}
                />
              </div>
            </div>
          </div>
        </div>

        {isLoading || isLoadingStudents ? (
          <TableSkeleton rows={8} columns={4} />
        ) : error ? (
          <div className="p-8 text-center text-destructive">{error}</div>
        ) : !selectedClassRoom ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Aucune classe disponible</p>
            <p className="text-sm">Veuillez d'abord créer des classes</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">
              {searchTerm ? "Aucun résultat trouvé" : "Aucun élève inscrit dans cette classe"}
            </p>
            <p className="text-sm">
              {searchTerm
                ? "Essayez avec d'autres mots-clés" 
                : "Les élèves inscrits apparaîtront ici"
              }
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredStudents} />
        )}
      </div>

      <PaymentCreationForm
        isOpen={showModal}
        onCancel={() => {
          setShowModal(false);
          setSelectedInscription(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          setSelectedInscription(null);
          // Recharger les inscriptions de la classe actuelle
          if (selectedClassRoom) {
            loadInscriptionsByClass(Number(selectedClassRoom));
          }
          // Recharger les stats
          fetchStats();
        }}
        preselectedInscription={selectedInscription}
        tranchesPaid={selectedInscription?.tranches_payees || []}
      />

      <DeletePaymentModal
        isOpen={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedInscription(null);
        }}
        onSuccess={async () => {
          setShowDeleteModal(false);
          setSelectedInscription(null);
          // Recharger les inscriptions de la classe actuelle
          if (selectedClassRoom) {
            loadInscriptionsByClass(Number(selectedClassRoom));
          }
          // Recharger les stats
          fetchStats();
        }}
        inscriptionId={selectedInscription?.id || 0}
        studentName={selectedInscription 
          ? `${selectedInscription.Student.first_name} ${selectedInscription.Student.last_name}`
          : ""
        }
      />
    </div>
  );
};