# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b1615d22-1769-4c00-8331-bce0d49f4c4f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b1615d22-1769-4c00-8331-bce0d49f4c4f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b1615d22-1769-4c00-8331-bce0d49f4c4f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Email verification branding (uConstruct)

1. Configure SMTP in Supabase: Auth > Email (SMTP) with your domain (e.g., no-reply@uconstruct.com). Ensure SPF/DKIM are set on your DNS.
2. Customize the "Confirm signup" template in Auth > Templates. Keep the {{ .ConfirmationURL }} placeholder and brand the subject/body (e.g., "Confirm your email for uConstruct").
3. Set Auth > URL Configuration: Site URL and Redirect URLs to your app URL so confirmations redirect to uConstruct.
4. If a user didn’t receive it, use the "Resend verification email" link now available on the Auth page.

## Site Visit / Compliance Blitz – API Contract (Phase 1)

DRAFT – For implementation reference once backend migration is applied.

### Entities
- `site_visit`
- `site_visit_checklist_response`
- `whs_assessment`, `whs_breach`
- `delegate_assessment`, `delegate_role_rating`
- `entitlements_audit`, `entitlement_breach`, `entitlement_issue`
- `dd_conversion_attempt`
- `site_visit_eba_snapshot`
- `site_visit_roster_snapshot`, `site_visit_roster_worker`
- `visit_compliance_summary`
- `site_visit_task`, `site_visit_attachment`

### Common
- All inserts accept optional `client_generated_id` where present to support idempotent upserts.
- RLS: Organisers/Lead Organisers can access visits for job sites/employers they can access; Admins bypass.

### site_visit
- Create
```ts
// DRAFT – DO NOT APPLY
const { data, error } = await supabase.from('site_visit').insert({
  employer_id,
  job_site_id,
  scheduled_at,
  objective,
  sv_code, // short code you generate client-side or via RPC (future)
  estimated_workers_count,
}).select('*').single();
```
- List
```ts
// DRAFT – DO NOT APPLY
const { data } = await supabase
  .from('site_visit')
  .select('*')
  .eq('status_code', 'draft_prep')
  .order('created_at', { ascending: false });
```
- Update (optimistic concurrency)
```ts
// DRAFT – DO NOT APPLY
const { data, error } = await supabase
  .from('site_visit')
  .update({ objective, estimated_workers_count, version: currentVersion + 1 })
  .eq('id', siteVisitId)
  .eq('version', currentVersion)
  .select('*');
```

### Checklist responses
```ts
// DRAFT – DO NOT APPLY
await supabase.from('site_visit_checklist_response').upsert({
  site_visit_id,
  checklist_item_code: 'roe_email_sent',
  response_option_code: 'yes',
  comment
}, { onConflict: 'site_visit_id,checklist_item_code' });
```

### WHS assessment & breaches
```ts
// DRAFT – DO NOT APPLY
await supabase.from('whs_assessment').upsert({
  site_visit_id,
  rating_code: '3',
  notes
}, { onConflict: 'site_visit_id' });

await supabase.from('whs_breach').insert({
  whs_assessment_id,
  title,
  rating_code: '2',
  notes,
});
```

### Entitlements audit & breaches
```ts
// DRAFT – DO NOT APPLY
await supabase.from('entitlements_audit').upsert({
  site_visit_id,
  sample_size,
  super_paid,
  super_paid_to_fund,
  redundancy_contributions_up_to_date,
  eba_allowances_correct,
  wages_correct,
}, { onConflict: 'site_visit_id' });

await supabase.from('entitlement_breach').insert({
  entitlements_audit_id,
  category_code_v2: 'wages', // 'super'|'redundancy'|'wages'|'allowances'
  title,
  rating_code: '2',
  notes,
});
```

### Delegate
```ts
// DRAFT – DO NOT APPLY
const { data: da } = await supabase.from('delegate_assessment').insert({ site_visit_id, present: true }).select('id').single();
await supabase.from('delegate_role_rating').upsert({
  delegate_assessment_id: da.id,
  role_type_code: 'communication',
  rating_code: '3',
}, { onConflict: 'delegate_assessment_id,role_type_code' });
```

### DD conversion attempts
```ts
// DRAFT – DO NOT APPLY
await supabase.from('dd_conversion_attempt').insert({
  site_visit_id,
  worker_id,
  method_code: 'in_person',
  outcome_code: 'converted',
  client_generated_id,
});
```

### Roster snapshot
```ts
// DRAFT – DO NOT APPLY
await supabase.from('site_visit_roster_snapshot').upsert({
  site_visit_id,
  generated_from_source,
  total_workers
}, { onConflict: 'site_visit_id' });

await supabase.from('site_visit_roster_worker').insert({
  roster_snapshot_id,
  worker_id,
  present: true,
});
```

### Compliance summary
```ts
// DRAFT – DO NOT APPLY
await supabase.from('visit_compliance_summary').upsert({
  site_visit_id,
  overall_score,
  classification_code,
  category_scores_json,
  triggered_rules
}, { onConflict: 'site_visit_id' });
```

### Tasks & attachments
```ts
// DRAFT – DO NOT APPLY
await supabase.from('site_visit_task').insert({
  site_visit_id,
  title,
  due_at,
});

await supabase.from('site_visit_attachment').insert({
  site_visit_id,
  category: 'photo',
  storage_path,
});
```
