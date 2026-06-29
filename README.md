# EventSync

EventSync est une plateforme web dédiée à la gestion d'événements en temps réel. Elle permet d'afficher un planning multi-track avec des sessions live, de consulter les profils des intervenants, de poser des questions en direct via un système de Q&A, et de sauvegarder ses sessions favorites.

Le projet est divisé en deux parties : un **frontend Next.js** (ce que l'utilisateur voit) et un **backend Express** (l'API qui alimente les données). Un panel d'administration séparé permet de tout gérer sans toucher au code — voir le repo `Event-Sync-Admin`.

---

## Ce que fait l'application

- **Planning multi-track** — les sessions sont organisées par salle et par créneau horaire. Un badge rouge animé signale les sessions en cours (LIVE). Si plusieurs événements existent, des onglets permettent de naviguer entre eux.
- **Profils intervenants** — chaque speaker a sa page avec bio, photo, liens externes et liste de ses sessions.
- **Q&A en direct** — pendant une session live, les participants peuvent poser des questions et voter pour celles des autres. Le formulaire n'apparaît que pendant la session active.
- **Favoris** — les sessions peuvent être ajoutées aux favoris, sauvegardées localement dans le navigateur.
- **Mode sombre / clair** — toggle persistant dans la navbar.

---

## Stack technique

**Frontend**
- Next.js 16 avec App Router
- React 19
- Tailwind CSS v4

**Backend**
- Express 5 (Node.js, ESModules)
- Prisma ORM
- PostgreSQL
- JWT pour l'authentification

---

## Structure du projet

```
demo-repository/
├── frontend/                  # Application Next.js → port 3000
│   └── src/
│       ├── app/               # Pages (App Router Next.js)
│       │   ├── page.jsx       # Homepage
│       │   ├── speakers/      # Liste + profil intervenant
│       │   ├── sessions/[id]/ # Détail d'une session
│       │   ├── qa/            # Questions en direct
│       │   └── favoris/       # Sessions favorites
│       ├── components/        # Hero, Planning, Navbar, etc.
│       └── lib/api.js         # Toutes les fonctions d'appel API
│
└── Backend/                   # API REST Express → port 4000
    ├── src/
    │   ├── controllers/       # Logique métier (events, sessions, speakers…)
    │   ├── routes/            # Définition des routes
    │   └── middleware/        # Auth JWT, gestion des erreurs
    └── prisma/
        └── schema.prisma      # Modèle de données complet
```

---

## Installation et lancement

### Prérequis

- **Node.js 18+**
- **PostgreSQL** installé et démarré, avec une base de données nommée `eventsync`

---

### 1. Configurer et démarrer le Backend

```bash
cd Backend
npm install
```

Créer un fichier `.env` à la racine du dossier `Backend/` avec ce contenu :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/eventsync"
PORT=4000
JWT_SECRET=eventsync_jwt_secret_2026
```

Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe de votre utilisateur PostgreSQL.

Appliquer le schéma de base de données puis démarrer le serveur :

```bash
npx prisma migrate deploy
npm run dev
```

Le backend tourne sur **http://localhost:4000**.

---

### 2. Configurer et démarrer le Frontend

```bash
cd frontend
npm install
```

Le fichier `frontend/.env` est déjà présent et configuré par défaut :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ADMIN_URL=http://localhost:5173
```

Démarrer le frontend :

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**.

---

## Modèle de données

Le schéma Prisma reflète la hiérarchie suivante :

```
Organizer
  └── Event
        ├── Room
        ├── Speaker
        │     └── SpeakerLink
        └── Session
              ├── SessionSpeaker  (liaison Session ↔ Speaker)
              └── Question        (Q&A)
```

Chaque `Event` appartient à un `Organizer`. Les sessions peuvent avoir plusieurs intervenants (via `SessionSpeaker`) et sont rattachées à une salle.

---

## API — Routes principales

### Événements

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/events` | Liste paginée des événements |
| `GET` | `/api/events/:slug` | Événement par slug (URL publique) |
| `GET` | `/api/events/id/:id` | Événement par UUID (usage admin) |
| `POST` | `/api/events` | Créer un événement simple |
| `POST` | `/api/events/full` | Créer un événement + salles + speakers + sessions en une seule requête |
| `PUT` | `/api/events/id/:id` | Modifier un événement (slug auto-mis à jour si le titre change) |
| `DELETE` | `/api/events/id/:id` | Supprimer un événement et toutes ses données liées |

### Sessions, Speakers, Salles

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/sessions?eventId=` | Sessions, filtrables par événement |
| `GET` | `/api/sessions/:id` | Détail d'une session |
| `POST` | `/api/sessions` | Créer une session |
| `PUT` | `/api/sessions/:id` | Modifier une session |
| `DELETE` | `/api/sessions/:id` | Supprimer une session |
| `GET` | `/api/speakers?eventId=` | Speakers, filtrables par événement |
| `GET` | `/api/rooms?eventId=` | Salles, filtrables par événement |

### Q&A

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/sessions/:id/questions` | Questions d'une session |
| `POST` | `/api/sessions/:id/questions` | Poser une question |
| `POST` | `/api/sessions/:sessionId/questions/:id/upvote` | Voter pour une question |
| `GET` | `/api/questions` | Toutes les questions (admin) |
| `DELETE` | `/api/questions/:id` | Supprimer une question (admin) |

### Auth

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Connexion — retourne un token JWT |

Les routes d'écriture (POST, PUT, DELETE) nécessitent le header :
```
Authorization: Bearer <token>
```

---

## Notes techniques

**Suppression en cascade** — Supprimer un événement supprime automatiquement dans l'ordre : questions → sessionSpeakers → sessions → speakerLinks → speakers → rooms → event. Tout se passe dans une transaction Prisma pour éviter les états incohérents.

**Slug automatique** — Quand le titre d'un événement est modifié, le slug est recalculé automatiquement. Si le slug généré existe déjà, un suffixe numérique est ajouté (`mon-event-2`). Il est aussi possible de définir un slug manuellement.

**Sélection intelligente de l'événement** — Sur la homepage, l'événement affiché dans le Hero et sélectionné dans le Planning est celui qui a le plus de sessions LIVE en ce moment. S'il n'y en a pas, on affiche le premier événement par défaut.
