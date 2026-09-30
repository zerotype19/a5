# A5-008 — Vendor model and manual lead assignment

**Task:** A5-008  
**Migration:** `supabase/migrations/20260923210000_a5_008_vendor_assignment.sql`  
**Version:** `20260923210000` (after A5-007 `20260923200000`)  
**Destructive:** NO  
**Owner approval:** A5-008 task authorization  

## Changes

1. `vendors` with status enum and minimal credential fields on the vendor row.
2. `vendor_services` and `vendor_locations` referencing canonical registries.
3. `lead_assignments` with a partial unique index: one `ASSIGNED` or `ACCEPTED` row per lead.
4. `admin_upsert_vendor` and `admin_assign_lead_to_vendor`, `service_role` only.
5. `admin_transition_lead_status` refuses `to_status = ASSIGNED`.

Eligibility is `ACTIVE` + `accepting_leads` + service match + location match. Null lead service or location matches no vendor. No ZIP inference. No vendor notification.

CSV import (`/admin/vendors/import`) inserts `DISCOVERED` rows only. `accepting_leads` is allowed only when status is `ACTIVE`. The candidate file is `data/vendors/northern-nj-candidates.csv`. Loading that file does not approve or activate anyone.

## Apply (non-prod)

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260923210000_a5_008_vendor_assignment.sql
```

Production apply is not authorized.
