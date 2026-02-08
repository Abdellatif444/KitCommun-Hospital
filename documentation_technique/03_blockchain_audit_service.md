# 🔗 Configuration du Service Audit Blockchain

**Date**: 2026-02-08  
**Objectif**: Intégrer un service d'audit blockchain pour tracer les actions critiques du système hospitalier de manière immuable.

---

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Infrastructure Blockchain](#infrastructure-blockchain)
4. [Service Audit (Java/Spring Boot)](#service-audit-javaspring-boot)
5. [Smart Contract MedicalAudit](#smart-contract-medicalaudit)
6. [Configuration et déploiement](#configuration-et-déploiement)
7. [Tests et vérification](#tests-et-vérification)
8. [Concepts blockchain expliqués](#concepts-blockchain-expliqués)
9. [Prochaines étapes](#prochaines-étapes)

---

## 🎯 Vue d'ensemble

### Problématique
Dans un système hospitalier, certaines actions critiques (ajout patient, modification dossier médical, accès aux données sensibles) doivent être **traçables de manière immuable** et **vérifiables** pour respecter les normes RGPD et médicales.

### Solution
Utilisation d'une **blockchain privée (Ganache)** avec un **smart contract Solidity** pour enregistrer les logs d'audit de manière **décentralisée et immuable**.

### Stack technique
- **Blockchain**: Ganache CLI (Ethereum local)
- **Smart Contract**: Solidity 0.8.0 - `MedicalAudit.sol`
- **Déploiement**: Truffle 5.11.5
- **Backend**: Java 17 + Spring Boot 3.2.0 + Web3j 4.10.3
- **Conteneurisation**: Docker Compose

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HOSPITAL MICROSERVICES                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐          │
│  │  Patient   │  │   Staff    │  │ Medical      │          │
│  │  Service   │  │  Service   │  │ Record Svc   │          │
│  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘          │
│        │                │                │                   │
│        └────────────────┼────────────────┘                   │
│                         │ HTTP Calls                         │
│                         ▼                                    │
│              ┌──────────────────────┐                        │
│              │   AUDIT SERVICE      │                        │
│              │  (Spring Boot 3.2)   │                        │
│              │  Port: 8083          │                        │
│              └──────────┬───────────┘                        │
│                         │ Web3j                              │
│                         ▼                                    │
│              ┌──────────────────────┐                        │
│              │  GANACHE BLOCKCHAIN  │                        │
│              │  (Ethereum Local)    │                        │
│              │  Port: 8545          │                        │
│              └──────────┬───────────┘                        │
│                         │                                    │
│                         ▼                                    │
│              ┌──────────────────────┐                        │
│              │ MedicalAudit.sol     │                        │
│              │ Smart Contract       │                        │
│              │ 0x9919509b9fb8...    │                        │
│              └──────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Infrastructure Blockchain

### 📁 Fichier: `blockchain-network/docker-compose.yml`

**Rôle**: Orchestration de Ganache et du déployeur Truffle.

```yaml
version: '3.8'

services:
  ganache:
    image: trufflesuite/ganache-cli:latest
    container_name: hospital-blockchain
    ports:
      - "8545:8545"
    command: >
      --mnemonic "doctor hospital wallet secure block chain audit kit commun 2024"
      --networkId 5777
      --hostname 0.0.0.0
      --db /data
    volumes:
      - ./ganache_data:/data
    networks:
      - hospital-network
    deploy:
      resources:
        limits:
          memory: 512M

  truffle-deployer:
    build: .
    container_name: hospital-truffle-deployer
    volumes:
      - ./:/app
    networks:
      - hospital-network
    depends_on:
      - ganache
    command: sh -c "rm -rf build && sleep 5 && truffle migrate --reset --network hospital"

networks:
  hospital-network:
    external: true
```

**Points clés:**
- ✅ **Mnemonic fixe**: Garantit les mêmes comptes à chaque redémarrage
- ✅ **Network ID 5777**: Compatible avec Truffle
- ✅ **Persistence**: `/data` sauvegardé dans `ganache_data/`
- ✅ **Auto-déploiement**: Truffle compile et déploie automatiquement

---

### 📁 Fichier: `blockchain-network/Dockerfile`

```dockerfile
FROM node:18-buster

# Install Truffle
RUN npm install -g truffle

# Set working directory
WORKDIR /app

# The command to run by default
CMD ["truffle", "migrate", "--reset", "--network", "hospital"]
```

---

### 📁 Smart Contract: `blockchain-network/contracts/MedicalAudit.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalAudit {
    struct AuditLog {
        string userId;       // UUID de l'utilisateur (Keycloak)
        string action;       // Ex: "CREATE_PATIENT", "UPDATE_RECORD"
        string resourceId;   // UUID de la ressource concernée
        uint256 timestamp;   // Timestamp UNIX
        string dataHash;     // Hash SHA-256 des données sensibles
    }

    AuditLog[] public logs;

    event AuditLogCreated(
        indexed string userId,
        indexed string resourceId,
        string action,
        uint256 timestamp
    );

    function logAction(
        string memory _userId,
        string memory _action,
        string memory _resourceId,
        string memory _dataHash
    ) public {
        logs.push(AuditLog({
            userId: _userId,
            action: _action,
            resourceId: _resourceId,
            timestamp: block.timestamp,
            dataHash: _dataHash
        }));

        emit AuditLogCreated(_userId, _resourceId, _action, block.timestamp);
    }

    function getLogCount() public view returns (uint256) {
        return logs.length;
    }

    function getLog(uint256 _index) public view returns (
        string memory userId,
        string memory action,
        string memory resourceId,
        uint256 timestamp,
        string memory dataHash
    ) {
        require(_index < logs.length, "Index out of bounds");
        AuditLog memory log = logs[_index];
        return (log.userId, log.action, log.resourceId, log.timestamp, log.dataHash);
    }
}
```

**Conformité RGPD:**
- ❌ Pas de données médicales en clair
- ✅ Uniquement des identifiants techniques (UUIDs)
- ✅ Hash des données sensibles (SHA-256)

---

## ☕ Service Audit (Java/Spring Boot)

### 📁 Fichier: `audit-service/pom.xml`

**Dépendances clés:**

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Eureka Client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>

    <!-- Web3j Core (Interaction blockchain) -->
    <dependency>
        <groupId>org.web3j</groupId>
        <artifactId>core</artifactId>
        <version>4.10.3</version>
    </dependency>
</dependencies>
```

**Plugin Web3j Maven (pour génération du wrapper):**

```xml
<plugin>
    <groupId>org.web3j</groupId>
    <artifactId>web3j-maven-plugin</artifactId>
    <version>4.10.3</version>
    <configuration>
        <packageName>com.hospital.audit.contract</packageName>
        <sourceDestination>src/main/java</sourceDestination>
        <nativeJavaType>true</nativeJavaType>
        <outputFormat>java</outputFormat>
        <soliditySourceFiles>
            <directory>src/main/resources</directory>
            <includes>
                <include>MedicalAudit.json</include>
            </includes>
        </soliditySourceFiles>
    </configuration>
</plugin>
```

---

### 📁 Fichier: `audit-service/src/main/resources/application.yml`

```yaml
server:
  port: 8083

spring:
  application:
    name: audit-service
  cloud:
    discovery:
      enabled: false # Temporairement désactivé pour tests isolés

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true

web3j:
  client-address: http://host.docker.internal:8545
  contract-address: 0x9919509B9FB8AF43F0576854a39d8850eCC56c0E
  wallet-private-key: 0xf5058b2888f328cf1472cc8a864c6f5aba8f0cf5a0e2c1e56a6600758428807c
  # ⚠️ ATTENTION: Clé de test uniquement, JAMAIS en production !
```

---

### 📁 Fichier: `audit-service/.../config/ApplicationConfig.java`

**Bean Spring pour Web3j et le contrat:**

```java
package com.hospital.audit.config;

import com.hospital.audit.contract.MedicalAudit;
import java.math.BigInteger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.StaticGasProvider;

@Configuration
public class ApplicationConfig {

    @Value("${web3j.client-address}")
    private String clientAddress;

    @Value("${web3j.contract-address}")
    private String contractAddress;

    @Value("${web3j.wallet-private-key}")
    private String privateKey;

    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(clientAddress));
    }

    @Bean
    public MedicalAudit medicalAudit(Web3j web3j) {
        Credentials credentials = Credentials.create(privateKey);
        
        BigInteger gasPrice = BigInteger.valueOf(20_000_000_000L); // 20 Gwei
        BigInteger gasLimit = BigInteger.valueOf(6_721_975L);

        return MedicalAudit.load(
            contractAddress, 
            web3j, 
            credentials, 
            new StaticGasProvider(gasPrice, gasLimit)
        );
    }
}
```

**Rôle:**
- Initialise la connexion Web3j vers Ganache
- Charge le smart contract avec les credentials
- Fournit le bean `MedicalAudit` injectable partout

---

### 📁 Fichier: `audit-service/.../contract/MedicalAudit.java`

**Wrapper Java généré manuellement** (car le plugin Maven avait des soucis avec le format JSON de Truffle).

**Extrait:**

```java
public class MedicalAudit extends Contract {
    public static final String FUNC_LOGACTION = "logAction";
    public static final String FUNC_GETLOGS = "getLogs";
    public static final String FUNC_GETLOGCOUNT = "getLogCount";

    public RemoteFunctionCall<TransactionReceipt> logAction(
        String action, 
        String userId, 
        String details
    ) {
        final Function function = new Function(
            FUNC_LOGACTION,
            Arrays.asList(
                new Utf8String(action), 
                new Utf8String(userId), 
                new Utf8String(details)
            ),
            Collections.emptyList()
        );
        return executeRemoteCallTransaction(function);
    }

    // Autres méthodes: getLogCount(), getLog(index), etc.
}
```

---

## 🚀 Configuration et déploiement

### Étape 1: Créer le réseau Docker (si pas déjà fait)

```powershell
docker network create hospital-network
```

### Étape 2: Lancer Ganache + Truffle

```powershell
cd blockchain-network
docker-compose up -d
```

**Ce qui se passe:**
1. Ganache démarre sur `localhost:8545`
2. Truffle attend 5 secondes
3. Truffle compile `MedicalAudit.sol`
4. Truffle déploie le contrat
5. Le contrat est accessible à l'adresse `0x9919509b...`

### Étape 3: Vérifier les logs

```powershell
# Voir les comptes Ganache créés
docker logs hospital-blockchain

# Voir le déploiement Truffle
docker logs hospital-truffle-deployer
```

**Comptes Ganache (avec votre mnemonic):**

```
Available Accounts
==================
(0) 0x02E5AfFC666DaEA37166078B800fE90eD6a74112 (100 ETH)
(1) 0xD64B2cC5BE4A55342Ea20E3EB033f533F2cA5790 (100 ETH)
...

Private Keys
==================
(0) 0xf5058b2888f328cf1472cc8a864c6f5aba8f0cf5a0e2c1e56a6600758428807c
(1) 0x2c748244a7188fa20dd9abc7555bbdafddefdb9cd2773cc129228404386b82e3
...

Contract created: 0x9919509b9fb8af43f0576854a39d8850ecc56c0e
```

### Étape 4: Builder le service audit

```powershell
cd c:\Users\alibo\Desktop\ProjetKitCommun
mvn clean install -pl audit-service -am -DskipTests
```

Ou avec Docker:

```powershell
docker run --rm \
  -v ${PWD}:/usr/src/app \
  -w /usr/src/app \
  maven:3.9-eclipse-temurin-17 \
  mvn clean install -pl audit-service -am -DskipTests
```

### Étape 5: Lancer le service

```powershell
cd audit-service
mvn spring-boot:run
```

---

## 🧪 Tests et vérification

### Test 1: Vérifier la connexion Web3j

Créer un `@RestController` pour tester:

```java
@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private MedicalAudit medicalAudit;

    @GetMapping("/count")
    public ResponseEntity<Long> getLogCount() throws Exception {
        BigInteger count = medicalAudit.getLogCount().send();
        return ResponseEntity.ok(count.longValue());
    }

    @PostMapping("/log")
    public ResponseEntity<String> logAction(
        @RequestParam String userId,
        @RequestParam String action,
        @RequestParam String resourceId,
        @RequestParam String dataHash
    ) throws Exception {
        TransactionReceipt receipt = medicalAudit
            .logAction(userId, action, resourceId, dataHash)
            .send();
        return ResponseEntity.ok("Transaction hash: " + receipt.getTransactionHash());
    }
}
```

**Test avec curl:**

```bash
# Obtenir le nombre de logs
curl http://localhost:8083/api/audit/count

# Créer un nouveau log
curl -X POST "http://localhost:8083/api/audit/log?userId=USER123&action=CREATE_PATIENT&resourceId=PAT456&dataHash=abc123def456"
```

---

## 📚 Concepts blockchain expliqués

### Pourquoi la clé privée ?

Sur Ethereum, il existe **2 types d'opérations**:

1. **Lecture (gratuite)**: `getLogCount()`, `getLog(index)`
   - Pas de modification de la blockchain
   - Pas de frais
   - Pas besoin de signature

2. **Écriture (payante)**: `logAction(...)`
   - Modifie l'état de la blockchain
   - Coûte du "gas" (frais de transaction)
   - Nécessite une signature avec la clé privée

**La clé privée = Identité + Porte-monnaie sur la blockchain**

### Pourquoi Ganache ?

- ✅ Blockchain locale (pas de connexion externe)
- ✅ Transactions instantanées
- ✅ 10 comptes avec 100 ETH gratuits
- ✅ Idéal pour développement/tests
- ❌ Ne PAS utiliser en production (utiliser Hyperledger Besu, Quorum, ou un réseau privé)

### Gas et Gas Price

- **Gas**: Unité de mesure du coût computationnel d'une opération
- **Gas Price**: Prix par unité de gas (en Wei, 1 ETH = 10^18 Wei)
- **Gas Limit**: Maximum de gas autorisé pour une transaction

**Exemple:**
```
Gas utilisé: 784,955
Gas Price: 20 Gwei (20,000,000,000 Wei)
Coût total: 784,955 × 20,000,000,000 = 0.0156991 ETH
```

Sur Ganache, c'est gratuit (ETH virtuel).

---

## 🔮 Prochaines étapes

### Phase 1: Service complet
- [ ] Créer `AuditController` avec endpoints REST
- [ ] Créer `AuditService` pour la logique métier
- [ ] Implémenter un système de queue (RabbitMQ) pour les logs asynchrones
- [ ] Ajouter des tests unitaires et d'intégration

### Phase 2: Intégration avec les autres services
- [ ] Modifier `patient-service` pour appeler `audit-service` lors de créations/modifications
- [ ] Idem pour `staff-service`, `medical-record-service`, etc.
- [ ] Utiliser Spring Cloud OpenFeign pour les appels inter-services

### Phase 3: Dashboard et visualisation
- [ ] Créer un endpoint pour récupérer l'historique des logs
- [ ] Interface web pour visualiser les audits
- [ ] Export des logs en CSV/JSON

### Phase 4: Production-ready
- [ ] Migrer vers une blockchain privée (Hyperledger Besu, Quorum)
- [ ] Gestion sécurisée des clés privées (Vault, AWS KMS)
- [ ] Nodes multiples pour la haute disponibilité
- [ ] Monitoring avec Prometheus + Grafana

---

## 📂 Fichiers créés/modifiés

### Blockchain
- `blockchain-network/docker-compose.yml` (créé/modifié)
- `blockchain-network/Dockerfile` (vérifié)
- `blockchain-network/contracts/MedicalAudit.sol` (existant)
- `blockchain-network/ganache_data/` (données persistées)

### Audit Service
- `audit-service/pom.xml` (modifié - ajout Web3j)
- `audit-service/src/main/resources/application.yml` (créé)
- `audit-service/src/main/java/com/hospital/audit/config/ApplicationConfig.java` (créé)
- `audit-service/src/main/java/com/hospital/audit/contract/MedicalAudit.java` (créé manuellement)
- `audit-service/src/main/resources/MedicalAudit.json` (copié depuis blockchain-network/build)

---

## 🎓 Ressources utiles

- **Web3j Documentation**: https://docs.web3j.io/
- **Truffle Suite**: https://trufflesuite.com/docs/
- **Solidity by Example**: https://solidity-by-example.org/
- **Ethereum Gas Explained**: https://ethereum.org/en/developers/docs/gas/

---

**Auteur**: Session de configuration avec Antigravity  
**Date de dernière mise à jour**: 2026-02-08  
**Statut**: ✅ Infrastructure prête, service en cours de développement
