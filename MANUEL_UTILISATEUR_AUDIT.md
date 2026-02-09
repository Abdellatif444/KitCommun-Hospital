# Manuel Utilisateur - Système d'Audit Blockchain (MedChain)

## 1. Introduction
Ce manuel décrit l'utilisation de l'interface d'audit sécurisée **MedChain**. Cette application permet aux auditeurs de visualiser, vérifier et tracer toutes les actions effectuées sur les données sensibles (Patients, Consultations) grâce à la technologie Blockchain.

---

## 2. Accès à l'Application
- **URL** : `http://localhost:5173`
- **Rôles** : Auditeur, Administrateur, Médecin (Simulation).

---

## 3. Fonctionnalités Principales

### A. Dashboard (Tableau de Bord)
La page d'accueil offre une vue synthétique de l'état du système :
- **Volume de Transactions** : Graphique en temps réel.
- **Derniers Logs** : Flux d'activité récent.
- **État du Système** : Indicateurs de connexion Backend et Blockchain.

### B. Audit Trails (Historique des Logs)
> **Accès :** Menu latéral > "Audit Trails"
Cette vue permet de consulter les logs détaillés stockés dans la base de données SQL (Off-chain) pour une recherche rapide.
- **Filtrage** : Par Utilisateur, Action, ou Patient.
- **Export** : Bouton "Export Proof" pour télécharger une preuve JSON signée cryptographiquement.

### C. Blockchain View (Visualisation Blockchain)
> **Accès :** Menu latéral > "Blockchain View"
C'est le cœur de la sécurité. Cette vue affiche les **blocs minés** sur la blockchain Ethereum privée.
- **Structure** : Chaque bloc contient plusieurs transactions.
- **Données Affichées** :
  - **Action** : Type d'opération (ex: `CREATE_PATIENT`).
  - **Resource** : Hash de l'identifiant ressource (pour confidentialité).
  - **User Hash** : Identifiant pseudonymisé de l'auteur.
  - **Statut** : "VERIFIED" (garanti par le consensus blockchain).
- **Immuabilité** : Les données ici sont inaltérables et servent de preuve légale.

---

## 4. Simulations (Pour Démonstration)

### A. Gestion Patients (Démo)
> **Accès :** Menu latéral > "Gestion Patients"
Cette interface permet de simuler l'activité d'un personnel administratif.
1. **Génération Rapide** : Crée un patient aléatoire complet (Nom, Prénom, ID National, Date Naissance).
   - *Prouve le déclenchement automatique d'un log Blockchain.*
   - *Une notification affiche l'ID créé.*
2. **Nouveau Patient** : Formulaire manuel (les champs techniques sont auto-générés).
3. **Modifier/Supprimer** : Teste les logs `UPDATE_PATIENT` et `DELETE_PATIENT`.

### B. Consultations (Démo)
> **Accès :** Menu latéral > "Consultations (Démo)"
Permet de simuler la prise de rendez-vous médical.
1. **Saisir un ID Patient** (celui généré précédemment).
2. **Planifier Consultation** : Crée un rendez-vous et génère un log `CREATE_APPOINTMENT`.
3. **Visualisation** : Liste l'historique des rendez-vous pour ce patient.

---

## 5. Scénario de Test Typique (Audit)
Pour valider le système lors de la soutenance :
1. Allez dans **Gestion Patients**.
2. Cliquez sur **"Génération Rapide"**. Notez l'ID affiché (ex: `ID: 25`).
3. Allez dans **Blockchain View**.
4. Observez le dernier bloc. Vous y verrez une transaction :
   - **Action** : `CREATE_PATIENT`
   - **Resource** : `Hash: 0x...`
   - **User** : `0x...`
5. Cela confirme que l'action a été scellée numériquement sans intervention humaine directe sur les logs.

---

## 6. Dépannage
- **Backend Disconnected** : Vérifiez que les conteneurs Docker (`audit-service`, `patient-service`, `ganache`) sont lancés via `docker-compose up`.
- **Transactions manquantes** : Rafraîchissez la page (F5). La blockchain peut prendre quelques secondes pour miner un bloc.

---
*Projet Kit Commun - Architecture Microservices & Blockchain*
