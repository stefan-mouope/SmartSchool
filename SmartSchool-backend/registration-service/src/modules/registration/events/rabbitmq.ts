// rabbitmq.ts
import amqp, { Replies, Channel } from "amqplib";
import { v4 as UUIDV4 } from "uuid";

let channel: Channel | null = null;
let replyQueue: Replies.AssertQueue | null = null;

const pendingResponses = new Map<
  string,
  { resolve: (value: any) => void; reject: (reason?: any) => void }
>();

// ✅ Connexion RabbitMQ
export const connectRabbitMQ = async (): Promise<void> => {
  if (channel) return; // Déjà connecté

  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();

  await channel.assertExchange("inscription_events", "topic", { durable: false });

  // 🔥 Crée la replyQueue pour recevoir les réponses RPC
  replyQueue = await channel.assertQueue("", { exclusive: true });

  // 🔥 Consommer la replyQueue
  channel.consume(
    replyQueue.queue,
    (msg) => {
      if (!msg) return;
      const correlationId = msg.properties.correlationId;
      const resolver = pendingResponses.get(correlationId);
      if (resolver) {
        resolver.resolve(JSON.parse(msg.content.toString()));
        pendingResponses.delete(correlationId);
      }
    },
    { noAck: true }
  );

  console.log("🐰 Connecté à RabbitMQ, exchange 'inscription_events' prêt et replyQueue créée.");
};

// ✅ Obtenir le channel
export const getChannel = (): Channel => {
  if (!channel) throw new Error("RabbitMQ non connecté. Appelez connectRabbitMQ() d'abord.");
  return channel;
};

// ✅ Abonnement à un événement
export const consumeEvent = async (
  routingKey: string,
  queueName: string,
  handler: (event: any, msg: amqp.ConsumeMessage, channel: Channel) => Promise<void>
) => {
  const ch = getChannel();
  const { queue } = await ch.assertQueue(queueName, { durable: false });
  await ch.bindQueue(queue, "inscription_events", routingKey);

  ch.consume(
    queue,
    async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        await handler(event, msg, ch);
        ch.ack(msg);
      } catch (err) {
        console.error("Erreur handler:", err);
        ch.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
};

// ✅ Publier un événement RPC
export const publishEvent = async <T = any>(
  event: T,
  routingKey: string = "inscription.request"
): Promise<any> => {
  if (!channel) throw new Error("❌ Channel RabbitMQ non initialisé");
  if (!replyQueue) throw new Error("❌ replyQueue non initialisée");

  const correlationId = UUIDV4();

  return new Promise<any>((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    channel.publish(
      "inscription_events",
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        replyTo: replyQueue.queue,
        correlationId,
        persistent: true,
      }
    );

    console.log("📤 Événement publié :", event, "correlationId:", correlationId);

    // ❌ Optionnel : timeout si pas de réponse
    setTimeout(() => {
      if (pendingResponses.has(correlationId)) {
        pendingResponses.get(correlationId)?.reject(new Error("Timeout RabbitMQ"));
        pendingResponses.delete(correlationId);
      }
    }, 10000); // 10s
  });
};


// ✅ Publier un événement RPC
export const publishDynamiqueEvent = async <T = any>(
  exchange: string,
  event: T,
  routingKey: string 
): Promise<any> => {
  if (!channel) throw new Error("❌ Channel RabbitMQ non initialisé");
  if (!replyQueue) throw new Error("❌ replyQueue non initialisée");

  const correlationId = UUIDV4();

  return new Promise<any>((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        replyTo: replyQueue.queue,
        correlationId,
        persistent: true,
      }
    );

    console.log("📤 Événement publié :", event, "correlationId:", correlationId);

    // ❌ Optionnel : timeout si pas de réponse
    setTimeout(() => {
      if (pendingResponses.has(correlationId)) {
        pendingResponses.get(correlationId)?.reject(new Error("Timeout RabbitMQ"));
        pendingResponses.delete(correlationId);
      }
    }, 10000); // 10s
  });
};
