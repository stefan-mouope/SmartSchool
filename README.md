# SmartSchool

## Lancer l'environnement Docker

1. **Prérequis**  
   - Docker >= 24  
   - Docker Compose >= 2.20

2. **Construire et démarrer tous les services**
   ```bash
   docker compose up --build
   ```
   Le premier démarrage télécharge les images (RabbitMQ, Eureka) puis construit chaque microservice avec ses dépendances.

3. **Ports exposés par défaut**

   | Service                    | URL locale                |
   |---------------------------|---------------------------|
   | Frontend (Vite + Nginx)   | http://localhost:8080     |
   | Authentification (Django) | http://localhost:8000     |
   | Service d'inscription     | http://localhost:5000     |
   | Service d'enregistrement  | http://localhost:3000     |
   | Service des notes         | http://localhost:8001     |
   | RabbitMQ UI               | http://localhost:15672    |
   | Eureka                    | http://localhost:8761     |

4. **Arrêter l'ensemble**
   ```bash
   docker compose down
   ```

5. **Volumes persistants**
   - `inscription_data`, `registration_data`, `auth_data`, `service_notes_data` conservent les bases SQLite.

6. **Variables utiles**
   - Ajuster les URLs des APIs front avec les arguments `VITE_API_BASE_URL` et `VITE_REGISTRATION_SERVICE_URL` dans `docker-compose.yml`.
   - Les services Node/Django acceptent `RABBITMQ_URL`, `EUREKA_HOST`, `DATABASE_STORAGE`, etc., pour s'adapter à d'autres environnements.
