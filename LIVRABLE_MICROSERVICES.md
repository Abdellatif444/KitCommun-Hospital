# 📄 Livrable : Identification des Microservices (Modèle Annexe 1)

**Projet :** Sujet 1 - Intégrité & Traçabilité par Blockchain  
**Date :** 09/02/2026

---

## 1. Microservice : [audit-service]

### Responsabilité :
Ce microservice est le garant de l'intégrité et de la traçabilité du système. Il agit comme un tiers de confiance numérique en assurant l'interface entre le monde applicatif standard (Kit Commun) et la Blockchain privée. Il a pour responsabilité unique de sceller cryptographiquement les événements sensibles (CRUD) et de restituer un historique certifié aux administrateurs, sans jamais exposer ni stocker de données médicales en clair.

### Principales fonctionnalités :
1.  **Enregistrement Blockchain (Ledger)** : Réception des logs depuis les autres microservices, validation RGPD (anonymisation), et ancrage immuable dans la Blockchain (via Smart Contract).
2.  **Consultation d'Audit** : Recherche multicritère (User, Patient, Date) dans l'historique des transactions pour les interfaces de contrôle.
3.  **Vérification d'Intégrité** : Calcul et vérification des hashs pour garantir qu'aucune donnée n'a été altérée depuis son enregistrement.
4.  **Gestion des Identités Blockchain** : Gestion sécurisée du Wallet (clé privée) permettant de signer toutes les transactions émises par le système.

### Exemple d'API :

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/audit/log` | Reçoit un événement (User, Action, Ressource), le pseudonymise et l'inscrit dans un nouveau bloc Blockchain. Retourne le Hash de transaction. |
| **GET** | `/audit/logs` | Récupère la liste paginée des transactions auditées, enrichies de leur statut de validation blockchain. |
| **GET** | `/audit/logs/search` | Filtre l'historique par `userId`, `resourceId` ou plage de dates (`startDate`, `endDate`). |
| **GET** | `/audit/integrity` | Vérifie l'état de connexion au nœud Blockchain et l'intégrité globale de la chaîne (Block height, Sync status). |

---

## 2. Microservice : [ganache-blockchain] (Infrastructure)

### Responsabilité :
Fournir le réseau de registre distribué (DLT) immuable. Il héberge le Smart Contract et maintient l'état global des transactions validées.

### Principales fonctionnalités :
1.  **Exécution des Smart Contracts** : Exécute le code Solidity `AuditLog` pour valider et stocker les preuves.
2.  **Consensus & Minage** : Valide les nouveaux blocs et les ajoute à la chaîne.
3.  **Persistance Immuable** : Garantit que les transactions enregistrées ne peuvent être ni modifiées ni supprimées.

### Exemple d'API (JSON-RPC) :

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `eth_sendTransaction` | Soumet une transaction signée pour exécution par le Smart Contract. |
| **POST** | `eth_call` | Lecture de l'état du Smart Contract sans générer de nouvelle transaction (Appel "View"). |

---
*Document généré conformément au modèle de l'Annexe 1 du Cahier des Charges.*
