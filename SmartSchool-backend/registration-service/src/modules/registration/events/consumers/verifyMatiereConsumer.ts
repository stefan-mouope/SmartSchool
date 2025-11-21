// consumers/verifyMatiereConsumer.ts
import { consumeEvent } from "../rabbitmq"; // chemin corrigé
import { Matter } from "../../models";

export const startVerifyMatiereConsumer = async () => {
  await consumeEvent(
    "matiere.verify", // routing key exacte attendue par le service notes
    "queue_verify_matiere",
    async (event, msg, channel) => {
      console.log("Vérification matière reçue :", event);

      try {
        const { id_matiere } = event.data || {};
        if (!id_matiere) {
          throw new Error("id_matiere manquant");
        }

        const matiere = await Matter.findOne({ where: { id: id_matiere } });

        const response = matiere
          ? { status: true, data: { matiere } }
          : { status: false, message: "Matière introuvable" };

        // Envoi de la réponse RPC
        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }

        // ACK OBLIGATOIRE après traitement réussi
        channel.ack(msg);
      } catch (err: any) {
        console.error("Erreur verifyMatiere:", err.message);

        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(
              JSON.stringify({ status: false, error: err.message })
            ),
            { correlationId: msg.properties.correlationId }
          );
        }

        // En cas d'erreur, on peut choisir de requeue ou non
        channel.ack(msg); // ou channel.nack(msg, false, true) pour requeue
      }
    }
  );
};