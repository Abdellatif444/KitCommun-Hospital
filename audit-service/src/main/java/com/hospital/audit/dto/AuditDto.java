package com.hospital.audit.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class AuditDto {

    @NotBlank(message = "L'ID utilisateur est obligatoire")
    private String userId;

    @NotBlank(message = "L'action est obligatoire")
    private String action;

    @NotBlank(message = "L'ID ressource est obligatoire")
    private String resourceId;

    private String details;
    private Long timestamp;
    private String transactionHash;

    // Constructeurs
    public AuditDto() {}

    public AuditDto(String userId, String action, String resourceId, String details, Long timestamp, String transactionHash) {
        this.userId = userId;
        this.action = action;
        this.resourceId = resourceId;
        this.details = details;
        this.timestamp = timestamp;
        this.transactionHash = transactionHash;
    }

    // Getters et Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }

    public String getTransactionHash() { return transactionHash; }
    public void setTransactionHash(String transactionHash) { this.transactionHash = transactionHash; }
}
