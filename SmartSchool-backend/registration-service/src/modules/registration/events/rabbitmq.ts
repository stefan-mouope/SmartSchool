// modules/registration/events/rabbitmq.ts
import amqp, { Channel, Replies, ConsumeMessage } from "amqplib";
import { v4 as uuidv4 } from "uuid";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE || "inscription_events";

let channel: Channel | null = null;
let replyQueue: Replies.AssertQueue | null = null;

// Map pour gérer les réponses RPC
const pendingResponses = new Map<
  string,
  { resolve: (value: any) => void; reject: (err: any) => void }
>();

// ---------------------------------------------------------
// 🔌 Connexion à RabbitMQ
// ---------------------------------------------------------
export const connectRabbitMQ = async (): Promise<void> => {
  if (channel) return; // Déjà connecté

  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  // Exchange utilisé pour tous les events du service inscription
  await channel.assertExchange(RABBITMQ_EXCHANGE, "topic", { durable: false });

  // Création de la replyQueue (RPC Response Queue)
  replyQueue = await channel.assertQueue("", { exclusive: true });

  console.log("🐰 RabbitMQ connecté. ReplyQueue :", replyQueue.queue);

  // Consumer de la replyQueue (gestion RPC)
  channel.consume(
    replyQueue.queue,
    (msg) => {
      if (!msg) return;

      const correlationId = msg.properties.correlationId;
      if (!correlationId) return;

      const pending = pendingResponses.get(correlationId);
      if (!pending) return;

      try {
        pending.resolve(JSON.parse(msg.content.toString()));
      } catch (err) {
        pending.reject(err);
      } finally {
        pendingResponses.delete(correlationId);
      }
    },
    { noAck: true }
  );
};

// ---------------------------------------------------------
// 📡 Obtenir le channel
// ---------------------------------------------------------
export const getChannel = (): Channel => {
  if (!channel) throw new Error("RabbitMQ non connecté. Appelez connectRabbitMQ() d'abord.");
  return channel;
};

export const getReplyQueue = (): string => {
  if (!replyQueue) throw new Error("ReplyQueue non initialisée");
  return replyQueue.queue;
};

// ---------------------------------------------------------
// 📤 Appel RPC (client → autre service)
// ---------------------------------------------------------
export const callRpc = async (
  routingKey: string,
  data: any,
  timeoutMs = 10000
): Promise<any> => {
  const correlationId = uuidv4();

  return new Promise((resolve, reject) => {
    // Timeout de sécurité
    const timer = setTimeout(() => {
      pendingResponses.delete(correlationId);
      reject(new Error(`RPC Timeout → ${routingKey}`));
    }, timeoutMs);

    // Enregistrer l’attente
    pendingResponses.set(correlationId, {
      resolve: (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      reject,
    });

    // Envoi du message RPC
    getChannel().publish(
      RABBITMQ_EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify({ data })),
      {
        correlationId,
        replyTo: getReplyQueue(),
      }
    );
  });
};

// ---------------------------------------------------------
// 👂 Consume Event (écoute d’événements → handler)
// ---------------------------------------------------------
export const consumeEvent = async (
  routingKey: string,
  queueName: string,
  handler: (event: any, msg: ConsumeMessage, channel: Channel) => Promise<void>
): Promise<void> => {
  const ch = getChannel();

  await ch.assertQueue(queueName, { durable: false });
  await ch.bindQueue(queueName, RABBITMQ_EXCHANGE, routingKey);

  console.log(`👂 Consumer prêt → queue: ${queueName} | rk: ${routingKey}`);

  ch.consume(
    queueName,
    async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        await handler(event, msg, ch);
        ch.ack(msg);
      } catch (err) {
        console.error("Erreur dans le consumer:", err);
        ch.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
};

// ---------------------------------------------------------
// 📤 Publish RPC (réponse attendue)
// ---------------------------------------------------------
export const publishEvent = async <T = any>(
  event: T,
  routingKey: string = "inscription.request"
): Promise<any> => {
  if (!channel) throw new Error("Channel RabbitMQ non initialisé");
  if (!replyQueue) throw new Error("ReplyQueue non initialisée");

  const correlationId = uuidv4();

  return new Promise<any>((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    channel!.publish(
      RABBITMQ_EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        replyTo: replyQueue.queue,
        correlationId,
        persistent: false,
      }
    );

    // Timeout si pas de réponse
    setTimeout(() => {
      if (pendingResponses.has(correlationId)) {
        pendingResponses.get(correlationId)?.reject(new Error("Timeout RabbitMQ"));
        pendingResponses.delete(correlationId);
      }
    }, 10000);
  });
};

// ---------------------------------------------------------
// 📤 Publish dynamique (exchange variable)
// ---------------------------------------------------------
export const publishDynamiqueEvent = async <T = any>(
  exchange: string,
  event: T,
  routingKey: string
): Promise<any> => {
  if (!channel) throw new Error("Channel RabbitMQ non initialisé");
  if (!replyQueue) throw new Error("ReplyQueue non initialisée");

  const correlationId = uuidv4();

  return new Promise<any>((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    channel!.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        replyTo: replyQueue.queue,
        correlationId,
        persistent: false,
      }
    );

    // Timeout
    setTimeout(() => {
      if (pendingResponses.has(correlationId)) {
        pendingResponses.get(correlationId)?.reject(new Error("Timeout RabbitMQ"));
        pendingResponses.delete(correlationId);
      }
    }, 10000);
  });
};
