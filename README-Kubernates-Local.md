# 🏫 SmartSchool — Guide de Lancement Local

Ce projet utilise une architecture microservices déployée sur **Minikube** et orchestrée via **Kubernetes**.

Le script `deploy2.sh` s’occupe automatiquement de :
- Build des images Docker
- Chargement dans Minikube
- Déploiement de tous les services
- Port-forward automatique des services principaux

---

## 🚀 Lancer le projet en local

Assure-toi que **Minikube** est lancé :

```bash
minikube start
```

Ensuite exécute simplement :

```bash
./deploy2.sh
```

Tout fonctionne automatiquement grâce à ce script.

---

## 🌐 URLs accessibles en local

Une fois le script `deploy2.sh` exécuté, tu peux accéder à :

### 🔹 **Registry Service (Eureka)**
➡ **http://localhost:8761**

### 🔹 **API Gateway / Proxy Service**
➡ **http://localhost:8081**

### 🔹 **Frontend Web**
➡ **http://localhost:8082**

Tous les port-forwards sont gérés automatiquement par le script.

---

## 📦 Services et Ports Internes Kubernetes

| Service                     | Port interne | Type      |
|-----------------------------|--------------|-----------|
| PostgreSQL                  | 5432         | ClusterIP |
| Config Service              | 8080         | ClusterIP |
| Registry Service            | 8761         | ClusterIP |
| Proxy Service               | 8081         | ClusterIP |
| Inscription Service         | 5000         | ClusterIP |
| Registration Service        | 3000         | ClusterIP |
| Service Notes               | 8002         | ClusterIP |
| Authentification Service    | 8001         | ClusterIP |
| Frontend Service            | 8082         | ClusterIP |

---

## 🛑 Nettoyer les anciens port-forward (déjà géré par le script)

```bash
pkill -f "kubectl port-forward"
```

---

## 🧪 Vérification des pods

```bash
kubectl get pods -n smartschool
```

---

## 🎉 Félicitations

Ton architecture microservices SmartSchool tourne maintenant en local sur Minikube ! 🚀
