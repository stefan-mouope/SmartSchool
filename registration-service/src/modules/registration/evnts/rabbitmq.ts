// rabbitmq.ts
import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async (): Promise<void> => {
  if (channel) return; // Déjà connecté

  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();

  await channel.assertExchange("inscription_events", "topic", { durable: false });

  console.log("Connecté à RabbitMQ, exchange 'inscription_events' prêt.");
};

export const getChannel = (): amqp.Channel => {
  if (!channel) throw new Error("RabbitMQ non connecté. Appelez connectRabbitMQ() d'abord.");
  return channel;
};

// Type pour les handlers
type EventHandler = (event: any, msg: amqp.ConsumeMessage, channel: amqp.Channel) => Promise<void> | void;

/**
 * Abonne un handler à un routing key (ou pattern)
 */
// rabbitmq.ts
export const consumeEvent = async (
    routingKey: string,
    queueName: string,
    handler: (event: any, msg: amqp.ConsumeMessage, channel: amqp.Channel) => Promise<void>
  ) => {
    const ch = getChannel();
    const { queue } = await ch.assertQueue(queueName, { durable: false });
    await ch.bindQueue(queue, "inscription_events", routingKey);
  
    ch.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        await handler(event, msg, ch);
        ch.ack(msg);
      } catch (err) {
        console.error("Erreur handler:", err);
        ch.nack(msg, false, false);
      }
    }, { noAck: false });
  };