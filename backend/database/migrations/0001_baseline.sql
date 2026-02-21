-- SMSPro baseline schema aligned to docs/smspro-e2e-scope-and-design.md section 5.

CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sites (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  jurisdiction_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_assignments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  site_id UUID REFERENCES sites(id),
  role_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE regulation_sources (
  id UUID PRIMARY KEY,
  jurisdiction_code TEXT NOT NULL,
  source_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE obligations (
  id UUID PRIMARY KEY,
  regulation_source_id UUID NOT NULL REFERENCES regulation_sources(id),
  citation TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE obligation_versions (
  id UUID PRIMARY KEY,
  obligation_id UUID NOT NULL REFERENCES obligations(id),
  version_label TEXT NOT NULL,
  effective_at DATE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE applicability_rules (
  id UUID PRIMARY KEY,
  obligation_id UUID NOT NULL REFERENCES obligations(id),
  rule_expression JSONB NOT NULL,
  explanation_template TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intake_questions (
  id UUID PRIMARY KEY,
  version_tag TEXT NOT NULL,
  prompt TEXT NOT NULL,
  question_type TEXT NOT NULL,
  conditions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intake_snapshots (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intake_responses (
  id UUID PRIMARY KEY,
  snapshot_id UUID NOT NULL REFERENCES intake_snapshots(id),
  question_id UUID NOT NULL REFERENCES intake_questions(id),
  response_value JSONB NOT NULL
);

CREATE TABLE program_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  program_key TEXT NOT NULL UNIQUE,
  template_body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE program_documents (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  program_template_id UUID NOT NULL REFERENCES program_templates(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE program_revisions (
  id UUID PRIMARY KEY,
  program_document_id UUID NOT NULL REFERENCES program_documents(id),
  revision_number INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_document_id, revision_number)
);

CREATE TABLE approval_steps (
  id UUID PRIMARY KEY,
  program_revision_id UUID NOT NULL REFERENCES program_revisions(id),
  approver_user_id UUID NOT NULL REFERENCES users(id),
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL,
  decided_at TIMESTAMPTZ
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  obligation_id UUID REFERENCES obligations(id),
  program_document_id UUID REFERENCES program_documents(id),
  event_at TIMESTAMPTZ NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inspections (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  obligation_id UUID REFERENCES obligations(id),
  program_document_id UUID REFERENCES program_documents(id),
  inspected_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE findings (
  id UUID PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES inspections(id),
  obligation_id UUID REFERENCES obligations(id),
  severity TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE corrective_actions (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  incident_id UUID REFERENCES incidents(id),
  finding_id UUID REFERENCES findings(id),
  obligation_id UUID REFERENCES obligations(id),
  program_document_id UUID REFERENCES program_documents(id),
  description TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id),
  due_date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE training_records (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  user_id UUID NOT NULL REFERENCES users(id),
  obligation_id UUID REFERENCES obligations(id),
  program_document_id UUID REFERENCES program_documents(id),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

CREATE TABLE permits (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  obligation_id UUID REFERENCES obligations(id),
  program_document_id UUID REFERENCES program_documents(id),
  permit_type TEXT NOT NULL,
  issued_to_user_id UUID REFERENCES users(id),
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

CREATE TABLE evidence_artifacts (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  obligation_id UUID REFERENCES obligations(id),
  program_document_id UUID REFERENCES program_documents(id),
  linked_entity_type TEXT NOT NULL,
  linked_entity_id UUID NOT NULL,
  artifact_type TEXT NOT NULL,
  uri TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE report_export_jobs (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id),
  format TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  result_uri TEXT
);
