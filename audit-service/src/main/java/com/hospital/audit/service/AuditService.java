package com.hospital.audit.service;

import com.hospital.audit.contract.MedicalAudit;
import com.hospital.audit.dto.AuditDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final MedicalAudit medicalAudit;
    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    public AuditService(MedicalAudit medicalAudit) {
        this.medicalAudit = medicalAudit;
    }

    /**
     * Enregistre une action dans la Blockchain.
     * Cette méthode est transactionnelle au sens Blockchain (coûte du gas).
     */
    public String logAction(AuditDto auditDto) throws Exception {
        logger.info("Envoi de la transaction Audit vers la Blockchain... [User: {}, Action: {}]", 
            auditDto.getUserId(), auditDto.getAction());

        // Mapping DTO -> Smart Contract (4 arguments)
        // logAction(string userId, string action, string resourceId, string dataHash)
        // Convention: Details du DTO = DataHash du contrat (ou resourceId si dataHash vide)
        TransactionReceipt receipt = medicalAudit.logAction(
            auditDto.getUserId(),
            auditDto.getAction(),
            auditDto.getResourceId(),
            auditDto.getDetails() != null ? auditDto.getDetails() : "N/A"
        ).send();

        logger.info("Transaction minée ! Hash: {}", receipt.getTransactionHash());
        return receipt.getTransactionHash();
    }

    /**
     * Récupère TOUS les logs depuis le début de la blockchain.
     * Note: Dans un environnement de prod avec des millions de logs, 
     * il faudrait paginer ou utiliser The Graph. Pour le prototype, c'est OK.
     */
    public List<AuditDto> getAllLogs() {
        logger.info("Récupération de l'historique complet...");
        
        // On récupère le Flowable (flux réactif) des événements ActionLogged
        // EARLIEST = Bloc 0 (Genesis)
        // LATEST = Bloc courant
        return medicalAudit.actionLoggedEventFlowable(
                DefaultBlockParameterName.EARLIEST,
                DefaultBlockParameterName.LATEST)
            .map(event -> {
                // Mapping Event -> DTO
                AuditDto dto = new AuditDto();
                dto.setUserId(event.userId);
                dto.setAction(event.action);
                dto.setResourceId(event.details); // Attention: le wrapper a nommé ça 'details' mais c'est 'resourceId'
                dto.setDetails("Hash-Log");       // Le Hash n'est pas dans l'event (optimisation gas), on met un placeholder
                dto.setTimestamp(event.timestamp.longValue() * 1000); // Conversion sec -> ms
                dto.setTransactionHash(event.log.getTransactionHash());
                return dto;
            })
            // on convertit le flux en liste (opération bloquante)
            .toList() 
            .blockingGet(); 
    }

    public List<AuditDto> getLogsByPatient(String patientId) {
        // Filtrage simple en Java (Stream API)
        // Dans une vraie blockchain, on utiliserait des "Indexed Topics"
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
