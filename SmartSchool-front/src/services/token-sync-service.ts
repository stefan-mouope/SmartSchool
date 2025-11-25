import amqp from "amqplib";
import { WebSocketServer } from "ws";

// ---- WEBSOCKET SERVER ----
const wss = new WebSocketServer({ port: 4001 });
console.log("🔥 WebSocket Server running on ws://localhost:4001");

// Broadcast à tous les clients React
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

// ---- RABBITMQ ----
async function start() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    // Déclarer l'échange et la file d'attente
    await channel.assertExchange("auth.events", "topic", { durable: false });
    await channel.assertQueue("token_refresh_queue", { durable: false });

    // Lier la file d'attente à l'échange avec le bon routing key
    await channel.bindQueue("token_refresh_queue", "auth.events", "auth.token.refreshed");

    console.log("🔗 Connected to RabbitMQ - listening for token.refreshed");

    channel.consume("token_refresh_queue", (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        console.log("📩 Event reçu depuis RabbitMQ :", content);

        // Envoi au frontend
        broadcast({
          event: "token.refreshed",
          access_token: content.access_token,
          refresh_token: content.refresh_token,
        });

        channel.ack(msg); // Accuser réception du message
      } catch (error) {
        console.error("❌ JSON parsing error:", error);
        channel.nack(msg); // Rejeter le message en cas d'erreur
      }
    });
  } catch (err) {
    console.error("❌ Error in token-sync-service:", err);
  }
}

// Lancement du service
start();