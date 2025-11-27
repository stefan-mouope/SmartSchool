// consumers/inscriptionConsumer.ts
import { consumeEvent } from "../rabbitmq";
import { AcademicYear } from "../../academicYear/academicYear.model";
import { School } from "../../school/school.model";
import { ClassRoom } from "../../classroom/classroom.model";
import amqp from "amqplib";

export const startInscriptionRequestConsumer = async () => {
  await consumeEvent(
    "inscription.request",
    "inscription_queue_request",
    async (event, msg, channel: amqp.Channel) => {
      console.log("Requête inscription reçue :", event);

      try {
        const { classRoom_id, academieYear_id, school_id } = event.data || {};

        if (!classRoom_id || !academieYear_id || !school_id) {
          throw new Error("Données manquantes : classRoom_id, academieYear_id, school_id requis");
        }

        const [academicYear, school, classRoom] = await Promise.all([
          AcademicYear.findOne({ where: { id: academieYear_id } }),
          School.findOne({ where: { id: school_id } }),
          ClassRoom.findOne({ where: { id: classRoom_id } }),
        ]);

        const response: any = {
          status: true,
          data: { academicYear, school, classRoom },
        };

        if (!academicYear || !school || !classRoom) {
          response.status = "NOT_FOUND";
          response.message = "Une ou plusieurs entités non trouvées";
        }

        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }

        channel.ack(msg); // 🟢 ACK essentiel

      } catch (err: any) {
        console.error("Erreur dans inscription.request:", err);

        const errorResponse = {
          status: "ERROR",
          error: err.message,
        };

        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(errorResponse)),
            { correlationId: msg.properties.correlationId }
          );
        }

        channel.ack(msg); // 🟢 ACK même en erreur
      }
    }
  );
};
