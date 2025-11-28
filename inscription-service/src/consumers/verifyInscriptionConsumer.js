// consumers/verifyInscriptionConsumer.js
import { consumeEvent } from "../rabbitmq.js";
import { Inscription } from "../../models/Inscription.js"; 
import amqp from "amqplib";

export const startVerifyInscriptionConsumer = async () => {
  await consumeEvent(
    "inscription.verify",                 // routing key
    "queue_verify_inscription",           // queue
    async (event, msg, channel) => {

      console.log("🟦 Vérification inscription reçue :", event);

      try {
        const { id_inscription } = event.data || {};

        if (!id_inscription) {
          throw new Error("id_inscription manquant");
        }

        const inscription = await Inscription.findOne({
          where: { id: id_inscription }
        });

        let response;

        if (!inscription) {
          response = {
            status: false,
            message: "Inscription introuvable"
          };
        } else {
          response = {
            status: true,
            data: { inscription }
          };
        }

        // 👉 Réponse RPC
        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }

      } catch (err) {
        console.error("❌ Erreur consumer verifyInscription :", err);

        const errorResponse = {
          status: false,
          error: err.message,
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
