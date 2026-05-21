# Palmery End-to-End Flow Specification

## 1. ADMIN SETUP: KEBUN + USER ASSIGNMENT

**Actor:** Admin Utama

**Flow:**
- Admin logs in
- Admin creates Kebun Sawit (name, code, areaHa, coordinates 4 lat/lon points)
- System validates no overlap with existing Kebun
- Admin assigns one Mandor to a Kebun
- Admin assigns Supir Truk to a Kebun
- Admin assigns Buruh to a Mandor

**Rules:**
- Mandor cannot perform operational actions unless assigned to a Kebun
- Supir cannot perform delivery actions unless assigned to a Kebun
- Mandor can only assign Supir who belongs to the same Kebun
- Supir selection must be filtered by: `supir.kebunId === mandor.kebunId`

**Relationships:**
- Admin -> creates Kebun
- Admin -> assigns Mandor to Kebun
- Admin -> assigns Supir to Kebun
- Admin -> assigns Buruh to Mandor

## 2. PANEN FLOW

**Actors:** Buruh, Mandor, Payment Module

**Buruh submits:**
- kg_harvested, notes, photos (1+), created_at, worker_id, mandor_id
- status: PENDING by default
- One per day only, cannot edit after submit

**Mandor reviews:**
- Sees Hasil Panen from assigned Buruh
- Filter by: harvest_date, namaBuruh
- Approve → status=APPROVED, eligible for Pengiriman, async Buruh payroll created (PENDING)
- Reject → status=REJECTED, must provide rejection_reason

**Buruh payroll formula:** `upahBuruhPerKg * kilogramSawit * 0.9`

## 3. PENGIRIMAN FLOW

**Actors:** Mandor, Supir Truk, Admin Utama, Payment Module

**Mandor creates Pengiriman:**
- From APPROVED Hasil Panen
- Selects Supir from same Kebun only
- Total kg ≤ 400
- Status defaults to MEMUAT

**Pengiriman data:**
- id, mandor_id, supir_id, kebun_id, panen_ids, recognized_kg
- status: MEMUAT | MENGIRIM | TIBA_DI_TUJUAN
- mandorApprovalStatus: PENDING | APPROVED | REJECTED
- adminApprovalStatus: PENDING | APPROVED | PARTIALLY_APPROVED | REJECTED
- rejectionReason, acceptedKgByAdmin, createdAt

**Supir flow:**
- Updates status: MEMUAT → MENGIRIM → TIBA_DI_TUJUAN
- Can see delivery history, filter by tanggal

**Mandor validates (after TIBA_DI_TUJUAN):**
- Approve → mandorApprovalStatus=APPROVED, async Supir payroll (PENDING)
- Reject → mandorApprovalStatus=REJECTED, must provide reason

**Supir payroll formula:** `upahSupirPerKg * totalKg * 0.9`

## 4. ADMIN VALIDATES PENGIRIMAN

**Actor:** Admin Utama

- Sees Pengiriman approved by Mandor
- Filter by: namaMandor, tanggal
- Approve → adminApprovalStatus=APPROVED, acceptedKgByAdmin=totalKg, async Mandor payroll
- Partial → adminApprovalStatus=PARTIALLY_APPROVED, must input acceptedKgByAdmin (0 < x < totalKg), must provide reason
- Reject → adminApprovalStatus=REJECTED, must provide reason

**Mandor payroll formula:** `upahMandorPerKg * acceptedKgByAdmin * 0.9`

## 5. PAYMENT / PAYROLL FLOW

**Payroll data:**
- id, recipientId, recipientRole, sourceType, sourceId, amount, kilogram, description, status, rejectionReason, createdAt

**Rules:**
- Every payroll starts as PENDING
- Admin approve → recipient wallet += amount, admin wallet -= amount
- Admin reject → must provide reason, no wallet changes

**Wallet:**
- Every account has wallet, default 0 SawitDollar
- Admin can top up via Payment Gateway (1 SD = Rp10.000)

## Domain Events
- HASIL_PANEN_APPROVED → create Buruh payroll
- PENGIRIMAN_APPROVED_BY_MANDOR → create Supir payroll
- PENGIRIMAN_APPROVED_BY_ADMIN → create Mandor payroll (totalKg)
- PENGIRIMAN_PARTIALLY_APPROVED_BY_ADMIN → create Mandor payroll (acceptedKgByAdmin)
- PAYROLL_APPROVED → wallet transfer
