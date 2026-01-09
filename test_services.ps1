# ═══════════════════════════════════════════════════════════════════════
# Script de Test Complet - Kit Commun Hospitalier
# ═══════════════════════════════════════════════════════════════════════

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTS FONCTIONNELS - KIT COMMUN" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────────────
# Test 1 : Discovery Service (Eureka)
# ─────────────────────────────────────────────────────────────────────
Write-Host "[1/6] Test Discovery Service (Eureka)..." -ForegroundColor Yellow
try {
    $eureka = curl.exe http://localhost:8761/actuator/health 2>&1
    if ($eureka -match '"status":"UP"') {
        Write-Host "✅ Discovery Service : OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Discovery Service : KO" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Discovery Service : Erreur" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────────────────────
# Test 2 : Auth Service - Register
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n[2/6] Test Auth Service - Register..." -ForegroundColor Yellow
try {
    $register = curl.exe -X POST http://localhost:8080/api/auth/register `
        -H "Content-Type: application/json" `
        -d '{\"username\":\"test_user\",\"email\":\"test@hospital.com\",\"password\":\"password123\"}' `
        2>&1 | Out-String
    
    if ($register -match '"accessToken"') {
        Write-Host "✅ Register : OK (Token JWT reçu)" -ForegroundColor Green
        # Extraire le token pour les tests suivants
        $tokenMatch = $register | Select-String -Pattern '"accessToken":"([^"]+)"'
        if ($tokenMatch) {
            $global:token = $tokenMatch.Matches.Groups[1].Value
            Write-Host "   Token extrait : $($token.Substring(0,20))..." -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  Register : Utilisateur existe déjà (normal si test déjà lancé)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Register : Erreur - $_" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────────────────────
# Test 3 : Auth Service - Login
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n[3/6] Test Auth Service - Login..." -ForegroundColor Yellow
try {
    $login = curl.exe -X POST http://localhost:8080/api/auth/login `
        -H "Content-Type: application/json" `
        -d '{\"username\":\"test_user\",\"password\":\"password123\"}' `
        2>&1 | Out-String
    
    if ($login -match '"accessToken"') {
        Write-Host "✅ Login : OK (JWT valide)" -ForegroundColor Green
        # Extraire le token
        $tokenMatch = $login | Select-String -Pattern '"accessToken":"([^"]+)"'
        if ($tokenMatch) {
            $global:token = $tokenMatch.Matches.Groups[1].Value
            Write-Host "   Token JWT : $($token.Substring(0,30))..." -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Login : KO" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login : Erreur - $_" -ForegroundColor Red
}

# ─────────────────────────────────────────────────────────────────────
# Test 4 : Patient Service - Create Patient (avec JWT)
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n[4/6] Test Patient Service - Create Patient..." -ForegroundColor Yellow
if ($global:token) {
    try {
        $patient = curl.exe -X POST http://localhost:8080/api/patients `
            -H "Content-Type: application/json" `
            -H "Authorization: Bearer $global:token" `
            -d '{\"nationalId\":\"123456789\",\"firstName\":\"Jean\",\"lastName\":\"Dupont\",\"dateOfBirth\":\"1990-01-01\",\"gender\":\"MALE\",\"email\":\"jean.dupont@mail.com\"}' `
            2>&1 | Out-String
        
        if ($patient -match '"id"') {
            Write-Host "✅ Patient Service : OK (Patient créé)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Patient Service : ${patient}" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Patient Service : Erreur" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Patient Service : Skipped (pas de token)" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────────────
# Test 5 : Staff Service - Get All Staff
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n[5/6] Test Staff Service - Get All..." -ForegroundColor Yellow
if ($global:token) {
    try {
        $staff = curl.exe -X GET http://localhost:8080/api/staff `
            -H "Authorization: Bearer $global:token" `
            2>&1 | Out-String
        
        if ($staff -match '\[' -or $staff -match '200') {
            Write-Host "✅ Staff Service : OK" -ForegroundColor Green
        } else {
            Write-Host "❌ Staff Service : KO" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Staff Service : Erreur" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Staff Service : Skipped (pas de token)" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────────────
# Test 6 : Gateway Health Check
# ─────────────────────────────────────────────────────────────────────
Write-Host "`n[6/6] Test Gateway Service..." -ForegroundColor Yellow
try {
    $gateway = curl.exe http://localhost:8080/actuator/health 2>&1
    if ($gateway -match '"status":"UP"') {
        Write-Host "✅ Gateway Service : OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Gateway Service : KO" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Gateway Service : Erreur" -ForegroundColor Red
}

# ═══════════════════════════════════════════════════════════════════════
# Résumé
# ═══════════════════════════════════════════════════════════════════════
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FIN DES TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Pour tester manuellement avec Postman :" -ForegroundColor Gray
Write-Host "1. POST http://localhost:8080/api/auth/login" -ForegroundColor Gray
Write-Host "2. Copier le token JWT reçu" -ForegroundColor Gray
Write-Host "3. Ajouter Header : Authorization: Bearer <TOKEN>" -ForegroundColor Gray
Write-Host "4. Tester les endpoints /api/patients, /api/staff, etc.`n" -ForegroundColor Gray
