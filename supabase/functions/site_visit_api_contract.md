# Site Visit / Compliance Blitz – API Contract (Phase 1)

Status: DRAFT – DO NOT APPLY CODE

## Principles
- All tables are RLS-protected. Access derives from organiser allocations via `get_accessible_job_sites` and `get_accessible_employers` and admin bypass.
- Prefer code columns as FKs to reference tables for stability (e.g., `rating_code`, `status_code`).
- Support offline idempotency via `client_generated_id` where provided.
- Optimistic concurrency on `site_visit.version` for conflicting updates.
- Evidence storage defaults: bucket `site-visit-evidence`, signed URL TTL 14 days, watermark enabled with site/date/`sv_code` overlay.

## Table payloads

### site_visit
- Insert
```json
{
  "employer_id": "uuid",
  "job_site_id": "uuid",
  "scheduled_at": "2025-08-20T10:00:00+10:00",
  "objective": "string?",
  "sv_code": "short-code",
  "estimated_workers_count": 50
}
```
- Update
```json
{
  "objective": "string?",
  "estimated_workers_count": 60,
  "status_code": "in_progress",
  "version": 2,
  "approved_at": "2025-08-25T15:30:00+10:00?",
  "approved_by_profile_id": "uuid?",
  "outcomes_locked": true
}
```

### site_visit_checklist_response
```json
{
  "site_visit_id": "uuid",
  "checklist_item_code": "roe_email_sent",
  "response_option_code": "yes",
  "comment": "string?"
}
```

### whs_assessment
```json
{
  "site_visit_id": "uuid",
  "rating_code": "3",
  "notes": "string?"
}
```

### whs_breach
```json
{
  "whs_assessment_id": "uuid",
  "title": "Missing edge protection on level 2",
  "rating_code": "3",
  "notes": "Observed along east elevation",
  "photo_evidence_path": ["path/in/storage.jpg"]
}
```

### entitlements_audit
```json
{
  "site_visit_id": "uuid",
  "sample_size": 10,
  "super_paid": false,
  "super_paid_to_fund": false,
  "redundancy_contributions_up_to_date": true,
  "eba_allowances_correct": false,
  "wages_correct": true,
  "issues_summary": "string?",
  "evidence_paths": ["path"]
}
```

### entitlement_breach
```json
{
  "entitlements_audit_id": "uuid",
  "category_code_v2": "wages",
  "title": "Incorrect Saturday loading",
  "rating_code": "2",
  "notes": "Paid 25% instead of 50%",
  "evidence_paths": ["path"],
  "worker_id": "uuid?"
}
```

### entitlement_issue (worker-level optional)
```json
{
  "entitlements_audit_id": "uuid",
  "worker_id": "uuid?",
  "issue_code": "super_not_paid",
  "description": "string?",
  "severity": "string?",
  "resolved": false
}
```

### delegate_assessment
```json
{
  "site_visit_id": "uuid",
  "delegate_worker_id": "uuid?",
  "present": true,
  "overall_notes": "string?"
}
```

### delegate_role_rating
```json
{
  "delegate_assessment_id": "uuid",
  "role_type_code": "communication",
  "rating_code": "3",
  "notes": "string?"
}
```

### dd_conversion_attempt
```json
{
  "site_visit_id": "uuid",
  "worker_id": "uuid?",
  "method_code": "in_person",
  "starting_payment_method": "string?",
  "outcome_code": "converted",
  "follow_up_at": "2025-09-01T09:00:00+10:00",
  "dd_mandate_path": "path?",
  "notes": "string?",
  "client_generated_id": "uuid-like"
}
```

### site_visit_eba_snapshot
```json
{
  "site_visit_id": "uuid",
  "eba_id": "uuid?",
  "eba_version": "string?",
  "document_url": "string?"
}
```

### site_visit_roster_snapshot
```json
{
  "site_visit_id": "uuid",
  "generated_from_source": "payroll_export_2025-08-01",
  "total_workers": 42
}
```

### site_visit_roster_worker
```json
{
  "roster_snapshot_id": "uuid",
  "worker_id": "uuid?",
  "external_worker_ref": "string?",
  "present": true,
  "phone": "string?",
  "email": "string?",
  "notes": "string?"
}
```

### visit_compliance_summary
```json
{
  "site_visit_id": "uuid",
  "overall_score": 77.5,
  "classification_code": "at_risk",
  "category_scores_json": {
    "membership_dd": 60,
    "entitlements": 55,
    "whs": 80,
    "delegate": { "capabilities": 70, "ratio": 40 }
  },
  "triggered_rules": [{ "code": "critical_ent_super_not_cbus" }]
}
```

### site_visit_task
```json
{
  "site_visit_id": "uuid",
  "title": "Email Right-of-Entry",
  "due_at": "2025-08-16T09:00:00+10:00",
  "assigned_to_profile_id": "uuid?"
}
```

### site_visit_attachment
```json
{
  "site_visit_id": "uuid",
  "category": "photo",
  "storage_path": "bucket/path/file.jpg"
}
```

## RLS summary
- Read/write allowed for admins, and for organisers/lead organisers when the `site_visit` is within their accessible sites/employers or created by them.
- Reference tables are readable to all authenticated; only admins can modify.
- Organisers can update `worker_memberships` at any time for workers in their scope (RLS policies already allow this via `get_accessible_workers`).

## Error patterns
- 401/403 on RLS failures; ensure organiser allocations are configured.
- 409 on optimistic concurrency (version mismatch) – retry with refreshed row.

## Idempotency
- Use `client_generated_id` for mobile/offline POSTs (e.g., DD attempts). Upserts on unique columns (`site_visit_id`, etc.) where noted.
- Evidence storage: generate watermarked copy on upload; signed links expire per `app_settings` TTL (default 14 days).