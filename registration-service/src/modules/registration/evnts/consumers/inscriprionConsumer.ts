// consumers/inscriptionConsumer.ts
import { consumeEvent } from "../rabbitmq";
import { AcademicYear } from "../../academicYear/academicYear.model";
import { School } from "../../school/school.model";
import { ClassRoom } from "../../classroom/classroom.model";
import amqp from "amqplib";

export const startInscriptionRequestConsumer = async () => {
  await consumeEvent(
    "inscription.request",           // routingKey
    "inscription_queue_request",     // queueName
    async (event, msg, channel: amqp.Channel) => {
      console.log("Requête inscription reçue :", event);

      try {
        // 1. Extraire les données
        const { classRoom_id, academieYear_id, school_id } = event.data || {};

        if (!classRoom_id || !academieYear_id || !school_id) {
          throw new Error("Données manquantes : classRoom_id, academieYear_id, school_id requis");
        }

        // 2. Rechercher les entités
        const [academicYear, school, classRoom] = await Promise.all([
          AcademicYear.findOne({ where: { id: academieYear_id } }),
          School.findOne({ where: { id: school_id } }),
          ClassRoom.findOne({ where: { id: classRoom_id } }),
        ]);

        // 3. Préparer la réponse
        const response: any = {
          status: true,
          data: { academicYear, school, classRoom },
        };

        // 4. Vérifier si tout existe
        if (!academicYear || !school || !classRoom) {
          response.status = "NOT_FOUND";
          response.message = "Une ou plusieurs entités non trouvées";
        }

        // 5. Répondre au producteur
        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }

      } catch (err: any) {
        console.error("Erreur dans le handler [inscription.request]:", err);

        // Réponse d'erreur
        const errorResponse = {
          status: "ERROR",
          error: err.message || "Erreur interne",
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