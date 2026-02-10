package com.hospital.audit.service;

import com.hospital.audit.contract.MedicalAudit;
import com.hospital.audit.dto.AuditDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthLog;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final MedicalAudit medicalAudit;
    private final Web3j web3j;
    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    @Value("${web3j.contract-address}")
    private String contractAddress;

    public AuditService(MedicalAudit medicalAudit, Web3j web3j) {
        this.medicalAudit = medicalAudit;
        this.web3j = web3j;
    }

    public String logAction(AuditDto auditDto) throws Exception {
        // Atelier 1.2.B : Validation du payload (Refuser tout champ sensible)
        validateNoSensitiveData(auditDto);

        logger.info("Envoi de la transaction Audit vers la Blockchain... [User: {}, Action: {}]", 
            auditDto.getUserId(), auditDto.getAction());
        String detailsToSend = auditDto.getDetails() != null ? auditDto.getDetails() : "N/A";
        if (auditDto.getDataHash() != null && !auditDto.getDataHash().isEmpty()) {
            detailsToSend = "HASH:" + auditDto.getDataHash() + "|" + detailsToSend;
        }

        TransactionReceipt receipt = medicalAudit.logAction(
            auditDto.getUserId(),
            auditDto.getAction(),
            auditDto.getResourceId(),
            detailsToSend
        ).send();

        logger.info("Transaction minée ! Hash: {}", receipt.getTransactionHash());
        return receipt.getTransactionHash();
    }

    public List<AuditDto> getAllLogs() {
        logger.info("Récupération de l'historique complet (Mode Query)... Adresse contrat: {}", contractAddress);
        List<AuditDto> results = new ArrayList<>();

        try {
            // Création d'un filtre pour lire tous les logs depuis le début
            EthFilter filter = new EthFilter(
                DefaultBlockParameterName.EARLIEST,
                DefaultBlockParameterName.LATEST,
                contractAddress
            );
            
            // DEBUG: On enlève le filtre par topic pour voir TOUT ce qui se passe sur le contrat
            // filter.addSingleTopic(EventEncoder.encode(MedicalAudit.ACTIONLOGGED_EVENT));

            EthLog ethLog = web3j.ethGetLogs(filter).send();
            List<EthLog.LogResult> logs = ethLog.getLogs();

            logger.info("Nombre de logs bruts trouvés sur la blockchain : {}", logs.size());

            for (EthLog.LogResult logResult : logs) {
                Log log = (Log) logResult.get();
                AuditDto dto = new AuditDto();
                dto.setTransactionHash(log.getTransactionHash());
                dto.setDetails("Hash-Log"); // Valeur par défaut

                try {
                    // Tentative 1 : Décodage standard (tout dans Data)
                    List<Type> nonIndexed = FunctionReturnDecoder.decode(
                            log.getData(), 
                            MedicalAudit.ACTIONLOGGED_EVENT.getNonIndexedParameters());

                    if (nonIndexed.size() >= 4) {
                        dto.setUserId((String) nonIndexed.get(0).getValue());
                        dto.setAction((String) nonIndexed.get(1).getValue());
                        dto.setResourceId((String) nonIndexed.get(2).getValue());
                        BigInteger ts = (BigInteger) nonIndexed.get(3).getValue();
                        dto.setTimestamp(ts.longValue() * 1000);
                        // Tentative de récupérer details si disponible (index 4 ?)
                        if (nonIndexed.size() >= 5) {
                             dto.setDetails((String) nonIndexed.get(4).getValue());
                        }
                    } else {
                        throw new RuntimeException("Format inattendu, passage au mode indexé");
                    }
                } catch (Exception e1) {
                    // ====== TENTATIVE 2 : NOUVEAU CONTRAT (userId, resourceId INDEXÉS) ======
                    // Data: action (string), timestamp (uint256), dataHash (string)
                    try {
                        List<TypeReference<Type>> newContractParams = new ArrayList<>();
                        newContractParams.add((TypeReference) new TypeReference<Utf8String>() {}); // Action
                        newContractParams.add((TypeReference) new TypeReference<Uint256>() {});    // Timestamp
                        newContractParams.add((TypeReference) new TypeReference<Utf8String>() {}); // DataHash

                        List<Type> data = FunctionReturnDecoder.decode(log.getData(), newContractParams);
                        
                        if (data.size() >= 3) {
                             dto.setAction((String) data.get(0).getValue());
                             dto.setTimestamp(((BigInteger) data.get(1).getValue()).longValue() * 1000);
                             dto.setDataHash((String) data.get(2).getValue());
                             
                             List<String> topics = log.getTopics();
                             dto.setUserId(topics.size() > 1 ? topics.get(1) : "UnknownUser");
                             dto.setResourceId(topics.size() > 2 ? topics.get(2) : "UnknownResource");
                             
                             dto.setDetails("HashLog: " + dto.getDataHash());
                        } else {
                            throw new RuntimeException("Format V2 invalide");
                        }
                    } catch (Exception e2) {
                        // ====== TENTATIVE 3 : ANCIEN CONTRAT (userId, action INDEXÉS) ======
                        // Data: resourceId/details (string), timestamp (uint256)
                        try {
                             List<TypeReference<Type>> oldParams = new ArrayList<>();
                             oldParams.add((TypeReference) new TypeReference<Utf8String>() {}); 
                             oldParams.add((TypeReference) new TypeReference<Uint256>() {});    

                             List<Type> data = FunctionReturnDecoder.decode(log.getData(), oldParams);
                             
                             List<String> topics = log.getTopics();
                             dto.setUserId(topics.size() > 1 ? topics.get(1) : "Unknown");
                             dto.setAction(topics.size() > 2 ? topics.get(2) : "Unknown");
                             
                             if (data.size() >= 2) {
                                 dto.setResourceId((String) data.get(0).getValue());
                                 dto.setTimestamp(((BigInteger) data.get(1).getValue()).longValue() * 1000);
                             }
                        } catch (Exception ex) {
                             logger.error("Echec décodage log {}: {}", log.getTransactionHash(), ex.getMessage());
                             dto.setResourceId("Decode Error");
                        }
                    }
                }

                // Parsing du hash depuis details ou resourceId (au cas où)
                String detailsToParse = dto.getDetails();
                if (detailsToParse != null && detailsToParse.startsWith("HASH:")) {
                    int pipeIndex = detailsToParse.indexOf("|");
                    if (pipeIndex > 0) {
                        dto.setDataHash(detailsToParse.substring(5, pipeIndex));
                        dto.setDetails(detailsToParse.substring(pipeIndex + 1));
                    }
                }
                
                // Fallback: Check ResourceId too, sometimes data ends up there due to ABI mismatch
                String resourceToParse = dto.getResourceId();
                if (resourceToParse != null && resourceToParse.startsWith("HASH:")) {
                     int pipeIndex = resourceToParse.indexOf("|");
                    if (pipeIndex > 0) {
                        String extractedHash = resourceToParse.substring(5, pipeIndex);
                        dto.setDataHash(extractedHash);
                        dto.setResourceId(resourceToParse.substring(pipeIndex + 1));
                    }
                }

                
                results.add(dto);
            }
        } catch (Exception e) {
            logger.error("Erreur lecture logs blockchain : ", e);
        }
        
        return results;
    }

    public List<AuditDto> getLogsByPatient(String patientId) {
        return getAllLogs().stream()
            .filter(log -> patientId.equals(log.getResourceId()))
            .collect(Collectors.toList());
    }

    public List<AuditDto> getLogsByUser(String userId) {
        return getAllLogs().stream()
            .filter(log -> userId.equals(log.getUserId()))
            .collect(Collectors.toList());
    }

    /**
     * Valide qu'aucune donnée sensible n'est envoyée à la blockchain.
     * Règle de conformité Sujet 1 : Uniquement IDs techniques et Hashes.
     */
    private void validateNoSensitiveData(AuditDto dto) {
        // Liste de vérifications simples pour détecter des données sensibles potentielles
        checkField("UserId", dto.getUserId());
        checkField("Action", dto.getAction());
        checkField("ResourceId", dto.getResourceId());
        checkField("Details", dto.getDetails());
    }

    private void checkField(String fieldName, String value) {
        if (value == null) return;
        
        // 1. Détection d'emails (Exigence RGPD)
        if (value.contains("@")) {
            throw new IllegalArgumentException("SENSITIVE DATA REJECTED: Field " + fieldName + " contains an email address!");
        }

        // 2. Détection de noms complets probables (espaces multiples ou majuscules suivies de minuscules)
        // Les IDs techniques (UUID, Long) n'ont généralement pas d'espaces.
        if (value.trim().contains(" ")) {
            // On autorise les "Action" avec espaces si c'est court, mais pas les détails trop longs
            if (fieldName.equals("UserId") || fieldName.equals("ResourceId")) {
                 throw new IllegalArgumentException("SENSITIVE DATA REJECTED: Field " + fieldName + " must be a technical ID (no spaces sanctioned)!");
            }
        }
        
        // 3. Détection de pattern de diagnostic (mots clés médicaux)
        String[] sensitiveKeywords = {"cancer", "fracture", "diabete", "positif", "negatif", "tension"};
        for (String keyword : sensitiveKeywords) {
            if (value.toLowerCase().contains(keyword)) {
                throw new IllegalArgumentException("SENSITIVE DATA REJECTED: Field " + fieldName + " contains medical information!");
            }
        }
    }
}
