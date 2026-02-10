package com.hospital.patient.service.impl;

import com.hospital.patient.client.AuditClient;
import com.hospital.patient.dto.PatientCreateRequest;
import com.hospital.patient.dto.PatientDTO;
import com.hospital.patient.exception.PatientNotFoundException;
import com.hospital.patient.exception.DuplicatePatientException;
import com.hospital.patient.mapper.PatientMapper;
import com.hospital.patient.model.Patient;
import com.hospital.patient.repository.PatientRepository;
import com.hospital.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    PATIENT SERVICE IMPLEMENTATION                            ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  WHY THIS CLASS EXISTS:                                                      ║
 * ║  Implements the business logic for patient operations.                       ║
 * ║                                                                              ║
 * ║  @Transactional: Ensures database operations are atomic                      ║
 * ║  @RequiredArgsConstructor: Lombok generates constructor with final fields    ║
 * ║  @Slf4j: Lombok generates a logger instance                                  ║
 * ║                                                                              ║
 * ║  // Business logic will be added in the specialized subject                  ║
 * ║  Students: This is where you implement your business rules.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;
    private final AuditClient auditClient;

    @Override
    public PatientDTO createPatient(PatientCreateRequest request) {
        log.info("Creating new patient with national ID: {}", request.getNationalId());

        // Check for duplicate national ID
        // // Business logic will be added in the specialized subject
        if (patientRepository.existsByNationalId(request.getNationalId())) {
            throw new DuplicatePatientException(
                    "Patient with national ID " + request.getNationalId() + " already exists");
        }

        // Map DTO to entity
        Patient patient = patientMapper.toEntity(request);

        // Save and return
        // Save and return
        Patient savedPatient = patientRepository.save(patient);
        
        // Compute and store integrity hash
        String integrityHash = computeDataHash(savedPatient);
        savedPatient.setIntegrityHash(integrityHash);
        savedPatient = patientRepository.save(savedPatient);

        log.info("Patient created with ID: {}", savedPatient.getId());

        // AUDIT LOG
        auditClient.logAction(getCurrentUserId(), "CREATE_PATIENT", savedPatient.getId().toString(), "Patient created", integrityHash);

        return patientMapper.toDTO(savedPatient);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PatientDTO> getPatientById(Long id) {
        log.debug("Fetching patient by ID: {}", id);
        // Permissions will be checked in Subject 2
        Optional<PatientDTO> patient = patientRepository.findById(id)
                .map(patientMapper::toDTO);

        // AUDIT LOG (only if found)
        patient.ifPresent(p -> auditClient.logAction(getCurrentUserId(), "VIEW_PATIENT", id.toString(), "Accessed patient details"));
        
        return patient;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PatientDTO> getPatientByNationalId(String nationalId) {
        log.debug("Fetching patient by national ID: {}", nationalId);
        Optional<PatientDTO> patient = patientRepository.findByNationalId(nationalId)
                .map(patientMapper::toDTO);

        // AUDIT LOG
        patient.ifPresent(p -> auditClient.logAction(getCurrentUserId(), "SEARCH_PATIENT", p.getId().toString(), "Searched by National ID"));
        
        return patient;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDTO> getAllPatients() {
        log.debug("Fetching all patients");
        // Permissions will be checked in Subject 2
        // Modified for Subject 1: Return only active patients
        List<PatientDTO> patients = patientRepository.findByActiveTrue().stream()
                .map(patientMapper::toDTO)
                .collect(Collectors.toList());
        
        // AUDIT LOG (listing)
        // Note: Listing might generate too many logs if we log each item. We log the action instead.
        // auditClient.logAction(getCurrentUserId(), "LIST_PATIENTS", "ALL", "Listed all active patients. Count: " + patients.size());
        
        return patients;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDTO> searchPatients(String searchTerm) {
        log.debug("Searching patients with term: {}", searchTerm);
        // Business logic will be added in the specialized subject
        // TODO: Ensure search also respects active flag
        List<PatientDTO> results = patientRepository.findByLastNameContainingIgnoreCase(searchTerm).stream()
                .filter(Patient::getActive) // Client-side filtering for now, better to do in DB
                .map(patientMapper::toDTO)
                .collect(Collectors.toList());
                
        // AUDIT LOG (search)
        auditClient.logAction(getCurrentUserId(), "SEARCH_PATIENTS", "QUERY:" + searchTerm, "Search results count: " + results.size());
        
        return results;
    }

    @Override
    public PatientDTO updatePatient(Long id, PatientDTO patientDTO) {
        log.info("Updating patient with ID: {}", id);
        // Permissions will be checked in Subject 2

        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));
        
        if (!Boolean.TRUE.equals(existingPatient.getActive())) {
             throw new PatientNotFoundException("Patient record is inactive (deleted): " + id);
        }

        // Update fields
        // Update fields
        // Business logic will be added in the specialized subject
        patientMapper.updateEntityFromDTO(patientDTO, existingPatient);
        
        // Compute and store integrity hash
        String integrityHash = computeDataHash(existingPatient);
        existingPatient.setIntegrityHash(integrityHash);

        Patient updatedPatient = patientRepository.save(existingPatient);
        log.info("Patient updated successfully: {}", id);

        // AUDIT LOG
        auditClient.logAction(getCurrentUserId(), "UPDATE_PATIENT", id.toString(), "Patient updated", integrityHash);

        return patientMapper.toDTO(updatedPatient);
    }

    @Override
    public void deletePatient(Long id) {
        log.info("Deleting patient with ID: {}", id);
        // Permissions will be checked in Subject 2
        // Security will be reinforced in Subject 3

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + id));

        // Subject 1 Implementation: Soft Delete
        // We do not delete the record, we mark it as inactive
        log.info("Performing SOFT DELETE for patient: {}", id);
        patient.setActive(false);
        
        // Compute and store integrity hash
        String integrityHash = computeDataHash(patient);
        patient.setIntegrityHash(integrityHash);

        patientRepository.save(patient);
        
        log.info("Patient deactivated successfully: {}", id);

        // AUDIT LOG
        auditClient.logAction(getCurrentUserId(), "DELETE_PATIENT", id.toString(), "Patient soft deleted (deactivated)", integrityHash);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return patientRepository.existsById(id);
    }
    
    // Helper to get current user ID (Simulation of UUID for Subject 1 compliance)
    private String getCurrentUserId() {
        // In Subject 3, this will be extracted from the JWT token.
        // For Subject 1, we use a technical pseudonym (UUID) to follow security rules.
        return "u-86f91f24-f3a7-4c4f-9e6b-0b1e83a736a5"; 
    }

    private String computeDataHash(Object data) {
        try {
            String input = data.toString();
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (int i = 0; i < encodedhash.length; i++) {
                String hex = Integer.toHexString(0xff & encodedhash[i]);
                if(hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.warn("Failed to compute data hash", e);
            return "HASH_ERROR";
        }
    }
}
