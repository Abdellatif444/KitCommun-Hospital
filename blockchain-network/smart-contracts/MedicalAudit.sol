// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MedicalAudit
 * @dev Contrat d'audit pour le Kit Commun Hospitalier (Sujet 1).
 * Ce contrat permet de stocker des preuves d'intégrité (logs) de manière immuable.
 * 
 * RGPD COMPLIANCE:
 * - Ce contrat ne stocke AUCUNE donnée médicale en clair.
 * - Il ne stocke que des identifiants techniques (UUID) et des hashs.
 */
contract MedicalAudit {

    // Structure defines a single audit log entry
    // Conforme à l'Atelier 2 - Besoins Fonctionnels
    struct Log {
        string userId;        // ID de l'utilisateur qui a fait l'action
        string action;        // Type d'action (CREATE, READ, UPDATE, DELETE)
        string resourceId;    // ID de la ressource concernée (PatientID, AppointmentID)
        uint256 timestamp;    // Horodatage de l'action
        string dataHash;      // Hash SHA-256 de l'état des données (Preuve d'intégrité)
    }

    // Liste de tous les logs (Tableau dynamique)
    Log[] public logs;

    // Event émis à chaque nouvelle action.
    // L'indexation (indexed) permet au service Audit de filtrer rapidement sans tout relire.
    event AuditLogCreated(
        string indexed userId, 
        string indexed resourceId, 
        string action, 
        uint256 timestamp
    );

    /**
     * @dev Enregistre une nouvelle action dans la blockchain.
     * @param _userId Identifiant technique de l'utilisateur (ex: UUID keycloak)
     * @param _action Type d'action (ex: "CREATE_PATIENT")
     * @param _resourceId Identifiant technique de la ressource (ex: "12345")
     * @param _dataHash Hash des données sensibles (ex: sha256(json))
     */
    function logAction(
        string memory _userId,
        string memory _action,
        string memory _resourceId,
        string memory _dataHash
    ) public {
        
        // Création du log
        // Note: block.timestamp est l'heure du bloc (infalsifiable)
        Log memory newLog = Log({
            userId: _userId,
            action: _action,
            resourceId: _resourceId,
            timestamp: block.timestamp,
            dataHash: _dataHash
        });

        // Enregistrement dans le stockage permanent de la blockchain
        logs.push(newLog);

        // Émission de l'événement pour les écouteurs externes (Microservice Audit)
        emit AuditLogCreated(_userId, _resourceId, _action, block.timestamp);
    }

    /**
     * @dev Retourne le nombre total de logs.
     */
    function getLogCount() public view returns (uint256) {
        return logs.length;
    }

    /**
     * @dev Récupère un log spécifique par son index.
     */
    function getLog(uint256 _index) public view returns (
        string memory userId,
        string memory action,
        string memory resourceId,
        uint256 timestamp,
        string memory dataHash
    ) {
        require(_index < logs.length, "Index out of bounds");
        Log memory log = logs[_index];
        return (log.userId, log.action, log.resourceId, log.timestamp, log.dataHash);
    }
}
