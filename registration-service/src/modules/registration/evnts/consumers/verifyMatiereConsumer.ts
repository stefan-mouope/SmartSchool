// consumers/verifyMatiereConsumer.ts
import { consumeEvent } from "../rabbitmq";
import { Matter } from "../../models";
import amqp from "amqplib";

export const startVerifyMatiereConsumer = async () => {
  await consumeEvent(
    "matiere.verify",                  // routing key
    "queue_verify_matiere",           // queue
    async (event, msg, channel: amqp.Channel) => {

      console.log("🟩 Vérification matière reçue :", event);

      try {
        const { id_matiere } = event.data || {};
        if (!id_matiere) {
          throw new Error("id_matiere manquant");
        }

        const matiere = await Matter.findOne({ where: { id: id_matiere } });

        let response: any;

        if (!matiere) {
          response = {
            status: false,
            message: "Matière introuvable"
          };
        } else {
          response = {
            status: true,
            data: { matiere }
          };
        }

        // 👉 Envoi de la réponse RPC
        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }

      } catch (err: any) {
        console.error("❌ Erreur verifyMatiere:", err);

        const errorResponse = {
          status: false,
          error: err.message
        };

        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(errorResponse)),
            { correlationId: msg.properties.correlationId }
          );
        }
      }
    }
  );
};
