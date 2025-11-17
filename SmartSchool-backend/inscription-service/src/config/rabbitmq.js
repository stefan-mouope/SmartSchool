

// 🔗 Connexion à RabbitMQ et configuration du consommateur
import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";

let channel;
let replyQueue;
const pendingResponses = new Map();

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();

  // Déclare un exchange
  await channel.assertExchange("inscription_events", "topic", { durable: false });

  // Déclare une queue de réponse exclusive
  replyQueue = await channel.assertQueue("", { exclusive: true });

  console.log("✅ Connecté à RabbitMQ, queue de réponse :", replyQueue.queue);

  // Écoute les réponses
  channel.consume(
    replyQueue.queue,
    (msg) => {
      if (!msg.properties.correlationId) return;

      const correlationId = msg.properties.correlationId;
      const pending = pendingResponses.get(correlationId);

      if (pending) {
        const response = JSON.parse(msg.content.toString());
        pending.resolve(response); // Répond à la promesse en attente
        pendingResponses.delete(correlationId);
      }
    },
    { noAck: true }
  );
};

/**
 * Publie un événement et attend la réponse du consommateur
 */
export const publishEvent = async (event,routingKey='inscription.request') => {
  if (!channel) throw new Error("❌ Channel RabbitMQ non initialisé");

  const correlationId = uuidv4();

  const promise = new Promise((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    channel.publish(
      "inscription_events",
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { replyTo: replyQueue.queue, correlationId, persistent: true }
    );

    console.log("📤 Événement publié :", event, "correlationId:", correlationId);
  });

  // Retourne la réponse quand elle arrive
  return promise;
};

