import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  getPayementsByInscription, 
  deletePayment, 
  PaymentResult 
} from "@/api/payment.api";
import { AlertTriangle, Trash2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  inscriptionId: number;
  studentName: string;
}

export const DeletePaymentModal: React.FC<Props> = ({
  isOpen,
  onCancel,
  onSuccess,
  inscriptionId,
  studentName,
}) => {
  const [payments, setPayments] = useState<PaymentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && inscriptionId) {
      loadPayments();
    }
  }, [isOpen, inscriptionId]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const data = await getPayementsByInscription(inscriptionId);
      setPayments(data);
    } catch (error) {
      console.error("Erreur chargement paiements:", error);
      toast({
        variant: "destructive",
        title: "✗ Erreur",
        description: "Impossible de charger les paiements",
        className: "bg-red-50 border-red-200 text-red-900",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (paymentId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deletePayment(paymentId);
      
      toast({
        title: "✓ Succès",
        description: "Paiement supprimé avec succès",
        className: "bg-green-50 border-green-200 text-green-900",
      });
      
      // Recharger la liste
      await loadPayments();
      
      // Si plus de paiements, fermer le modal
      if (payments.length === 1) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur suppression paiement:", error);
      toast({
        variant: "destructive",
        title: "✗ Erreur",
        description: "Impossible de supprimer le paiement",
        className: "bg-red-50 border-red-200 text-red-900",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={24} />
            Supprimer un paiement - {studentName}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement des paiements...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun paiement trouvé pour cet élève</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Sélectionnez le paiement à supprimer :
              </p>
              {payments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{payment.Tranche?.tranche_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Montant: {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        minimumFractionDigits: 0,
                      }).format(payment.amount_paid)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Date: {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                      {payment.payment_method && ` • ${payment.payment_method}`}
                      {payment.reference && ` • Réf: ${payment.reference}`}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(payment.id)}
                    disabled={isDeleting}
                    className="ml-4"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};