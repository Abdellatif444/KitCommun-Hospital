package com.hospital.auth.model;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                          ROLE ENUMERATION                                    ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  WHY THIS ENUM EXISTS:                                                       ║
 * ║  Defines system roles for Role-Based Access Control (RBAC).                  ║
 * ║                                                                              ║
 * ║  // Permissions will be checked in Subject 2                                 ║
 * ║  Students: Map these roles to specific permissions.                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
public enum Role {
    /**
     * System administrator - full access.
     */
    ROLE_ADMIN,
    
    /**
     * Doctor - can access patient records, create appointments.
     */
    ROLE_DOCTOR,
    
    /**
     * Nurse - can access patient records with restrictions.
     */
    ROLE_NURSE,
    
    /**
     * Receptionist - can manage appointments.
     */
    ROLE_RECEPTIONIST,
    
    /**
     * Lab technician - can add lab results.
     */
    ROLE_LAB_TECH,
    
    /**
     * Patient - can view own records.
     */
    ROLE_PATIENT
}

