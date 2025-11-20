# Registration Service API

Service d'enregistrement pour la gestion des écoles, étudiants, professeurs, directeurs, classes, matières et années académiques.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier .env.example vers .env
cp .env.example .env
```

## 📦 Structure du Projet

```
src/
├── app.ts                    # Configuration Express
├── server.ts                 # Point d'entrée du serveur
├── config/                   # Configuration
│   ├── database.ts          # Configuration Sequelize
│   └── env.ts               # Variables d'environnement
├── modules/                  # Modules métier
│   └── registration/        # Module principal
│       ├── registration.module.ts
│       ├── models.ts
│       ├── school/          # CRUD École
│       ├── student/         # CRUD Étudiant
│       ├── teacher/         # CRUD Professeur
│       ├── director/        # CRUD Directeur
│       ├── classroom/       # CRUD Classe
│       ├── matter/          # CRUD Matière
│       └── academicYear/    # CRUD Année Académique
└── common/                   # Utilitaires partagés
    ├── middlewares/
    └── utils/
```

## 🏃 Démarrage

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Compiler le projet
npm run build

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000` par défaut.

## 📚 API Endpoints

### Health Check
- `GET /health` - Vérifier l'état du service
- `GET /` - Documentation des endpoints

### Schools (Écoles)
- `POST /api/schools` - Créer une école
- `GET /api/schools` - Récupérer toutes les écoles
- `GET /api/schools/:id` - Récupérer une école par ID
- `PUT /api/schools/:id` - Mettre à jour une école
- `DELETE /api/schools/:id` - Supprimer une école

### Students (Étudiants)
- `POST /api/students` - Créer un étudiant
- `GET /api/students` - Récupérer tous les étudiants
- `GET /api/students/:id` - Récupérer un étudiant par ID
- `GET /api/students/school/:schoolId` - Récupérer les étudiants d'une école
- `PUT /api/students/:id` - Mettre à jour un étudiant
- `DELETE /api/students/:id` - Supprimer un étudiant

### Teachers (Professeurs)
- `POST /api/teachers` - Créer un professeur
- `GET /api/teachers` - Récupérer tous les professeurs
- `GET /api/teachers/:id` - Récupérer un professeur par ID
- `GET /api/teachers/school/:schoolId` - Récupérer les professeurs d'une école
- `PUT /api/teachers/:id` - Mettre à jour un professeur
- `DELETE /api/teachers/:id` - Supprimer un professeur

### Directors (Directeurs)
- `POST /api/directors` - Créer un directeur
- `GET /api/directors` - Récupérer tous les directeurs
- `GET /api/directors/:id` - Récupérer un directeur par ID
- `GET /api/directors/school/:schoolId` - Récupérer les directeurs d'une école
- `PUT /api/directors/:id` - Mettre à jour un directeur
- `DELETE /api/directors/:id` - Supprimer un directeur

### Classrooms (Classes)
- `POST /api/classrooms` - Créer une classe
- `GET /api/classrooms` - Récupérer toutes les classes
- `GET /api/classrooms/:id` - Récupérer une classe par ID
- `GET /api/classrooms/school/:schoolId` - Récupérer les classes d'une école
- `GET /api/classrooms/level/:level` - Récupérer les classes par niveau
- `PUT /api/classrooms/:id` - Mettre à jour une classe
- `DELETE /api/classrooms/:id` - Supprimer une classe

### Matters (Matières)
- `POST /api/matters` - Créer une matière
- `GET /api/matters` - Récupérer toutes les matières
- `GET /api/matters/:id` - Récupérer une matière par ID
- `GET /api/matters/school/:schoolId` - Récupérer les matières d'une école
- `PUT /api/matters/:id` - Mettre à jour une matière
- `DELETE /api/matters/:id` - Supprimer une matière

### Academic Years (Années Académiques)
- `POST /api/academic-years` - Créer une année académique
- `GET /api/academic-years` - Récupérer toutes les années académiques
- `GET /api/academic-years/:id` - Récupérer une année académique par ID
- `GET /api/academic-years/current` - Récupérer l'année académique actuelle
- `PUT /api/academic-years/:id` - Mettre à jour une année académique
- `DELETE /api/academic-years/:id` - Supprimer une année académique

## 📝 Exemples de Requêtes

### Créer une école
```bash
curl -X POST http://localhost:3000/api/schools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "École Primaire Centrale",
    "email": "contact@ecole-centrale.fr",
    "phone_school": "+33 1 23 45 67 89",
    "region": "Île-de-France",
    "city": "Paris",
    "location": "123 Rue de la République",
    "founded_year": 1990
  }'
```

### Créer un étudiant
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "school_id": 1,
    "last_name": "Dupont",
    "first_name": "Jean",
    "birth_date": "2010-05-15",
    "address": "456 Avenue des Champs",
    "sex": "M",
    "phone_parent": "+33 1 98 76 54 32"
  }'
```

### Créer une année académique
```bash
curl -X POST http://localhost:3000/api/academic-years \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2024-09-01",
    "end_date": "2025-06-30"
  }'
```

## 🗄️ Base de Données

Le projet utilise **SQLite** avec **Sequelize ORM**. La base de données est créée automatiquement au premier démarrage dans le fichier `database.sqlite` à la racine du projet.

### Modèles

- **School** : Écoles
- **Student** : Étudiants (relation avec School)
- **Teacher** : Professeurs (relation avec School)
- **Director** : Directeurs (relation avec School)
- **ClassRoom** : Classes (relation avec School)
- **Matter** : Matières (relation avec School)
- **AcademicYear** : Années académiques (indépendant)

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Langage de programmation
- **Sequelize** - ORM pour SQLite
- **SQLite** - Base de données
- **ts-node-dev** - Développement avec rechargement automatique

## 📋 Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
PORT=3000
NODE_ENV=development
DATABASE_STORAGE=./database.sqlite
```

## 🔧 Scripts Disponibles

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Compiler le projet TypeScript
- `npm start` - Démarrer en mode production
- `npm test` - Exécuter les tests (à implémenter)

## 📌 Notes

- Les modèles sont automatiquement synchronisés avec la base de données au démarrage
- Les relations entre les modèles sont chargées automatiquement dans les réponses
- Les erreurs sont gérées avec des messages appropriés
- Le service est prêt pour être déployé en production

## 🚧 Améliorations Futures

- [ ] Ajouter l'authentification JWT
- [ ] Ajouter la validation des données avec Joi ou Zod
- [ ] Ajouter les tests unitaires et d'intégration
- [ ] Ajouter la documentation Swagger/OpenAPI
- [ ] Implémenter le hashage des mots de passe
- [ ] Ajouter la pagination pour les listes
- [ ] Ajouter le filtrage et la recherche
- [ ] Ajouter les logs structurés
- [ ] Implémenter la gestion des erreurs avancée

## 📄 Licence

ISC





# registration-service
