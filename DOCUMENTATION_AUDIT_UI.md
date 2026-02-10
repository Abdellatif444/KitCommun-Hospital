# 🛡️ Mise en place de l'Audit UI & Intégration Blockchain

## 📅 Date : 10 Février 2026
**Auteur** : Assistant (pour Ali)

---

## 🚀 1. Ce qui a été réalisé

L'objectif était de rendre l'interface d'audit (`audit-ui`) fonctionnelle et connectée au backend, en supprimant les fausses données (mock data) et en résolvant les problèmes d'environnement.

### A. Backend & Infrastructure (Docker)
- **Problème** : La commande `mvn` n'était pas disponible et le service d'audit (`audit-service`) manquait dans `docker-compose.yml`. De plus, il y avait un conflit de port (8083 utilisé par deux services).
- **Solution** :
    1.  Création du `Dockerfile` pour `audit-service`.
    2.  Ajout de `audit-service` dans `docker-compose.yml` sur le port **8083**.
    3.  Déplacement de `appointment-service` sur le port **8086** pour libérer le 8083.
    4.  Configuration de `patient-service` pour qu'il envoie ses logs à l'URL Docker de l'audit (`http://audit-service:8083`).
    5.  Correction du port du Gateway (`8080`) pour qu'il corresponde aux scripts de test.

### B. Frontend (Audit UI)
- **Suppression des Mock Data** :
    - `AuditLogs.jsx` : Le tableau affiche maintenant uniquement les données venant de l'API. Si l'API est éteinte, le tableau est vide (plus de "Dr. House" factice).
    - `Dashboard.jsx` : Les graphiques sont générés dynamiquement à partir des logs réels (activité des 7 derniers jours).
- **Améliorations UX** :
    - **Sidebar Dynamique** : Ajout d'un indicateur "Network Status" qui vérifie réellement la connexion au backend toutes les 30 secondes. (Vert = Connecté, Rouge = Offline).
    - **Layout** : Correction de la marge gauche (espace vide) qui décalait l'interface.

---

## 🛠️ 2. Comment Lancer le Projet

Puisque Maven n'est pas installé, nous utilisons **Docker Compose** pour tout gérer.

### Étape 1 : Démarrer l'environnement
Lancer cette commande unique à la racine du projet :

```powershell
docker-compose up -d --build
```

> **Note** : La première fois, cela peut prendre quelques minutes pour télécharger les images et compiler les projets.

### Étape 2 : Générer des données
Pour voir des lignes dans l'Audit UI, il faut qu'il y ait de l'activité. Utilisez le script de test :

```powershell
.\test_services.ps1
```

### Étape 3 : Visualiser
Accédez à l'interface : [http://localhost:5173](http://localhost:5173)

---

## 🔧 3. Détails Techniques des Modifications

| Fichier | Modification |
|---------|--------------|
| `docker-compose.yml` | Ajout `audit-service` et `blockchain-deployer`, fix ports. |
| `blockchain-network/truffle-config.js` | Correction du nom d'hôte (`ganache-blockchain`) pour le déploiement interne. |
| `audit-service/Dockerfile` | Création du fichier pour conteneurisation. |
| `audit-ui/src/pages/AuditLogs.jsx` | Nettoyage mock data, connexion API réelle. |
| `audit-ui/src/pages/Dashboard.jsx` | Graphiques dynamiques via API. |
| `audit-ui/src/components/Sidebar.jsx` | Health check backend réel. |
| `audit-ui/src/App.jsx` | Fix CSS layout. |

---

## 📦 4. Commandes Git pour Sauvegarder

```bash
git add .
git commit -m "feat: dockerize audit-service, remove mocks, and fix infra ports"
git push
```
