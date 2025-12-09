import { consumeEvent } from "../config/rabbitmq.js";
import Inscription from "../models/inscriptionModel.js";

export const startGetInscriptionByClassRoomIdConsumer= async () => {
  await consumeEvent(
    "inscription.get_inscription_classroom",
    "queue_get_insription_by_classroom",

    async (event, msg, channel) => {
      console.log("🟦  inscription en fontion des classe:", event);

      try {
        const { classroom_id } = event.data || {};
        if (!classroom_id) throw new Error("classroom_id manquant");

        const inscription = await Inscription.findAll({
          where: { classRoom_id: classroom_id }
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

      // channel.ack(msg);
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
      // channel.ack(msg);
    }
  );
};
