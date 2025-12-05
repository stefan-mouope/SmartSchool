# SmartSchool

Ce dépôt contient une plateforme micro-services pour une solution de gestion scolaire (SmartSchool). Le projet regroupe :

- Un front React + Vite (`SmartSchool-front`)
- Plusieurs services backend Node.js (Express) dans `SmartSchool-backend` (ex: `registration-service`, `inscription-service`)
- Des services Python/Django (`service-notes`, `systeme_authentification`)
- Une infrastructure Spring Cloud pour la configuration et la découverte de services (`smartSchool-config` : `config-service`, `registry-service`, `proxy-service`)
- Des composants d'infrastructure : Postgres, RabbitMQ

Ce README explique comment démarrer le projet en local avec Docker Compose, comment diagnostiquer les problèmes courants (notamment le message "No static resource REGISTRATION-SERVICE" rencontré sur le gateway) et fournit des commandes utiles.

## Table des matières

- [Prérequis](#prérequis)
- [Arborescence et services principaux](#arborescence-et-services-principaux)
- [Démarrage (Docker Compose)](#démarrage-docker-compose)
- [Vérifications et debugging](#vérifications-et-debugging)
- [Problèmes connus et corrections rapides](#problèmes-connus-et-corrections-rapides)
- [Développement local (frontend)](#développement-local-frontend)
- [Conseils et bonnes pratiques](#conseils-et-bonnes-pratiques)

## Prérequis

- Docker & Docker Compose (version compatible avec la syntaxe `3.8`)
- Node.js (si vous lancez le front ou des services Node en local sans docker)
- Java (pour builder les micro-services Spring si nécessaire)

Assurez-vous également que les ports listés ci-dessous sont libres sur votre machine.

## Arborescence et services principaux

Principaux dossiers :

- `SmartSchool-front` : frontend React + Vite (port via docker-compose : 8082)
- `SmartSchool-backend/registration-service` : service d'inscription (Node, port 3000)
- `SmartSchool-backend/inscription-service` : service (Node, port 5000)
- `SmartSchool-backend/service-notes` : service Django (port 8002)
- `SmartSchool-backend/systeme_authentification` : service Django (port 8001)
- `smartSchool-config` : infra Spring Cloud
	- `config-service` (Spring Cloud Config server, port 8080)
	- `registry-service` (Eureka registry, port 8761)
	- `proxy-service` (Spring Cloud Gateway, port 8081)

Infrastructure : `postgres` (5432), `rabbitmq` (5672 / 15672)

Ports exposés par docker-compose (par défaut) :

- Postgres : 5432
- Config server : 8080
- Gateway (proxy) : 8081
- Frontend : 8082
- Eureka (registry) : 8761
- registration-service (Node) : 3000
- inscription-service (Node) : 5000
- service-notes (Django) : 8002
- authentification-service (Django) : 8001

## Démarrage (Docker Compose)

0. deplacement de fichier

copier tous les fichiers du dossier `smartSchool-config/cloud-config-docker` et le place dans le dossier `smartSchool-config/cloud-config`.

Le moyen recommandé pour démarrer l'ensemble est via docker-compose (fichier `docker-compose.yml` à la racine).

1. Build et start :

```bash
docker compose build

```
2. create des bases de donnees
```bash
docker exec -it postgres-smartschool psql -U postgres
    CREATE DATABASE smartschool_db;
    CREATE DATABASE smartschool_db1;
    CREATE DATABASE smartschool_db2;
    CREATE DATABASE smartschool_db3;
    CREATE DATABASE smartschool_db4;
    exit;
```

3. Rebuild & demarrer les differents services
    
```bash
docker compose build
docker compose up -d
```

4. Suivre les logs (exemples) :

```bash
docker compose logs -f proxy-service registry-service config-service
```

5. Vérifier la santé des services (exemples) :

```bash
curl -f http://localhost:8080/actuator/health   # config-service
curl -f http://localhost:8761/actuator/health   # registry-service
curl -f http://localhost:8081/actuator/health   # proxy-service
```

Notes :
- Le `config-service` peut être démarré en mode `native` (le volume `smartSchool-config/cloud-config` est monté dans le container) ou en mode Git (voir `smartSchool-config/config-service` properties).
- Les healthchecks sont configurés dans le `docker-compose.yml` et peuvent retarder le démarrage des services dépendants.

## Vérifications et debugging

- Vérifier l'UI Eureka (lista des instances) : http://localhost:8761
- Vérifier que `registration-service` apparaît dans la liste des applications (nom attendu : `registration-service`).
- Vérifier les routes créées par le gateway (les logs du `proxy-service` contiennent les routes chargées par discovery locator).
- Pour tester la route via gateway :

```bash
curl -v http://localhost:8081/registration-service/
curl -v http://localhost:8081/registration-service/health
```

Si vous obtenez un 404 provenant de ResourceWebHandler ("No static resource REGISTRATION-SERVICE."), voir la section suivante.


## Développement local (frontend)

Pour lancer uniquement le frontend localement sans Docker :

```bash
# depuis SmartSchool-front
npm install
npm run dev
```

