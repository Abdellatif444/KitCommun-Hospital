package com.hospital.audit.service;

import com.hospital.audit.contract.MedicalAudit;
import com.hospital.audit.dto.AuditDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.math.BigInteger;
import java.time.Instant;

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
        TransactionReceipt receipt = medicalAudit.logAction(
            auditDto.getUserId(),
            auditDto.getAction(),
            auditDto.getResourceId(),
            auditDto.getDetails() != null ? auditDto.getDetails() : "N/A" // Utilise details comme dataHash
        ).send();

        logger.info("Transaction minée ! Hash: {}", receipt.getTransactionHash());
        return receipt.getTransactionHash();
    }
}
