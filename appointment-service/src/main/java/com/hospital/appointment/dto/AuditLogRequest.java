package com.hospital.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogRequest {
    private String userId;
    private String action;
    private String resourceId;
    private String details;
}
