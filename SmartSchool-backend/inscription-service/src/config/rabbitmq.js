// rabbitmq.js
import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE || "inscription_events";

let channel = null;
let replyQueue = null;

// Map correlationId → { resolve, reject }
const pendingResponses = new Map();

/**
 * 🔌 Connexion à RabbitMQ + configuration RPC
 */
export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Déclare l'exchange commun
    await channel.assertExchange(RABBITMQ_EXCHANGE, "topic", { durable: false });

    // Queue de réponse RPC (exclusive → supprimée à la fin)
    replyQueue = await channel.assertQueue("", { exclusive: true });

    console.log("✅ RabbitMQ connecté — Reply queue :", replyQueue.queue);

    /**
     * 🎧 Consommation des réponses RPC
     */
    channel.consume(
      replyQueue.queue,
      (msg) => {
        if (!msg.properties?.correlationId) return;

        const correlationId = msg.properties.correlationId;
        const pending = pendingResponses.get(correlationId);

        if (pending) {
          try {
            const response = JSON.parse(msg.content.toString());
            pending.resolve(response);
          } catch (e) {
            pending.reject(e);
          }
          pendingResponses.delete(correlationId);
        }
      },
      { noAck: true }
    );

  } catch (err) {
    console.error("❌ ERREUR connexion RabbitMQ :", err);
    throw err;
  }
};

/**
 * 📤 Envoie un événement via RabbitMQ (mode RPC)
 * — Attend la réponse du consumer Python/Django
 */
export const publishEvent = async (event, routingKey = "inscription.request") => {
  if (!channel) throw new Error("❌ RabbitMQ non initialisé");

  const correlationId = uuidv4();

  const promise = new Promise((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    channel.publish(
      RABBITMQ_EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        replyTo: replyQueue.queue,
        correlationId,
        persistent: true
      }
    );

    console.log("📤 Event envoyé :", event, "→ correlationId:", correlationId);
  });

  return promise;
};

/**
 * 👂 Consumer générique (non-RPC)
 * — Pour écouter des events "fire and forget"
 */
export const consumeEvent = async (routingKey, queueName, callback) => {
  if (!channel) throw new Error("❌ RabbitMQ non initialisé");

  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, RABBITMQ_EXCHANGE, routingKey);

  console.log(`👂 Consumer actif : Queue=${queueName} → RoutingKey=${routingKey}`);

  channel.consume(queueName, async (msg) => {
    try {
      const content = JSON.parse(msg.content.toString());
      await callback(content, msg, channel);
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Erreur consumer :", err);
      channel.nack(msg, false, false); // on rejette le msg
    }
  });
};
