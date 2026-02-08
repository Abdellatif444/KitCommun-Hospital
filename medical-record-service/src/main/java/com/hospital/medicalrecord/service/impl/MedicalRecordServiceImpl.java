package com.hospital.medicalrecord.service.impl;

import com.hospital.medicalrecord.client.AuditClient;
import com.hospital.medicalrecord.dto.MedicalEntryDTO;
import com.hospital.medicalrecord.dto.MedicalRecordDTO;
import com.hospital.medicalrecord.exception.MedicalRecordNotFoundException;
import com.hospital.medicalrecord.mapper.MedicalEntryMapper;
import com.hospital.medicalrecord.mapper.MedicalRecordMapper;
import com.hospital.medicalrecord.model.MedicalEntry;
import com.hospital.medicalrecord.model.MedicalRecord;
import com.hospital.medicalrecord.repository.MedicalEntryRepository;
import com.hospital.medicalrecord.repository.MedicalRecordRepository;
import com.hospital.medicalrecord.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                  MEDICAL RECORD SERVICE IMPLEMENTATION                       ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  WHY THIS CLASS EXISTS:                                                      ║
 * ║  Implements business logic for medical record operations.                    ║
 * ║                                                                              ║
 * ║  // Security will be reinforced in Subject 3                                 ║
 * ║  // Permissions will be checked in Subject 2                                 ║
 * ║  // Business logic will be added in the specialized subject                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final MedicalEntryRepository entryRepository;
    private final MedicalRecordMapper recordMapper;
    private final MedicalEntryMapper entryMapper;
    private final AuditClient auditClient;

    @Override
    public MedicalRecordDTO createMedicalRecord(Long patientId) {
        log.info("Creating medical record for patient: {}", patientId);
        // // Permissions will be checked in Subject 2
        
        // TODO: Validate patient exists via Patient Service
        
        MedicalRecord record = MedicalRecord.builder()
                .patientId(patientId)
                .build();

        MedicalRecord saved = recordRepository.save(record);
        log.info("Medical record created with ID: {}", saved.getId());

        // AUDIT LOG
        auditClient.logAction(getCurrentUserId(), "CREATE_MEDICAL_RECORD", saved.getId().toString(), "Record created for patient " + patientId);

        return recordMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MedicalRecordDTO> getMedicalRecordById(Long id) {
        log.debug("Fetching medical record by ID: {}", id);
        // // Security will be reinforced in Subject 3
        Optional<MedicalRecordDTO> record = recordRepository.findById(id)
                .map(recordMapper::toDTO);

        // AUDIT LOG
        record.ifPresent(r -> auditClient.logAction(getCurrentUserId(), "VIEW_MEDICAL_RECORD", id.toString(), "Accessed record details"));
        
        return record;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MedicalRecordDTO> getMedicalRecordByPatientId(Long patientId) {
        log.debug("Fetching medical record for patient: {}", patientId);
        // // Permissions will be checked in Subject 2
        Optional<MedicalRecordDTO> record = recordRepository.findByPatientId(patientId)
                .map(recordMapper::toDTO);

        // AUDIT LOG
        record.ifPresent(r -> auditClient.logAction(getCurrentUserId(), "VIEW_MEDICAL_RECORD_PATIENT", r.getId().toString(), "Accessed record via Patient ID " + patientId));
        
        return record;
    }

    @Override
    public MedicalRecordDTO updateMedicalRecord(Long id, MedicalRecordDTO recordDTO) {
        log.info("Updating medical record: {}", id);
        // // Permissions will be checked in Subject 2

        MedicalRecord existing = recordRepository.findById(id)
                .orElseThrow(() -> new MedicalRecordNotFoundException("Medical record not found: " + id));

        recordMapper.updateEntityFromDTO(recordDTO, existing);
        MedicalRecord updated = recordRepository.save(existing);

        // AUDIT LOG
        auditClient.logAction(getCurrentUserId(), "UPDATE_MEDICAL_RECORD", id.toString(), "Record updated");

        return recordMapper.toDTO(updated);
    }

    @Override
    public MedicalEntryDTO addEntry(Long patientId, MedicalEntryDTO entryDTO) {
        log.info("Adding entry to medical record for patient: {}", patientId);
        // // Business logic will be added in the specialized subject

        MedicalRecord record = recordRepository.findByPatientId(patientId)
                .orElseThrow(() -> new MedicalRecordNotFoundException(
                        "Medical record not found for patient: " + patientId));

        MedicalEntry entry = entryMapper.toEntity(entryDTO);
        record.addEntry(entry);

        MedicalEntry savedEntry = entryRepository.save(entry);
        log.info("Medical entry added with ID: {}", savedEntry.getId());

        // AUDIT LOG (Critical!)
        auditClient.logAction(getCurrentUserId(), "ADD_MEDICAL_ENTRY", savedEntry.getId().toString(), "Added new entry to record " + record.getId());

        return entryMapper.toDTO(savedEntry);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MedicalEntryDTO> getEntryById(Long entryId) {
        log.debug("Fetching medical entry: {}", entryId);
        Optional<MedicalEntryDTO> entry = entryRepository.findById(entryId)
                .map(entryMapper::toDTO);

        // AUDIT LOG
        entry.ifPresent(e -> auditClient.logAction(getCurrentUserId(), "VIEW_MEDICAL_ENTRY", entryId.toString(), "Accessed specific entry details"));
        
        return entry;
    }

    @Override
    public MedicalRecordDTO getOrCreateMedicalRecord(Long patientId) {
        log.debug("Getting or creating medical record for patient: {}", patientId);
        
        return recordRepository.findByPatientId(patientId)
                .map(r -> {
                    // Si on le trouve, on log la vue
                    auditClient.logAction(getCurrentUserId(), "VIEW_MEDICAL_RECORD", r.getId().toString(), "Accessed record (getOrCreate)");
                    return recordMapper.toDTO(r);
                })
                .orElseGet(() -> createMedicalRecord(patientId)); // create va déjà loguer
    }
    
    // Helper to get current user ID
    private String getCurrentUserId() {
        return "SYSTEM_USER"; // TODO: Implement SecurityContextHolder
    }
}
