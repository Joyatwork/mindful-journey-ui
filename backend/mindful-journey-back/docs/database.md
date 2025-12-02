# Documentation de la base de données (mindful_journey)

Généré le: 2025-11-28 10:56:06

## Tables (63)

### absenteeism

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| replacement_cost | decimal(12,2) | YES |  |  |  |  |
| productivity_loss | decimal(12,2) | YES |  |  |  |  |
| training_cost | decimal(12,2) | YES |  |  |  |  |
| team_overload_cost | decimal(12,2) | YES |  |  |  |  |
| total_cost | decimal(12,2) | YES |  | STORED GENERATED |  |  |
| replacement_percentage | decimal(5,2) | YES |  | STORED GENERATED |  |  |
| productivity_percentage | decimal(5,2) | YES |  | STORED GENERATED |  |  |
| training_percentage | decimal(5,2) | YES |  | STORED GENERATED |  |  |
| overload_percentage | decimal(5,2) | YES |  | STORED GENERATED |  |  |
| absenteeism_rate_current | decimal(5,2) | YES |  |  |  |  |
| absenteeism_rate_target | decimal(5,2) | YES |  |  |  |  |
| absenteeism_savings | decimal(12,2) | YES |  |  |  |  |
| lost_days_current | int | YES |  |  |  |  |
| lost_days_target | int | YES |  |  |  |  |
| lost_days_savings | decimal(12,2) | YES |  |  |  |  |
| cost_per_absence_current | decimal(12,2) | YES |  |  |  |  |
| cost_per_absence_target | decimal(12,2) | YES |  |  |  |  |
| cost_per_absence_savings | decimal(12,2) | YES |  |  |  |  |
| target_absenteeism_reduction | decimal(5,2) | YES |  |  |  |  |
| total_potential_savings | decimal(12,2) | YES |  | STORED GENERATED |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### action_plan

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| department | varchar(50) | NO |  |  |  | 50 |
| people_count | int | NO |  |  |  |  |
| risk_level | varchar(20) | YES |  |  |  | 20 |
| problem_identified | varchar(255) | YES |  |  |  | 255 |
| predicted_risk | varchar(50) | YES |  |  |  | 50 |
| predicted_timeframe | varchar(50) | YES |  |  |  | 50 |
| recommended_solution | varchar(255) | YES |  |  |  | 255 |
| estimated_budget_eur | int | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### annual_diagnostics

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| user_id | bigint unsigned | NO |  |  | MUL |  |
| gender | varchar(30) | YES |  |  |  | 30 |
| age_group | varchar(30) | YES |  |  |  | 30 |
| department | varchar(120) | YES |  |  |  | 120 |
| stress_level | tinyint unsigned | NO |  |  |  |  |
| energy_level | tinyint unsigned | NO |  |  |  |  |
| work_pressure | varchar(255) | NO |  |  |  | 255 |
| answers | json | NO |  |  |  |  |
| completed_at | timestamp | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| annual_diagnostics_user_id_foreign | user_id | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| annual_diagnostics_user_id_completed_at_index | 1 | BTREE | user_id, completed_at |

---

### appointment_services

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| code | varchar(255) | NO |  |  |  | 255 |
| label | varchar(255) | NO |  |  |  | 255 |
| default_duration_min | smallint | NO | 30 |  |  |  |
| default_price_cents | int | NO | 0 |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| appointment_services_entreprise_id_foreign | entreprise_id | entreprises | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| appointment_services_entreprise_id_code_unique | 0 | BTREE | entreprise_id, code |

---

### appointment_status_histories

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| appointment_id | bigint unsigned | NO |  |  | MUL |  |
| changed_at | timestamp | NO | CURRENT_TIMESTAMP | DEFAULT_GENERATED |  |  |
| old_status | varchar(255) | YES |  |  |  | 255 |
| new_status | varchar(255) | NO |  |  |  | 255 |
| changed_by | bigint unsigned | NO |  |  | MUL |  |
| reason | varchar(255) | YES |  |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| appointment_status_histories_appointment_id_foreign | appointment_id | appointments | id |
| appointment_status_histories_changed_by_foreign | changed_by | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| appointment_status_histories_appointment_id_foreign | 1 | BTREE | appointment_id |
| appointment_status_histories_changed_by_foreign | 1 | BTREE | changed_by |

---

### appointments

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| praticien_id | bigint unsigned | NO |  |  |  |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| site_id | bigint unsigned | YES |  |  | MUL |  |
| service_id | bigint unsigned | NO |  |  | MUL |  |
| practitioner_id | bigint unsigned | NO |  |  | MUL |  |
| employee_id | bigint unsigned | NO |  |  | MUL |  |
| mode | enum('presentiel','teleconsultation') | NO |  |  |  | 16 |
| status | enum('pending','confirmed','completed','cancelled','no_show') | NO | pending |  |  | 9 |
| scheduled_at | datetime | NO |  |  |  |  |
| duration | int | NO | 45 |  |  |  |
| type | varchar(255) | YES |  |  |  | 255 |
| end_at | datetime | YES |  |  |  |  |
| duration_min | smallint | YES |  |  |  |  |
| price_cents | int | NO | 0 |  |  |  |
| cancellation_reason | varchar(255) | YES |  |  |  | 255 |
| notes | text | YES |  |  |  | 65535 |
| consultation_link | varchar(255) | YES |  |  |  | 255 |
| consultation_token | varchar(255) | YES |  |  |  | 255 |
| link_expires_at | timestamp | YES |  |  |  |  |
| is_teleconsultation | tinyint(1) | NO | 0 |  |  |  |
| created_by | bigint unsigned | NO |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| appointments_created_by_foreign | created_by | users | id |
| appointments_employee_id_foreign | employee_id | employees | id |
| appointments_entreprise_id_foreign | entreprise_id | entreprises | id |
| appointments_practitioner_id_foreign | practitioner_id | practitioners | id |
| appointments_service_id_foreign | service_id | appointment_services | id |
| appointments_site_id_foreign | site_id | sites | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| appointments_service_id_foreign | 1 | BTREE | service_id |
| appointments_created_by_foreign | 1 | BTREE | created_by |
| appointments_practitioner_id_scheduled_at_index | 1 | BTREE | practitioner_id, scheduled_at |
| appointments_entreprise_id_scheduled_at_index | 1 | BTREE | entreprise_id, scheduled_at |
| appointments_site_id_scheduled_at_index | 1 | BTREE | site_id, scheduled_at |
| appointments_employee_id_scheduled_at_index | 1 | BTREE | employee_id, scheduled_at |

---

### budget_categories

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| budget_id | bigint unsigned | NO |  |  | MUL |  |
| name | varchar(255) | NO |  |  |  | 255 |
| allocated_amount | decimal(10,2) | NO | 0.00 |  |  |  |
| sort_order | int | NO | 0 |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| budget_categories_budget_id_foreign | budget_id | budgets | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| budget_categories_budget_id_name_unique | 0 | BTREE | budget_id, name |

---

### budget_entries

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| budget_id | bigint unsigned | NO |  |  | MUL |  |
| category_id | bigint unsigned | NO |  |  | MUL |  |
| date | date | NO |  |  |  |  |
| type | varchar(255) | NO |  |  |  | 255 |
| description | varchar(255) | YES |  |  |  | 255 |
| amount_ht | decimal(10,2) | NO | 0.00 |  |  |  |
| status | enum('facture','en_cours','paye','annule') | NO | en_cours |  |  | 8 |
| employee_id | bigint unsigned | YES |  |  | MUL |  |
| campaign_id | bigint unsigned | YES |  |  | MUL |  |
| created_by | bigint unsigned | YES |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| budget_entries_budget_id_foreign | budget_id | budgets | id |
| budget_entries_campaign_id_foreign | campaign_id | campaigns | id |
| budget_entries_category_id_foreign | category_id | budget_categories | id |
| budget_entries_created_by_foreign | created_by | users | id |
| budget_entries_employee_id_foreign | employee_id | employees | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| budget_entries_budget_id_foreign | 1 | BTREE | budget_id |
| budget_entries_category_id_foreign | 1 | BTREE | category_id |
| budget_entries_employee_id_foreign | 1 | BTREE | employee_id |
| budget_entries_campaign_id_foreign | 1 | BTREE | campaign_id |
| budget_entries_created_by_foreign | 1 | BTREE | created_by |

---

### budgets

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| title | varchar(255) | NO |  |  |  | 255 |
| period_start | date | NO |  |  |  |  |
| period_end | date | NO |  |  |  |  |
| currency | char(3) | NO | EUR |  |  | 3 |
| created_by | bigint unsigned | YES |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| budgets_created_by_foreign | created_by | users | id |
| budgets_entreprise_id_foreign | entreprise_id | entreprises | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| budgets_created_by_foreign | 1 | BTREE | created_by |
| budgets_entreprise_id_period_start_period_end_index | 1 | BTREE | entreprise_id, period_start, period_end |

---

### cache

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| key | varchar(255) | NO |  |  | PRI | 255 |
| value | mediumtext | NO |  |  |  | 16777215 |
| expiration | int | NO |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | key |

---

### cache_locks

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| key | varchar(255) | NO |  |  | PRI | 255 |
| owner | varchar(255) | NO |  |  |  | 255 |
| expiration | int | NO |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | key |

---

### campaign_budget_lines

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| campaign_id | bigint unsigned | NO |  |  | MUL |  |
| category | enum('participant','animation','support','communication','autre') | NO |  |  |  | 13 |
| cost_type | enum('fixed','per_participant') | NO |  |  |  | 15 |
| description | varchar(255) | YES |  |  |  | 255 |
| unit_cost | decimal(10,2) | NO | 0.00 |  |  |  |
| quantity | int | NO | 1 |  |  |  |
| vat_rate | decimal(5,2) | NO | 0.00 |  |  |  |
| sort_order | int | NO | 0 |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| campaign_budget_lines_campaign_id_foreign | campaign_id | campaigns | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| campaign_budget_lines_campaign_id_foreign | 1 | BTREE | campaign_id |

---

### campaign_participants

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| campaign_id | bigint unsigned | NO |  |  | PRI |  |
| employee_id | bigint unsigned | NO |  |  | PRI |  |
| joined_at | timestamp | YES |  |  |  |  |
| status | enum('invited','joined','completed','withdrawn') | NO | invited |  |  | 9 |
| progress | int unsigned | NO | 0 |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| campaign_participants_campaign_id_foreign | campaign_id | campaigns | id |
| campaign_participants_employee_id_foreign | employee_id | employees | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | campaign_id, employee_id |
| campaign_participants_employee_id_foreign | 1 | BTREE | employee_id |

---

### campaign_targets

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| campaign_id | bigint unsigned | NO |  |  | MUL |  |
| site_id | bigint unsigned | YES |  |  | MUL |  |
| criterion | varchar(255) | YES |  |  |  | 255 |
| value | varchar(255) | YES |  |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| campaign_targets_campaign_id_foreign | campaign_id | campaigns | id |
| campaign_targets_site_id_foreign | site_id | sites | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| campaign_targets_campaign_id_foreign | 1 | BTREE | campaign_id |
| campaign_targets_site_id_foreign | 1 | BTREE | site_id |

---

### campaign_themes

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| name | varchar(255) | NO |  |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| campaign_themes_entreprise_id_foreign | entreprise_id | entreprises | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| campaign_themes_entreprise_id_name_unique | 0 | BTREE | entreprise_id, name |

---

### campaigns

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| type | enum('defi','atelier','sondage','information') | NO |  |  |  | 11 |
| title | varchar(255) | NO |  |  |  | 255 |
| description | text | YES |  |  |  | 65535 |
| theme_id | bigint unsigned | NO |  |  | MUL |  |
| start_date | date | YES |  |  |  |  |
| end_date | date | YES |  |  |  |  |
| status | enum('scheduled','active','completed','cancelled') | NO | scheduled |  |  | 9 |
| responsible_hr_user_id | bigint unsigned | YES |  |  | MUL |  |
| budget_estimated_total | decimal(10,2) | YES |  |  |  |  |
| participants_planned | int | YES |  |  |  |  |
| created_by | bigint unsigned | YES |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| campaigns_created_by_foreign | created_by | users | id |
| campaigns_entreprise_id_foreign | entreprise_id | entreprises | id |
| campaigns_responsible_hr_user_id_foreign | responsible_hr_user_id | users | id |
| campaigns_theme_id_foreign | theme_id | campaign_themes | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| campaigns_theme_id_foreign | 1 | BTREE | theme_id |
| campaigns_responsible_hr_user_id_foreign | 1 | BTREE | responsible_hr_user_id |
| campaigns_created_by_foreign | 1 | BTREE | created_by |
| campaigns_entreprise_id_status_index | 1 | BTREE | entreprise_id, status |

---

### challenge_user

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| user_id | bigint unsigned | NO |  |  | MUL |  |
| challenge_id | bigint unsigned | NO |  |  | MUL |  |
| completed_at | timestamp | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| challenge_user_challenge_id_foreign | challenge_id | challenges | id |
| challenge_user_user_id_foreign | user_id | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| challenge_user_user_id_foreign | 1 | BTREE | user_id |
| challenge_user_challenge_id_foreign | 1 | BTREE | challenge_id |

---

### challenges

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| title | varchar(255) | NO |  |  |  | 255 |
| description | text | YES |  |  |  | 65535 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### chat_messages

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| room_id | varchar(255) | NO |  |  | MUL | 255 |
| sender_id | varchar(255) | YES |  |  | MUL | 255 |
| role | varchar(32) | YES |  |  |  | 32 |
| text | text | YES |  |  |  | 65535 |
| is_file | tinyint(1) | NO | 0 |  |  |  |
| file_name | varchar(255) | YES |  |  |  | 255 |
| file_mime | varchar(255) | YES |  |  |  | 255 |
| file_size | int | YES |  |  |  |  |
| file_url | text | YES |  |  |  | 65535 |
| ts | bigint | YES |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| chat_messages_room_id_index | 1 | BTREE | room_id |
| chat_messages_sender_id_index | 1 | BTREE | sender_id |
| chat_messages_ts_index | 1 | BTREE | ts |

---

### consultations

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| appointment_id | bigint unsigned | NO |  |  | UNI |  |
| practitioner_id | bigint unsigned | NO |  |  | MUL |  |
| employee_id | bigint unsigned | NO |  |  | MUL |  |
| summary | text | YES |  |  |  | 65535 |
| diagnosis | text | YES |  |  |  | 65535 |
| recommendations | text | YES |  |  |  | 65535 |
| attachments | json | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| consultations_appointment_id_foreign | appointment_id | appointments | id |
| consultations_employee_id_foreign | employee_id | employees | id |
| consultations_practitioner_id_foreign | practitioner_id | practitioners | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| consultations_appointment_id_unique | 0 | BTREE | appointment_id |
| consultations_practitioner_id_foreign | 1 | BTREE | practitioner_id |
| consultations_employee_id_foreign | 1 | BTREE | employee_id |

---

### content_reads

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| content_id | bigint unsigned | NO |  |  | MUL |  |
| user_id | bigint unsigned | NO |  |  |  |  |
| read_at | timestamp | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| content_reads_content_id_user_id_unique | 0 | BTREE | content_id, user_id |

---

### contents

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| praticien_id | bigint unsigned | NO |  |  | MUL |  |
| employee_id | bigint unsigned | YES |  |  | MUL |  |
| title | varchar(255) | NO |  |  |  | 255 |
| type | varchar(255) | YES |  |  |  | 255 |
| status | varchar(255) | NO | draft |  |  | 255 |
| description | text | YES |  |  |  | 65535 |
| views | int unsigned | NO | 0 |  |  |  |
| recommended_count | int unsigned | NO | 0 |  |  |  |
| last_recommended_at | timestamp | YES |  |  |  |  |
| last_recommended_message | text | YES |  |  |  | 65535 |
| created_by | bigint unsigned | YES |  |  |  |  |
| updated_by | bigint unsigned | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| contents_employee_id_foreign | employee_id | employees | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| contents_praticien_id_index | 1 | BTREE | praticien_id |
| contents_employee_id_foreign | 1 | BTREE | employee_id |

---

### diagnostics

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| user_id | bigint unsigned | NO |  |  | MUL |  |
| scope | varchar(20) | NO | quick |  |  | 20 |
| stress_level | tinyint unsigned | NO |  |  |  |  |
| energy_level | tinyint unsigned | NO |  |  |  |  |
| work_pressure | varchar(255) | NO |  |  |  | 255 |
| answers | json | YES |  |  |  |  |
| completed_at | timestamp | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| diagnostics_user_id_foreign | user_id | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| diagnostics_user_id_scope_completed_at_index | 1 | BTREE | user_id, scope, completed_at |

---

### employee_risk_assessments

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| employee_id | bigint unsigned | NO |  |  | MUL |  |
| level | enum('stable','a_surveiller','risque_eleve') | NO | stable |  |  | 12 |
| score | int unsigned | YES |  |  |  |  |
| reason | text | YES |  |  |  | 65535 |
| evaluated_at | timestamp | YES |  |  |  |  |
| created_by | bigint unsigned | NO |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| employee_risk_assessments_created_by_foreign | created_by | users | id |
| employee_risk_assessments_employee_id_foreign | employee_id | employees | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| employee_risk_assessments_employee_id_foreign | 1 | BTREE | employee_id |
| employee_risk_assessments_created_by_foreign | 1 | BTREE | created_by |

---

### employee_tags

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| employee_id | bigint unsigned | NO |  |  | PRI |  |
| tag_id | bigint unsigned | NO |  |  | PRI |  |
| assigned_at | timestamp | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| employee_tags_employee_id_foreign | employee_id | employees | id |
| employee_tags_tag_id_foreign | tag_id | tags | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | employee_id, tag_id |
| employee_tags_tag_id_foreign | 1 | BTREE | tag_id |

---

### employees

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| user_id | bigint unsigned | NO |  |  | UNI |  |
| site_id | bigint unsigned | NO |  |  | MUL |  |
| employee_number | varchar(255) | YES |  |  |  | 255 |
| department | varchar(255) | YES |  |  |  | 255 |
| position_title | varchar(255) | YES |  |  |  | 255 |
| manager_id | bigint unsigned | YES |  |  | MUL |  |
| date_hired | date | YES |  |  |  |  |
| employment_status | enum('active','inactive','invited','on_leave','terminated') | NO | active |  |  | 10 |
| last_activity_at | timestamp | YES |  |  |  |  |
| current_risk_level | enum('stable','a_surveiller','risque_eleve') | NO | stable |  |  | 12 |
| current_risk_score | int unsigned | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |
| themes | json | YES |  |  |  |  |
| private_notes | text | YES |  |  |  | 65535 |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| employees_entreprise_id_foreign | entreprise_id | entreprises | id |
| employees_manager_id_foreign | manager_id | employees | id |
| employees_site_id_foreign | site_id | sites | id |
| employees_user_id_foreign | user_id | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| employees_user_id_unique | 0 | BTREE | user_id |
| employees_entreprise_id_foreign | 1 | BTREE | entreprise_id |
| employees_site_id_foreign | 1 | BTREE | site_id |
| employees_manager_id_foreign | 1 | BTREE | manager_id |

---

### engagement_events

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| employee_id | bigint unsigned | NO |  |  | MUL |  |
| event_type | varchar(255) | NO |  |  |  | 255 |
| occurred_at | timestamp | NO | CURRENT_TIMESTAMP | DEFAULT_GENERATED |  |  |
| site_id | bigint unsigned | YES |  |  | MUL |  |
| campaign_id | bigint unsigned | YES |  |  | MUL |  |
| meta | json | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| engagement_events_campaign_id_foreign | campaign_id | campaigns | id |
| engagement_events_employee_id_foreign | employee_id | employees | id |
| engagement_events_entreprise_id_foreign | entreprise_id | entreprises | id |
| engagement_events_site_id_foreign | site_id | sites | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| engagement_events_site_id_foreign | 1 | BTREE | site_id |
| engagement_events_campaign_id_foreign | 1 | BTREE | campaign_id |
| engagement_events_entreprise_id_occurred_at_index | 1 | BTREE | entreprise_id, occurred_at |
| engagement_events_employee_id_occurred_at_index | 1 | BTREE | employee_id, occurred_at |

---

### entreprises

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| name | varchar(255) | NO |  |  | UNI | 255 |
| domain | varchar(255) | YES |  |  |  | 255 |
| is_active | tinyint(1) | NO | 1 |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| entreprises_name_unique | 0 | BTREE | name |

---

### failed_jobs

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| uuid | varchar(255) | NO |  |  | UNI | 255 |
| connection | text | NO |  |  |  | 65535 |
| queue | text | NO |  |  |  | 65535 |
| payload | longtext | NO |  |  |  | 4294967295 |
| exception | longtext | NO |  |  |  | 4294967295 |
| failed_at | timestamp | NO | CURRENT_TIMESTAMP | DEFAULT_GENERATED |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| failed_jobs_uuid_unique | 0 | BTREE | uuid |

---

### health_metrics

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| week_start_date | date | NO |  |  |  |  |
| week_end_date | date | NO |  |  |  |  |
| stress_value | decimal(5,2) | YES |  |  |  |  |
| attention_value | decimal(5,2) | YES |  |  |  |  |
| energy_value | decimal(5,2) | YES |  |  |  |  |
| sleep_value | decimal(5,2) | YES |  |  |  |  |
| physical_fitness_value | decimal(5,2) | YES |  |  |  |  |
| created_at | timestamp | YES | CURRENT_TIMESTAMP | DEFAULT_GENERATED |  |  |
| updated_at | timestamp | YES | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### job_batches

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | varchar(255) | NO |  |  | PRI | 255 |
| name | varchar(255) | NO |  |  |  | 255 |
| total_jobs | int | NO |  |  |  |  |
| pending_jobs | int | NO |  |  |  |  |
| failed_jobs | int | NO |  |  |  |  |
| failed_job_ids | longtext | NO |  |  |  | 4294967295 |
| options | mediumtext | YES |  |  |  | 16777215 |
| cancelled_at | int | YES |  |  |  |  |
| created_at | int | NO |  |  |  |  |
| finished_at | int | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### jobs

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| queue | varchar(255) | NO |  |  | MUL | 255 |
| payload | longtext | NO |  |  |  | 4294967295 |
| attempts | tinyint unsigned | NO |  |  |  |  |
| reserved_at | int unsigned | YES |  |  |  |  |
| available_at | int unsigned | NO |  |  |  |  |
| created_at | int unsigned | NO |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| jobs_queue_index | 1 | BTREE | queue |

---

### kpi_absenteeism_costs

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| absenteeism_costs_eur | int | YES |  |  |  |  |
| total_annual_cost_eur | int | YES |  |  |  |  |
| replacements_eur | int | YES |  |  |  |  |
| productivity_loss_eur | int | YES |  |  |  |  |
| potential_savings_eur | int | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### kpi_demography

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| age_range | varchar(20) | NO |  |  |  | 20 |
| risk_type | varchar(50) | NO |  |  |  | 50 |
| people_percent | decimal(4,2) | NO |  |  |  |  |
| recommendation | varchar(100) | YES |  |  |  | 100 |
| expected_impact | varchar(50) | YES |  |  |  | 50 |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### kpi_demography_forecast

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| indicator | varchar(50) | NO |  |  |  | 50 |
| value_percent | decimal(5,2) | YES |  |  |  |  |
| type | varchar(50) | YES |  |  |  | 50 |
| amount_eur | int | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### kpi_monthly_evolution

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| month | varchar(10) | NO |  |  |  | 10 |
| value_percent | decimal(4,2) | YES |  |  |  |  |
| target_percent | decimal(4,2) | YES |  |  |  |  |
| difference_percent | decimal(4,2) | YES |  |  |  |  |
| status | varchar(20) | YES |  |  |  | 20 |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### kpi_productivity

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| indicator | varchar(50) | NO |  |  |  | 50 |
| status | varchar(20) | YES |  |  |  | 20 |
| percentage | decimal(4,2) | NO |  |  |  |  |
| variation_percent | decimal(4,2) | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### kpi_turnover

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| department | varchar(50) | NO |  |  |  | 50 |
| turnover_percent | decimal(4,2) | NO |  |  |  |  |
| cost_per_departure_eur | int | NO |  |  |  |  |
| prevention_percent | decimal(4,2) | NO |  |  |  |  |
| savings_eur | int | NO |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### login_otps

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| user_id | bigint unsigned | NO |  |  | MUL |  |
| code | varchar(5) | NO |  |  |  | 5 |
| expires_at | datetime | NO |  |  |  |  |
| consumed_at | datetime | YES |  |  |  |  |
| attempts | tinyint unsigned | NO | 0 |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| login_otps_user_id_foreign | user_id | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| login_otps_user_id_expires_at_index | 1 | BTREE | user_id, expires_at |

---

### migrations

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int unsigned | NO |  | auto_increment | PRI |  |
| migration | varchar(255) | NO |  |  |  | 255 |
| batch | int | NO |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### mood_entries

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| employee_id | bigint unsigned | NO |  |  | MUL |  |
| date | date | NO |  |  |  |  |
| mood_score | tinyint unsigned | NO | 5 |  |  |  |
| note | varchar(255) | YES |  |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |
| details | text | YES |  |  |  | 65535 |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| mood_entries_employee_id_foreign | employee_id | employees | id |
| mood_entries_entreprise_id_foreign | entreprise_id | entreprises | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| mood_entries_employee_id_date_unique | 0 | BTREE | employee_id, date |
| mood_entries_entreprise_id_foreign | 1 | BTREE | entreprise_id |

---

### password_reset_tokens

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| email | varchar(255) | NO |  |  | PRI | 255 |
| token | varchar(255) | NO |  |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | email |

---

### performances

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| user_id | bigint | NO |  |  | MUL |  |
| year | year | NO |  |  |  |  |
| month | tinyint | NO |  |  |  |  |
| performance | decimal(2,1) | NO |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| user_id | 0 | BTREE | user_id, year, month |

---

### personal_access_tokens

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| tokenable_type | varchar(255) | NO |  |  | MUL | 255 |
| tokenable_id | bigint unsigned | NO |  |  |  |  |
| name | text | NO |  |  |  | 65535 |
| token | varchar(64) | NO |  |  | UNI | 64 |
| abilities | text | YES |  |  |  | 65535 |
| last_used_at | timestamp | YES |  |  |  |  |
| expires_at | timestamp | YES |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| personal_access_tokens_token_unique | 0 | BTREE | token |
| personal_access_tokens_tokenable_type_tokenable_id_index | 1 | BTREE | tokenable_type, tokenable_id |
| personal_access_tokens_expires_at_index | 1 | BTREE | expires_at |

---

### practitioner_availability_rules

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| practitioner_id | bigint unsigned | NO |  |  | MUL |  |
| site_id | bigint unsigned | YES |  |  | MUL |  |
| mode | enum('presentiel','teleconsultation') | NO |  |  |  | 16 |
| day_of_week | tinyint | NO |  |  |  |  |
| start_time | time | NO |  |  |  |  |
| end_time | time | NO |  |  |  |  |
| slot_duration_minutes | smallint | NO | 30 |  |  |  |
| capacity | smallint | NO | 1 |  |  |  |
| starts_on | date | YES |  |  |  |  |
| ends_on | date | YES |  |  |  |  |
| timezone | varchar(255) | NO | Europe/Paris |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| practitioner_availability_rules_entreprise_id_foreign | entreprise_id | entreprises | id |
| practitioner_availability_rules_practitioner_id_foreign | practitioner_id | practitioners | id |
| practitioner_availability_rules_site_id_foreign | site_id | sites | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| practitioner_availability_rules_entreprise_id_foreign | 1 | BTREE | entreprise_id |
| practitioner_availability_rules_site_id_foreign | 1 | BTREE | site_id |
| pract_avail_idx | 1 | BTREE | practitioner_id, day_of_week |

---

### practitioner_services

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| practitioner_id | bigint unsigned | NO |  |  | MUL |  |
| service_id | bigint unsigned | NO |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| practitioner_services_practitioner_id_foreign | practitioner_id | practitioners | id |
| practitioner_services_service_id_foreign | service_id | services | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| practitioner_services_practitioner_id_index | 1 | BTREE | practitioner_id |
| practitioner_services_service_id_index | 1 | BTREE | service_id |

---

### practitioner_sites

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| practitioner_id | bigint unsigned | NO |  |  | MUL |  |
| site_id | bigint unsigned | NO |  |  | MUL |  |
| mode | enum('presentiel','teleconsultation','both') | NO | both |  |  | 16 |
| room | varchar(255) | YES |  |  |  | 255 |
| is_primary | tinyint(1) | NO | 0 |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| practitioner_sites_entreprise_id_foreign | entreprise_id | entreprises | id |
| practitioner_sites_practitioner_id_foreign | practitioner_id | practitioners | id |
| practitioner_sites_site_id_foreign | site_id | sites | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| practitioner_sites_practitioner_id_site_id_unique | 0 | BTREE | practitioner_id, site_id |
| practitioner_sites_entreprise_id_foreign | 1 | BTREE | entreprise_id |
| practitioner_sites_site_id_foreign | 1 | BTREE | site_id |

---

### practitioner_time_offs

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| practitioner_id | bigint unsigned | NO |  |  | MUL |  |
| site_id | bigint unsigned | YES |  |  | MUL |  |
| starts_at | datetime | NO |  |  |  |  |
| ends_at | datetime | NO |  |  |  |  |
| reason | varchar(255) | YES |  |  |  | 255 |
| created_by | bigint unsigned | NO |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| practitioner_time_offs_created_by_foreign | created_by | users | id |
| practitioner_time_offs_entreprise_id_foreign | entreprise_id | entreprises | id |
| practitioner_time_offs_practitioner_id_foreign | practitioner_id | practitioners | id |
| practitioner_time_offs_site_id_foreign | site_id | sites | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| practitioner_time_offs_entreprise_id_foreign | 1 | BTREE | entreprise_id |
| practitioner_time_offs_site_id_foreign | 1 | BTREE | site_id |
| practitioner_time_offs_created_by_foreign | 1 | BTREE | created_by |
| practitioner_time_offs_practitioner_id_starts_at_index | 1 | BTREE | practitioner_id, starts_at |

---

### practitioners

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| user_id | bigint unsigned | NO |  |  | UNI |  |
| specialty | varchar(255) | YES |  |  |  | 255 |
| license_number | varchar(255) | YES |  |  |  | 255 |
| bio | text | YES |  |  |  | 65535 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| practitioners_entreprise_id_foreign | entreprise_id | entreprises | id |
| practitioners_user_id_foreign | user_id | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| practitioners_user_id_unique | 0 | BTREE | user_id |
| practitioners_entreprise_id_foreign | 1 | BTREE | entreprise_id |

---

### praticiens

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| first_name | varchar(255) | NO |  |  |  | 255 |
| last_name | varchar(255) | NO |  |  |  | 255 |
| speciality | enum('psychologue du travail','medecin du travail','coach de bien-être','thérapeute') | NO | psychologue du travail |  |  | 22 |
| user_id | bigint unsigned | NO |  |  | MUL |  |
| phone | varchar(255) | NO |  |  |  | 255 |
| country | varchar(255) | NO |  |  |  | 255 |
| city | varchar(255) | NO |  |  |  | 255 |
| postal_code | varchar(255) | NO |  |  |  | 255 |
| address | text | NO |  |  |  | 65535 |
| consultation_mode | enum('presentiel','teleconsultation','both') | NO |  |  |  | 16 |
| min_price | decimal(8,2) | YES |  |  |  |  |
| max_price | decimal(8,2) | YES |  |  |  |  |
| website | varchar(255) | YES |  |  |  | 255 |
| linkedin | varchar(255) | YES |  |  |  | 255 |
| rpps_number | varchar(255) | YES |  |  | UNI | 255 |
| siret_number | varchar(255) | YES |  |  |  | 255 |
| payment_methods | json | YES |  |  |  |  |
| accepts_new_patients | tinyint(1) | NO | 1 |  |  |  |
| emergency_consultations | tinyint(1) | NO | 0 |  |  |  |
| availability | text | YES |  |  |  | 65535 |
| languages | json | YES |  |  |  |  |
| specializations | json | YES |  |  |  |  |
| bio | text | YES |  |  |  | 65535 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| praticiens_user_id_foreign | user_id | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| praticiens_rpps_number_unique | 0 | BTREE | rpps_number |
| praticiens_user_id_foreign | 1 | BTREE | user_id |

---

### predictive_analytics

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| risk_type | varchar(50) | NO |  |  |  | 50 |
| prediction_reliability | decimal(5,2) | YES |  |  |  |  |
| current_risk_percent | decimal(5,2) | YES |  |  |  |  |
| forecast_3m_percent | decimal(5,2) | YES |  |  |  |  |
| forecast_6m_percent | decimal(5,2) | YES |  |  |  |  |
| forecast_12m_percent | decimal(5,2) | YES |  |  |  |  |
| people_at_risk | int | YES |  |  |  |  |
| estimated_cost_eur | int | YES |  |  |  |  |
| recommended_prevention | varchar(100) | YES |  |  |  | 100 |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### predictive_intervention_scenarios

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| period | enum('1-3 mois','3-6 mois','6-12 mois') | NO |  |  |  | 9 |
| investment_eur | int | NO |  |  |  |  |
| risk_reduction_percent | decimal(5,2) | NO |  |  |  |  |
| actions_included | varchar(255) | YES |  |  |  | 255 |
| roi_percent | decimal(5,2) | NO |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### predictive_timeline

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| month | varchar(10) | NO |  |  |  | 10 |
| stress_percent | decimal(5,2) | YES |  |  |  |  |
| turnover_count | int | YES |  |  |  |  |
| accidents_percent | decimal(5,2) | YES |  |  |  |  |
| engagement_percent | decimal(5,2) | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### roi_scores

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| group_name | varchar(50) | NO |  |  |  | 50 |
| participants | int | NO |  |  |  |  |
| duration_weeks | int | NO |  |  |  |  |
| savings_eur | int | NO |  |  |  |  |
| back_pain_before | int | YES |  |  |  |  |
| back_pain_after | int | YES |  |  |  |  |
| back_pain_improvement | int | YES |  |  |  |  |
| fatigue_before | int | YES |  |  |  |  |
| fatigue_after | int | YES |  |  |  |  |
| fatigue_improvement | int | YES |  |  |  |  |
| productivity_before | int | YES |  |  |  |  |
| productivity_after | int | YES |  |  |  |  |
| productivity_improvement | int | YES |  |  |  |  |
| anxiety_before | int | YES |  |  |  |  |
| anxiety_after | int | YES |  |  |  |  |
| anxiety_improvement | int | YES |  |  |  |  |
| wellbeing_before | int | YES |  |  |  |  |
| wellbeing_after | int | YES |  |  |  |  |
| wellbeing_improvement | int | YES |  |  |  |  |
| team_relations_before | int | YES |  |  |  |  |
| team_relations_after | int | YES |  |  |  |  |
| team_relations_improvement | int | YES |  |  |  |  |
| stress_before | int | YES |  |  |  |  |
| stress_after | int | YES |  |  |  |  |
| stress_improvement | int | YES |  |  |  |  |
| performance_before | int | YES |  |  |  |  |
| performance_after | int | YES |  |  |  |  |
| performance_improvement | int | YES |  |  |  |  |
| customer_satisfaction_before | int | YES |  |  |  |  |
| customer_satisfaction_after | int | YES |  |  |  |  |
| customer_satisfaction_improvement | int | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### roles

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| code | varchar(255) | NO |  |  | UNI | 255 |
| label | varchar(255) | NO |  |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| roles_code_unique | 0 | BTREE | code |

---

### services

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| name | varchar(255) | NO |  |  |  | 255 |
| description | text | YES |  |  |  | 65535 |
| price_cents | int unsigned | NO | 0 |  |  |  |
| duration_minutes | int unsigned | YES |  |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

### sessions

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | varchar(255) | NO |  |  | PRI | 255 |
| user_id | bigint unsigned | YES |  |  | MUL |  |
| ip_address | varchar(45) | YES |  |  |  | 45 |
| user_agent | text | YES |  |  |  | 65535 |
| payload | longtext | NO |  |  |  | 4294967295 |
| last_activity | int | NO |  |  | MUL |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| sessions_user_id_index | 1 | BTREE | user_id |
| sessions_last_activity_index | 1 | BTREE | last_activity |

---

### sites

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| name | varchar(255) | NO |  |  |  | 255 |
| code | varchar(255) | YES |  |  |  | 255 |
| type | enum('site','clinic','virtual') | NO |  |  |  | 7 |
| address_line1 | varchar(255) | YES |  |  |  | 255 |
| address_line2 | varchar(255) | YES |  |  |  | 255 |
| city | varchar(255) | YES |  |  |  | 255 |
| postal_code | varchar(255) | YES |  |  |  | 255 |
| country | varchar(255) | NO | France |  |  | 255 |
| timezone | varchar(255) | NO | Europe/Paris |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| sites_entreprise_id_foreign | entreprise_id | entreprises | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| sites_entreprise_id_name_unique | 0 | BTREE | entreprise_id, name |
| sites_entreprise_id_code_unique | 0 | BTREE | entreprise_id, code |

---

### tags

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | NO |  |  | MUL |  |
| name | varchar(255) | NO |  |  |  | 255 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| tags_entreprise_id_foreign | entreprise_id | entreprises | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| tags_entreprise_id_name_unique | 0 | BTREE | entreprise_id, name |

---

### teleconsultation_sessions

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| appointment_id | bigint unsigned | NO |  |  | UNI |  |
| provider | varchar(255) | NO |  |  |  | 255 |
| join_url | varchar(255) | NO |  |  |  | 255 |
| start_url | varchar(255) | YES |  |  |  | 255 |
| room_code | varchar(255) | YES |  |  |  | 255 |
| expires_at | timestamp | YES |  |  |  |  |
| status | enum('scheduled','started','ended','cancelled') | NO | scheduled |  |  | 9 |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| teleconsultation_sessions_appointment_id_foreign | appointment_id | appointments | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| teleconsultation_sessions_appointment_id_unique | 0 | BTREE | appointment_id |

---

### user_roles

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| user_id | bigint unsigned | NO |  |  | MUL |  |
| role_id | bigint unsigned | NO |  |  | MUL |  |
| entreprise_id | bigint unsigned | YES |  |  | MUL |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| user_roles_entreprise_id_foreign | entreprise_id | entreprises | id |
| user_roles_role_id_foreign | role_id | roles | id |
| user_roles_user_id_foreign | user_id | users | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| user_roles_user_id_role_id_entreprise_id_unique | 0 | BTREE | user_id, role_id, entreprise_id |
| user_roles_role_id_foreign | 1 | BTREE | role_id |
| user_roles_entreprise_id_foreign | 1 | BTREE | entreprise_id |

---

### users

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | bigint unsigned | NO |  | auto_increment | PRI |  |
| entreprise_id | bigint unsigned | YES |  |  | MUL |  |
| email | varchar(255) | NO |  |  |  | 255 |
| phone | varchar(255) | YES |  |  |  | 255 |
| password_hash | varchar(255) | YES |  |  |  | 255 |
| first_name | varchar(255) | YES |  |  |  | 255 |
| last_name | varchar(255) | YES |  |  |  | 255 |
| is_active | tinyint(1) | NO | 1 |  |  |  |
| created_at | timestamp | YES |  |  |  |  |
| updated_at | timestamp | YES |  |  |  |  |
| name | varchar(255) | YES |  |  |  | 255 |
| email_verified_at | timestamp | YES |  |  |  |  |
| password | varchar(255) | YES |  |  |  | 255 |
| role | enum('admin','practitioner','enterprise') | NO | practitioner |  |  | 12 |
| remember_token | varchar(100) | YES |  |  |  | 100 |
| birth_date | date | YES |  |  |  |  |
| gender | enum('male','female','other','prefer_not_to_say') | YES |  |  |  | 17 |
| bio | text | YES |  |  |  | 65535 |
| avatar | varchar(255) | YES |  |  |  | 255 |
| preferences | json | YES |  |  |  |  |
| health_goals | json | YES |  |  |  |  |
| status | enum('active','inactive','suspended') | NO | active |  |  | 9 |
| last_login_at | timestamp | YES |  |  |  |  |
| google_id | varchar(255) | YES |  |  | UNI | 255 |
| provider | varchar(255) | YES |  |  |  | 255 |
| avatar_url | varchar(255) | YES |  |  |  | 255 |
| role_id | bigint unsigned | YES |  |  | MUL |  |

**Clés étrangères**:

| Constraint | Colonne | Table référencée | Colonne référencée |
|---|---|---|---|
| users_entreprise_id_foreign | entreprise_id | entreprises | id |
| users_role_id_foreign | role_id | roles | id |

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |
| users_entreprise_id_email_unique | 0 | BTREE | entreprise_id, email |
| users_google_id_unique | 0 | BTREE | google_id |
| users_role_id_foreign | 1 | BTREE | role_id |

---

### wellbeing_insights

**Colonnes**:

| Nom | Type | Null | Défaut | Extra | Key | Longueur |
|---|---:|:---:|---|---|---:|
| id | int | NO |  | auto_increment | PRI |  |
| objective | varchar(100) | YES |  |  |  | 100 |
| progress_percent | decimal(5,2) | YES |  |  |  |  |
| status | varchar(20) | YES |  |  |  | 20 |
| days_remaining | int | YES |  |  |  |  |
| team_challenge | varchar(100) | YES |  |  |  | 100 |
| team_progress_percent | decimal(5,2) | YES |  |  |  |  |
| team_status | varchar(20) | YES |  |  |  | 20 |
| participants_count | int | YES |  |  |  |  |

**Clés étrangères**:

Aucune clé étrangère déclarée.

**Indexes**:

| Nom | Non unique | Type | Colonnes |
|---|---:|---|---|
| PRIMARY | 0 | BTREE | id |

---

