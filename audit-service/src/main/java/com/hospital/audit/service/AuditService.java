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
        logger.info("Envoi de la transaction Audit vers la Blockchain... [User: {}, Action: {}]", 
            auditDto.getUserId(), auditDto.getAction());

        TransactionReceipt receipt = medicalAudit.logAction(
            auditDto.getUserId(),
            auditDto.getAction(),
            auditDto.getResourceId(),
            auditDto.getDetails() != null ? auditDto.getDetails() : "N/A"
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
                    } else {
                        throw new RuntimeException("Format inattendu, passage au mode indexé");
                    }
                } catch (Exception e) {
                    // Tentative 2 : Décodage hybride pour événements indexés
                    // Si userId et action sont indexés, ils sont dans les topics (hashés)
                    // Data ne contient alors que : details (string) et timestamp (uint256)
                    try {
                        List<TypeReference<Type>> fallbackParams = new ArrayList<>();
                        // Cast explicite (Raw Type) pour satisfaire le compilateur Java/Web3j
                        fallbackParams.add((TypeReference) new TypeReference<Utf8String>() {}); 
                        fallbackParams.add((TypeReference) new TypeReference<Uint256>() {});    

                        List<Type> mixedData = FunctionReturnDecoder.decode(log.getData(), fallbackParams);
                        
                        // Récupération depuis les topics (si disponibles)
                        List<String> topics = log.getTopics();
                        // Topic 0 est la signature, Topic 1 = UserId (Hash), Topic 2 = Action (Hash)
                        String rawUserId = (topics.size() > 1) ? topics.get(1) : "Unknown";
                        String rawAction = (topics.size() > 2) ? topics.get(2) : "Unknown";

                        dto.setUserId(rawUserId.substring(0, Math.min(rawUserId.length(), 10)) + "..."); // On montre le début du hash
                        dto.setAction(rawAction.substring(0, Math.min(rawAction.length(), 10)) + "...");
                        
                        if (mixedData.size() >= 2) {
                            dto.setResourceId((String) mixedData.get(0).getValue());
                            dto.setTimestamp(((BigInteger) mixedData.get(1).getValue()).longValue() * 1000);
                        } else {
                            dto.setResourceId("N/A");
                            dto.setTimestamp(System.currentTimeMillis());
                        }
                    } catch (Exception ex) {
                        logger.error("Echec décodage log {}: {}", log.getTransactionHash(), ex.getMessage());
                        dto.setUserId("Error");
                        dto.setAction("Error");
                        dto.setResourceId("Error Decoding");
                        dto.setTimestamp(System.currentTimeMillis());
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
}
