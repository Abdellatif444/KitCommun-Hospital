$ErrorActionPreference = "Stop"

# Configuration base URL
$baseUrl = "http://localhost:8081" # Patient Service

Write-Host "--- 🏥 AUDIT TRAIL TEST SCENARIO: CREATE -> UPDATE -> DELETE ---" -ForegroundColor Yellow

# 1. GENERATE RANDOM DATA
$randomId = Get-Random -Minimum 1000 -Maximum 9999
$firstName = "PatientTests_$randomId"
$lastName = "AuditLog"
$nationalId = "NAT_$randomId"
$email = "patient_$randomId@hospital.com"

# 2. CREATE PATIENT
Write-Host "`n1. [CREATE] Creating Patient..." -ForegroundColor Cyan
$body = @{
    firstName = $firstName
    lastName = $lastName
    email = $email
    nationalId = $nationalId
    dateOfBirth = "1990-01-01"
    gender = "MALE"
    address = "123 Blockchain Ave"
    phoneNumber = "555-0199"
}

try {
    $jsonBody = $body | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Post -Body $jsonBody -ContentType "application/json"
    $patientId = $response.id
    Write-Host "   ✅ Patient Created! ID: $patientId" -ForegroundColor Green
} catch {
    Write-Error "   ❌ Failed to create patient: $_"
    exit
}

# Wait for 3 seconds to separate logs clearly
Start-Sleep -Seconds 3

# 3. UPDATE PATIENT
if ($patientId) {
    Write-Host "`n2. [UPDATE] Updating Patient ($patientId)..." -ForegroundColor Cyan
    $body.firstName = $firstName + "_Updated"
    $body.email = "updated_$randomId@hospital.com"
    
    try {
        $jsonBody = $body | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/api/patients/$patientId" -Method Put -Body $jsonBody -ContentType "application/json"
        Write-Host "   ✅ Patient Updated!" -ForegroundColor Green
    } catch {
        Write-Error "   ❌ Failed to update patient: $_"
    }
}

# Wait for 3 seconds
Start-Sleep -Seconds 3

# 4. DELETE PATIENT
if ($patientId) {
    Write-Host "`n3. [DELETE] Deleting Patient ($patientId)..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/patients/$patientId" -Method Delete
        Write-Host "   ✅ Patient Deleted (Soft Delete)!" -ForegroundColor Green
    } catch {
        Write-Error "   ❌ Failed to delete patient: $_"
    }
}

Write-Host "`n--- SCENARIO COMPLETE ---" -ForegroundColor Yellow
Write-Host "Please check the Audit Dashboard (http://localhost:5173) to verify the logs." -ForegroundColor White
