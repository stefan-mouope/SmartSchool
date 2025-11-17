// src/utils/auth.js
import { publishEvent } from '../config/rabbitmq.js';

export const verifyToken = async (token, action = 'create_eleve') => {
  try {
    const result = await publishEvent(token, action); // PASSE token + action
    console.log("Reponse auth", result);
    return result;
  } catch (err) {
    console.error("Erreur RPC RabbitMQ:", err);
    throw err;
  }
};