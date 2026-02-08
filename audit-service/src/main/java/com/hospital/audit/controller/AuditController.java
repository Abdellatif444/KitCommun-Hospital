package com.hospital.audit.controller;

import com.hospital.audit.dto.AuditDto;
import com.hospital.audit.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    /**
     * Enregistre une action dans la blockchain.
     * Endpoint: POST /audit/log
     */
    @PostMapping("/log")
    public ResponseEntity<AuditDto> logAction(@Valid @RequestBody AuditDto auditDto) {
        try {
            String transactionHash = auditService.logAction(auditDto);
            auditDto.setTransactionHash(transactionHash);
            auditDto.setTimestamp(System.currentTimeMillis()); // Timestamp approximatif de l'envoi
            return ResponseEntity.ok(auditDto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Endpoint de vérification "Health" pour la blockchain
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Audit Service is connecting to Blockchain...");
    }
}
