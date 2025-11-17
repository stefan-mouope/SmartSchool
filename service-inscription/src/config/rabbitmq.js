// src/config/rabbitmq.js
import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";

let channel;
let replyQueue;
const pendingResponses = new Map();

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:guest@localhost:5672");
    channel = await connection.createChannel();

    // --- PARTIE HEAD : Queue directe pour l'auth ---
    await channel.assertQueue("auth_verify_queue", { durable: true });

    // Queue de réponse
    const { queue } = await channel.assertQueue("", { exclusive: true });
    replyQueue = queue;

    // --- PARTIE YVES : Exchange pour l'inscription ---
    await channel.assertExchange("inscription_events", "topic", {
      durable: false,
    });

    console.log("Connecté à RabbitMQ | Reply Queue:", replyQueue);

    // Consommation des réponses
    channel.consume(
      replyQueue,
      (msg) => {
        if (!msg?.properties?.correlationId) return;

        const correlationId = msg.properties.correlationId;
        const pending = pendingResponses.get(correlationId);

        if (pending) {
          const response = JSON.parse(msg.content.toString());
          pending.resolve(response);
          pendingResponses.delete(correlationId);
        }
      },
      { noAck: true }
    );
  } catch (err) {
    console.error("Erreur connexion RabbitMQ:", err);
    throw err;
  }
};

/**
 * 🔥 FONCTION FUSIONNÉE : permet d'envoyer soit :
 * - un event AUTH (token, action, type="auth")
 * - un event INSCRIPTION (event, routingKey, type="inscription")
 */
export const publishEvent = async ({
  type = "auth", // "auth" ou "inscription"
  token,
  action,
  event,
  routingKey = "inscription.request",
}) => {
  if (!channel) throw new Error("Channel RabbitMQ non initialisé");

  const correlationId = uuidv4();

  return new Promise((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    if (type === "auth") {
      // ---- PARTIE HEAD ----
      channel.publish(
        "",
        "auth_verify_queue",
        Buffer.from(JSON.stringify({ token, action })),
        {
          replyTo: replyQueue,
          correlationId,
          persistent: true,
        }
      );

      console.log("[AUTH] Événement envoyé:", { correlationId, action });
    } else {
      // ---- PARTIE YVES ----
      channel.publish(
        "inscription_events",
        routingKey,
        Buffer.from(JSON.stringify(event)),
        {
          replyTo: replyQueue,
          correlationId,
          persistent: true,
        }
      );

      console.log("[INSCRIPTION] Événement envoyé:", {
        correlationId,
        routingKey,
      });
    }
  });
};
