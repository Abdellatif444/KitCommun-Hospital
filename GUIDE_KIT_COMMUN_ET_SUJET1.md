# 📘 Guide Simplifié - Kit Commun et Sujet 1 (Blockchain)

## 🎯 Vue d'Ensemble

Vous avez **DEUX PHASES** distinctes :

1. **PHASE 1 : Kit Commun** (Semaine 3) - À FAIRE EN PREMIER
2. **PHASE 2 : Sujet 1 Blockchain** (Semaines 4-5) - À FAIRE APRÈS

---

## 📋 PHASE 1 : KIT COMMUN - Ce que vous devez faire

### ✅ Objectif Final du Kit Commun

Avoir un système fonctionnel avec :
- ✅ Tous les endpoints CRUD fonctionnels
- ✅ Authentification JWT opérationnelle
- ✅ Docker-compose qui démarre sans erreur
- ✅ Swagger accessible pour chaque service
- ✅ Les scénarios fonctionnels de référence qui fonctionnent

---

### 🔍 État Actuel de Votre Template

Vous avez reçu une **template (squelette)** qui contient :
- ✅ Structure des microservices (patients, staff, appointments, auth, medical-records)
- ✅ Configuration de base (Docker, Spring Boot)
- ✅ Classes Java avec les annotations
- ❌ **MAIS** : Logique métier non implémentée
- ❌ **MAIS** : JWT non fonctionnel (placeholders)
- ❌ **MAIS** : Certains endpoints incomplets

---

### 📝 Ce que vous DEVEZ faire pour compléter le Kit Commun

#### **1. Compléter l'Authentification JWT (CRITIQUE)**

**Actuellement dans votre code :**
```java
// Dans AuthServiceImpl.java - LIGNE 102
.accessToken("placeholder-access-token")  // ❌ Non fonctionnel
.refreshToken("placeholder-refresh-token") // ❌ Non fonctionnel
```

**Vous devez implémenter :**
- [ ] Créer une classe `JwtUtil` ou `JwtService` pour générer des vrais tokens JWT
- [ ] Générer des tokens avec les claims (username, roles, expiration)
- [ ] Valider les tokens dans le Gateway (filtre `AuthenticationFilter`)
- [ ] Implémenter le refresh token

**Ressources nécessaires :**
- Bibliothèque JWT (ex: `io.jsonwebtoken:jjwt`)
- Clé secrète JWT (pas en dur dans le code)
- Configuration dans `application.yml`

---

#### **2. Finaliser les Endpoints CRUD**

**À vérifier pour chaque service :**

**Patient Service :**
- ✅ Créer un patient (`POST /api/patients`)
- ✅ Lire tous les patients (`GET /api/patients`)
- ✅ Lire un patient par ID (`GET /api/patients/{id}`)
- ✅ Mettre à jour (`PUT /api/patients/{id}`)
- ✅ Supprimer (`DELETE /api/patients/{id}`)
- ⚠️ Recherche par nom (`GET /api/patients/search?query=...`)

**Appointment Service (Consultations) :**
Selon le cahier des charges, vous avez :
- `POST /api/appointments` → Créer une consultation
- `GET /api/appointments?patientId={id}` → Historique d'un patient
- `PUT /api/appointments/{id}` → Mettre à jour une consultation

**Vérifier que :**
- Les données sont bien enregistrées en PostgreSQL
- Les relations patient ↔ consultation fonctionnent
- Les validations fonctionnent (DTO + annotations)

---

#### **3. Sécurité et Validation**

**Contraintes OBLIGATOIRES :**

1. **JWT obligatoire** : Tous les endpoints doivent être protégés (sauf `/api/auth/login` et `/api/auth/register`)

2. **Validation des rôles** :
   - Admin : accès complet
   - Doctor : peut créer consultations, voir patients
   - Nurse : accès limité
   - Patient : voir ses propres données

3. **Protection des données sensibles** :
   - ❌ JAMAIS de données sensibles dans les logs
   - ❌ JAMAIS dans les URLs (ex: pas de `?patientName=...`)
   - ❌ JAMAIS dans les messages d'erreur
   - ✅ Seulement en base de données PostgreSQL

4. **Codes HTTP corrects** :
   - `200` : Succès GET/PUT
   - `201` : Succès POST (création)
   - `400` : Requête invalide
   - `401` : Non authentifié
   - `403` : Non autorisé (mauvais rôle)
   - `404` : Ressource non trouvée

---

#### **4. Docker et Déploiement**

**Vous devez avoir :**
- ✅ `docker-compose.yml` qui démarre TOUS les services
- ✅ Chaque service doit avoir son `Dockerfile`
- ✅ PostgreSQL configuré pour chaque service
- ✅ Les services se connectent correctement

**Test :**
```bash
docker-compose up -d
# Tous les services doivent démarrer sans erreur
# Accéder à http://localhost:8080 (Gateway)
# Accéder à http://localhost:8761 (Eureka)
```

---

#### **5. Documentation Swagger**

**Chaque service doit exposer Swagger :**
- Accès : `http://localhost:8081/swagger-ui.html` (patient-service)
- Tous les endpoints documentés
- Schémas des DTOs visibles

---

### 🧪 Scénarios de Validation du Kit Commun

#### **Scénario 1 : Création d'un patient**
```
1. POST /api/auth/login (Admin)
   → Réponse : { "accessToken": "eyJhbGci...", ... }

2. POST /api/patients
   Headers: { "Authorization": "Bearer eyJhbGci..." }
   Body: { "nationalId": "...", "firstName": "...", ... }
   → Réponse : 201 Created + PatientDTO

3. Vérifier en base : SELECT * FROM patients;
   → Le patient doit être présent
```

#### **Scénario 2 : Consultation médicale**
```
1. POST /api/auth/login (Doctor)
   → Obtenir le token JWT

2. POST /api/appointments
   Headers: { "Authorization": "Bearer ..." }
   Body: { 
     "patientId": 1,
     "doctorId": 1,
     "appointmentDateTime": "2024-01-15T10:00:00",
     "diagnostic": "..."
   }
   → Réponse : 201 Created

3. GET /api/appointments?patientId=1
   → Doit retourner la consultation créée
```

#### **Scénario 3 : Accès sécurisé**
```
1. Appel sans token :
   GET /api/patients
   → Réponse : 401 Unauthorized

2. Appel avec token invalide :
   GET /api/patients
   Headers: { "Authorization": "Bearer fake-token" }
   → Réponse : 401 Unauthorized

3. Appel avec bon token mais mauvais rôle :
   (Patient essaie d'accéder à /api/staff)
   → Réponse : 403 Forbidden

4. Appel avec bon token et bon rôle :
   → Réponse : 200 OK + données
```

---

## 🚀 PHASE 2 : SUJET 1 - BLOCKCHAIN

### ⚠️ RÈGLE ABSOLUE

**VOUS NE MODIFIEZ PAS LE KIT COMMUN !**

Le Kit Commun reste tel quel. Vous **AJOUTEZ** une couche blockchain par-dessus.

---

### 🎯 Objectif du Sujet 1

Ajouter une **couche de traçabilité immuable** sur les actions critiques :
- Quand un patient est créé → Enregistrer dans blockchain
- Quand une consultation est créée → Enregistrer dans blockchain
- Quand une consultation est modifiée → Enregistrer dans blockchain
- Quand un patient est consulté → Enregistrer dans blockchain (audit des accès)

---

### 📦 Ce que vous devez AJOUTER (sans modifier l'existant)

#### **1. Réseau Blockchain Privé**

**Option 1 : Ganache (Plus simple pour prototype)**
```
- 1 node Ethereum privé
- Gestion d'identités simple
- Parfait pour un prototype
```

**Option 2 : Hyperledger Fabric (Plus professionnel)**
```
- 1 orderer + 2 peers
- Gestion d'identités plus complexe
- Plus adapté production
```

**Recommandation : Commencer par Ganache pour la simplicité**

---

#### **2. Smart Contract d'Audit**

**Le smart contract doit enregistrer :**
```solidity
struct AuditLog {
    string userId;        // UUID, jamais nom/prénom
    string resourceId;    // patientId ou consultationId
    string action;        // "CREATE", "UPDATE", "READ", "DELETE"
    uint256 timestamp;    // Horodatage
    string dataHash;      // Hash des données (optionnel)
}
```

**⚠️ RÈGLE CRITIQUE - Données sensibles :**
- ❌ **JAMAIS** : nom, prénom, diagnostic, prescription, adresse, email
- ✅ **UNIQUEMENT** : IDs techniques, type d'action, timestamp, hash

**Exemple de transaction VALIDE :**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "resourceId": "123",
  "action": "CREATE",
  "resourceType": "PATIENT",
  "timestamp": 1705312800
}
```

**Exemple de transaction INVALIDE (à rejeter) :**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "patientName": "Jean Dupont",  // ❌ INTERDIT
  "diagnostic": "Grippe",         // ❌ INTERDIT
  "action": "CREATE"
}
```

---

#### **3. Nouveau Microservice : Audit Service**

**Responsabilités :**
- Interroger la blockchain pour lire les transactions
- Exposer une API REST pour consulter l'historique

**Endpoints à créer :**
```
GET /api/audit/patient/{patientId}
→ Retourne toutes les actions sur ce patient

GET /api/audit/user/{userId}
→ Retourne toutes les actions d'un utilisateur

GET /api/audit/date?start=2024-01-01&end=2024-01-31
→ Retourne les actions dans une période

GET /api/audit/resource/{resourceId}?type=PATIENT|CONSULTATION
→ Retourne toutes les actions sur une ressource
```

**Données retournées :**
```json
{
  "userId": "uuid-technique",
  "resourceId": "123",
  "action": "CREATE",
  "resourceType": "PATIENT",
  "timestamp": "2024-01-15T10:00:00Z",
  "blockHash": "0xabc123...",
  "transactionHash": "0xdef456..."
}
```

---

#### **4. Nouveau Microservice : Ledger Service (Blockchain Adapter)**

**Rôle :** Encapsuler la communication avec la blockchain

**Endpoints :**
```
POST /api/ledger/log
Body: {
  "userId": "uuid",
  "resourceId": "123",
  "action": "CREATE",
  "resourceType": "PATIENT"
}
→ Écrit dans la blockchain
→ Valide qu'il n'y a pas de données sensibles

GET /api/ledger/query?userId=...&resourceId=...&startDate=...
→ Recherche dans la blockchain (si nécessaire)
```

**Validation obligatoire :**
```java
public void validateAuditLog(AuditLogRequest request) {
    // Refuser si contient des champs sensibles
    if (request.containsSensitiveData()) {
        throw new IllegalArgumentException("Sensitive data not allowed in blockchain");
    }
    // Vérifier que seuls les champs autorisés sont présents
}
```

---

#### **5. Adapter les Microservices Existants**

**Dans Patient Service :**
```java
// Après avoir créé un patient
public PatientDTO createPatient(PatientCreateRequest request) {
    Patient patient = patientRepository.save(...);
    
    // ✅ NOUVEAU : Envoyer à la blockchain
    ledgerService.logAction(
        AuditLogRequest.builder()
            .userId(getCurrentUserId())
            .resourceId(patient.getId().toString())
            .action("CREATE")
            .resourceType("PATIENT")
            .build()
    );
    
    return patientMapper.toDTO(patient);
}
```

**Dans Appointment Service :**
```java
// Après avoir créé une consultation
public AppointmentDTO createAppointment(...) {
    Appointment appointment = appointmentRepository.save(...);
    
    // ✅ NOUVEAU : Envoyer à la blockchain
    ledgerService.logAction(
        AuditLogRequest.builder()
            .userId(getCurrentUserId())
            .resourceId(appointment.getId().toString())
            .action("CREATE")
            .resourceType("CONSULTATION")
            .build()
    );
    
    return appointmentMapper.toDTO(appointment);
}
```

**⚠️ IMPORTANT :**
- Vous n'avez pas besoin de modifier les endpoints existants
- Vous ajoutez juste un appel à `ledgerService` après chaque action CRUD
- Les réponses API restent identiques

---

#### **6. Interface Audit (Frontend Simple)**

**Option 1 : Page web simple**
- HTML + JavaScript
- Consomme l'API `/api/audit/*`
- Affiche un tableau avec les logs
- Filtres : par patient, par utilisateur, par date

**Option 2 : Endpoint Swagger**
- Documenter l'API Audit dans Swagger
- Utiliser l'interface Swagger pour tester

**Fonctionnalités minimales :**
- Liste des transactions
- Filtrage par patient ID
- Filtrage par utilisateur ID
- Filtrage par date
- Affichage : userId, resourceId, action, timestamp, blockHash

---

### 🔄 Scénarios du Sujet 1

#### **Scénario 1 : Création d'un patient avec traçabilité**
```
1. POST /api/patients (Médecin authentifié)
   → Patient créé en PostgreSQL
   → Transaction envoyée à la blockchain
   → Block créé avec : userId, patientId, action="CREATE", timestamp

2. GET /api/audit/patient/123
   → Retourne la transaction de création
   → Contient : blockHash, transactionHash, timestamp
```

#### **Scénario 2 : Consultation d'un dossier (audit des accès)**
```
1. GET /api/patients/123 (Utilisateur authentifié)
   → Données retournées normalement
   → NOUVEAU : Action "READ" enregistrée dans blockchain
   → Transaction créée avec : userId, patientId, action="READ", timestamp

2. GET /api/audit/patient/123
   → Retourne toutes les actions :
     - CREATE (création du patient)
     - READ (consultation 1)
     - READ (consultation 2)
     - UPDATE (modification)
```

#### **Scénario 3 : Mise à jour après consultation**
```
1. PUT /api/appointments/456
   Body: { "diagnostic": "..." }
   → Consultation mise à jour en PostgreSQL
   → Transaction blockchain avec : userId, appointmentId, action="UPDATE"

2. GET /api/audit/resource/456?type=CONSULTATION
   → Retourne l'historique complet de cette consultation
```

#### **Scénario 4 : Interface Audit**
```
1. Admin ouvre l'interface audit
2. Filtre par patient ID = 123
3. Voit toutes les transactions immuables :
   - Qui a créé le patient
   - Qui a consulté le dossier (et quand)
   - Qui a modifié des consultations
   - Toutes horodatées et vérifiables via les hash
```

---

## 📊 Architecture Finale (Kit Commun + Sujet 1)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTS                               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 8080)                     │
│         + AuthenticationFilter (JWT)                     │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │Patient Service│  │Appointment   │
│              │  │              │  │Service       │
│              │  │  + Appel     │  │  + Appel     │
│              │  │  Ledger      │  │  Ledger      │
└──────────────┘  └──────────────┘  └──────────────┘
                          │                 │
                          └────────┬────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Ledger Service         │
                    │   (Blockchain Adapter)   │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Blockchain Network     │
                    │   (Ganache ou Fabric)    │
                    │   + Smart Contract       │
                    └──────────────────────────┘
                                   │
                                   │ (lecture)
                                   ▼
                    ┌──────────────────────────┐
                    │   Audit Service          │
                    │   (Consultation logs)    │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Interface Audit        │
                    │   (Frontend simple)      │
                    └──────────────────────────┘
```

---

## ✅ Checklist de Validation

### Kit Commun (Lot 1)
- [ ] Tous les endpoints CRUD fonctionnent
- [ ] JWT authentification opérationnelle (pas de placeholders)
- [ ] Validation des rôles fonctionne
- [ ] Docker-compose démarre sans erreur
- [ ] Swagger accessible pour chaque service
- [ ] Scénario 1 : Création patient fonctionne
- [ ] Scénario 2 : Consultation médicale fonctionne
- [ ] Scénario 3 : Accès sécurisé fonctionne
- [ ] Aucune donnée sensible dans les logs
- [ ] Codes HTTP corrects

### Sujet 1 Blockchain (Lot 2)
- [ ] Réseau blockchain déployé (Ganache ou Fabric)
- [ ] Smart contract déployé et fonctionnel
- [ ] Ledger Service créé et opérationnel
- [ ] Audit Service créé avec endpoints REST
- [ ] Patient Service envoie transactions blockchain
- [ ] Appointment Service envoie transactions blockchain
- [ ] Validation : pas de données sensibles dans blockchain
- [ ] Interface Audit fonctionnelle
- [ ] Tous les scénarios du Sujet 1 fonctionnent

---

## 🎓 Points Clés à Retenir

### Pour le Kit Commun
1. **C'est une BASE** : Vous complétez, vous ne redémarrez pas
2. **JWT est CRITIQUE** : Sans ça, rien ne fonctionne
3. **Sécurité des données** : Jamais de données sensibles en clair hors de PostgreSQL
4. **Respecter les API** : Les endpoints et formats sont fixes

### Pour le Sujet 1
1. **Vous AJOUTEZ, vous ne MODIFIEZ PAS** le Kit Commun
2. **Blockchain = Traçabilité uniquement**, pas stockage de données sensibles
3. **IDs techniques uniquement** dans la blockchain
4. **Deux nouveaux services** : Ledger Service + Audit Service
5. **Adapter les services existants** en ajoutant des appels au Ledger Service

---

## 🚦 Ordre de Travail Recommandé

### Semaine 3 : Kit Commun
1. **Jour 1-2** : Implémenter JWT complet (génération + validation)
2. **Jour 3** : Finaliser tous les endpoints CRUD
3. **Jour 4** : Tester les scénarios fonctionnels
4. **Jour 5** : Documentation Swagger + Docker

### Semaines 4-5 : Sujet 1
1. **Semaine 4** : 
   - Déployer réseau blockchain (Ganache)
   - Créer et déployer smart contract
   - Créer Ledger Service
   - Adapter Patient Service
2. **Semaine 5** :
   - Adapter Appointment Service
   - Créer Audit Service
   - Créer Interface Audit
   - Tests finaux et validation

---

## 💡 Conseils Pratiques

1. **Commencez simple** : Utilisez Ganache pour la blockchain (plus facile que Fabric)
2. **Testez au fur et à mesure** : Ne codez pas tout avant de tester
3. **Documentez** : Commentez votre code, surtout les choix techniques
4. **Respectez les conventions** : Noms d'endpoints, formats de réponse
5. **Sécurité d'abord** : Validez toujours qu'il n'y a pas de données sensibles

---

## 📚 Ressources Utiles

### Pour JWT
- Bibliothèque : `io.jsonwebtoken:jjwt-api` et `io.jsonwebtoken:jjwt-impl`
- Documentation : https://github.com/jwtk/jjwt

### Pour Blockchain
- Ganache : https://trufflesuite.com/ganache/
- Hyperledger Fabric : https://www.hyperledger.org/use/fabric
- Web3j (Java) : https://www.web3j.io/

### Pour Smart Contracts
- Solidity (si Ethereum/Ganache) : https://soliditylang.org/
- Chaincode (si Hyperledger Fabric) : https://hyperledger-fabric.readthedocs.io/

---

**Bonne chance avec votre projet ! 🚀**

