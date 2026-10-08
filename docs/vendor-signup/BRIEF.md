# Vendor self-signup

Owner request: public signup with useful service/operating-area settings aligned with A5's database and manual free-lead workflow.

Build `/vendors/join`: business/contact/email, optional phone/website, canonical services, county bulk selection with individual municipality adjustments, optional project preferences, explicit permission to receive A5 project emails, review and receipt. A county selection expands to its current municipality IDs; it is not an inferred radius or a promise to cover future towns. Selected services apply to all selected towns under the existing independent coverage tables; exceptions are notes for the operator.

Store submissions privately in Supabase with idempotency and Turnstile. Surface pending submissions in the existing work queue and a vendor signup inbox. Operator can create a DISCOVERED vendor with exact service/location mappings, link an existing record without overwriting it, or dismiss. No automatic activation, capacity checks, auto-assignment, payments, credentials verification claims, vendor accounts, or outbound messages. Required email prevents missing-email signup records. Existing sourced records remain unchanged.

One additive migration with RLS and service-role-only transactional functions. Feature flag ENABLE_VENDOR_SIGNUP defaults off. No dependencies. Test validation, duplicate/retry handling, authorization, transactional acceptance, mapping integrity, phone layouts and build targets. Production release requires applying the migration before enabling the flag. Signup review is a data-integrity step, not a vendor availability/pre-confirmation gate.
