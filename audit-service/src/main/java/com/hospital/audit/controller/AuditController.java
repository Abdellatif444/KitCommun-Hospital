package com.hospital.audit.controller;

import com.hospital.audit.dto.AuditDto;
import com.hospital.audit.service.AuditService;
import jakarta.validation.Valid;
import java.util.List;
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
            auditDto.setTimestamp(System.currentTimeMillis()); 
            return ResponseEntity.ok(auditDto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Récupère TOUS les logs
     * Endpoint: GET /audit/logs
     */
    @GetMapping("/logs")
    public ResponseEntity<List<AuditDto>> getAllLogs() {
        return ResponseEntity.ok(auditService.getAllLogs());
    }

    /**
     * Récupère les logs d'un patient spécifique
     * Endpoint: GET /audit/patient/{id}
     */
    @GetMapping("/patient/{id}")
    public ResponseEntity<List<AuditDto>> getLogsByPatient(@PathVariable String id) {
        return ResponseEntity.ok(auditService.getLogsByPatient(id));
    }

    /**
     * Récupère les logs d'un utilisateur spécifique (médecin, admin...)
     * Endpoint: GET /audit/user/{id}
     */
    @GetMapping("/user/{id}")
    public ResponseEntity<List<AuditDto>> getLogsByUser(@PathVariable String id) {
        return ResponseEntity.ok(auditService.getLogsByUser(id));
    }

    /**
     * Endpoint de vérification "Health" pour la blockchain
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Audit Service is connecting to Blockchain...");
    }
}
