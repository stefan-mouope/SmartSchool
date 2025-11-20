import { consumeEvent } from "../config/rabbitmq.js";
import Inscription from "../models/inscriptionModel.js";

export const startVerifyInscriptionConsumer = async () => {
  await consumeEvent(
    "inscription.verify",
    "queue_verify_inscription",

    async (event, msg, channel) => {
      console.log("🟦 Vérification inscription :", event);

      try {
        const { id_inscription } = event.data || {};
        if (!id_inscription) throw new Error("id_inscription manquant");

        const inscription = await Inscription.findOne({
          where: { id: id_inscription }
        });

        const response = inscription
          ? { status: true, data: inscription }
          : { status: false, message: "Inscription introuvable" };

        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }

      } catch (err) {
        const errorResponse = { status: false, error: err.message };

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
