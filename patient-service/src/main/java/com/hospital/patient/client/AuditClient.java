package com.hospital.patient.client;

import com.hospital.patient.dto.AuditLogRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditClient {

    private final RestTemplate restTemplate;

    @Value("${audit.service.url:http://localhost:8083}")
    private String auditServiceBaseUrl;

    public void logAction(String userId, String action, String resourceId, String details) {
        try {
            AuditLogRequest request = AuditLogRequest.builder()
                .userId(userId)
                .action(action)
                .resourceId(resourceId)
                .details(details)
                .build();
            
            // Appel POST vers le service Audit
            // Si on déploie via Docker Compose, l'URL sera injectée ou par défaut localhost
            restTemplate.postForObject(auditServiceBaseUrl + "/audit/log", request, String.class);
            log.info("Audit log sent successfully for action: {}", action);
        } catch (Exception e) {
            log.error("FAILED to send audit log to blockchain service: {}", e.getMessage());
            // Pour l'instant on log l'erreur mais on ne bloque pas la transaction métier
        }
    }
}
