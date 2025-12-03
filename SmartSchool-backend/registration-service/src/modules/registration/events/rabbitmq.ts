import amqp, { Channel, ConsumeMessage, Replies } from "amqplib";
import { v4 as uuidv4 } from "uuid";

let channel: Channel | null = null;
let replyQueue: Replies.AssertQueue | null = null;

// Map des réponses RPC en attente
const pendingResponses = new Map<
  string,
  { resolve: (data: any) => void; reject: (err: any) => void }
>();

// ---------------------------------------------------------
// 🔌 Connexion à RabbitMQ (avec retry)
// ---------------------------------------------------------
export const connectRabbitMQ = async (): Promise<void> => {
  if (channel) return;

  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`);
      channel = await connection.createChannel();

      // Exchange principal
      await channel.assertExchange("inscription_events", "topic", { durable: false });

      // Queue de réponse RPC (exclusif)
      replyQueue = await channel.assertQueue("", { exclusive: true });

      console.log("🐰 RabbitMQ connecté. ReplyQueue :", replyQueue.queue);

      // Consommation automatique des réponses RPC
      channel.consume(
        replyQueue.queue,
        (msg) => {
          if (!msg) return;
          const correlationId = msg.properties.correlationId;

          if (pendingResponses.has(correlationId)) {
            const payload = JSON.parse(msg.content.toString());
            pendingResponses.get(correlationId)!.resolve(payload);
            pendingResponses.delete(correlationId);
          }
        },
        { noAck: true }
      );

      return;
    } catch (err) {
      retries++;
      console.log(`⏳ Tentative ${retries}/${maxRetries} - En attente de RabbitMQ...`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  throw new Error("❌ Impossible de se connecter à RabbitMQ après plusieurs tentatives");
};

// ---------------------------------------------------------
// 📡 Obtenir le channel
// ---------------------------------------------------------
export const getChannel = (): Channel => {
  if (!channel) throw new Error("RabbitMQ non connecté. Appelez connectRabbitMQ() d'abord.");
  return channel;
};

// ---------------------------------------------------------
// 📦 Obtenir la replyQueue (objet complet)
// ---------------------------------------------------------
export const getReplyQueue = (): Replies.AssertQueue => {
  if (!replyQueue) throw new Error("ReplyQueue non initialisée");
  return replyQueue;
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
    // Timeout RPC
    const timer = setTimeout(() => {
      pendingResponses.delete(correlationId);
      reject(new Error(`RPC Timeout → ${routingKey}`));
    }, timeoutMs);

    pendingResponses.set(correlationId, { resolve, reject });

    getChannel().publish(
      "inscription_events",
      routingKey,
      Buffer.from(JSON.stringify({ data })),
      {
        correlationId,
        replyTo: getReplyQueue().queue,
      }
    );
  });
};

// ---------------------------------------------------------
// 👂 Consommation d'événements
// ---------------------------------------------------------
export const consumeEvent = async (
  routingKey: string,
  queueName: string,
  handler: (event: any, msg: ConsumeMessage, channel: Channel) => Promise<void>
): Promise<void> => {
  const ch = getChannel();

  await ch.assertQueue(queueName, { durable: false });
  await ch.bindQueue(queueName, "inscription_events", routingKey);

  console.log(`👂 Consumer prêt → queue: ${queueName} | rk: ${routingKey}`);

  ch.consume(
    queueName,
    async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        await handler(event, msg, ch);
      } catch (err) {
        console.error("Erreur dans le consumer:", err);
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
  routingKey = "inscription.request"
): Promise<any> => {
  const correlationId = uuidv4();

  return new Promise((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    getChannel().publish(
      "inscription_events",
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        replyTo: getReplyQueue().queue,
        correlationId,
        persistent: false,
      }
    );

    // Timeout sécuritaire
    setTimeout(() => {
      if (pendingResponses.has(correlationId)) {
        pendingResponses.get(correlationId)!.reject(new Error("Timeout RabbitMQ"));
        pendingResponses.delete(correlationId);
      }
    }, 10000);
  });
};

// ---------------------------------------------------------
// 📤 Publish dynamique avec exchange variable
// ---------------------------------------------------------

export const publishDynamiqueEvent = async <T = any>(
  exchange: string,
  event: T,
  routingKey: string
): Promise<any> => {
  const correlationId = uuidv4();

  return new Promise((resolve, reject) => {
    pendingResponses.set(correlationId, { resolve, reject });

    const channel = getChannel();
    const replyQueue = getReplyQueue().queue;

    console.log(`[Publisher] Envoi du message sur "${routingKey}" avec correlationId ${correlationId}`);

    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        replyTo: replyQueue,
        correlationId,
        persistent: false,
      }
    );

    // Timeout
    const timer = setTimeout(() => {
      if (pendingResponses.has(correlationId)) {
        pendingResponses.get(correlationId)!.reject(new Error("Timeout RabbitMQ"));
        pendingResponses.delete(correlationId);
        console.error(`[Publisher] Timeout pour correlationId ${correlationId}`);
      }
    }, 20000); // 20s pour donner plus de marge

    // Nettoyage si réponse reçue
    pendingResponses.get(correlationId)!.resolve = (data: any) => {
      clearTimeout(timer);
      resolve(data);
    };
  });
};
