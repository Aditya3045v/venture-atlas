# VENTURE ATLAS — PRODUCTION OPERATIONS RUNBOOK

This runbook documents operational procedures for administering staff access, credentials, multi-factor authentication, disaster recovery, and cryptographic secret rotation.

---

## 1. Creating a New Staff Account

### Method A: Via Admin Portal UI (Recommended)
1. Navigate to `https://ventureatlas.io/admin/users` as an **ADMIN**.
2. Click **"New Staff Access Key"** (or **"+ Create User"**).
3. Provide:
   - **Full Name** (e.g. `Jane Doe`)
   - **Email Address** (e.g. `jane@ventureatlas.io`)
   - **Temporary Access Key / Password** (Minimum 12 characters, must include uppercase, lowercase, numbers/symbols).
   - **Role Assignment**: `WRITER`, `EDITOR`, or `ADMIN`.
4. Submit the form. The system will create the Supabase Auth user, seed their profile in `public.profiles`, and write a `CREATE_USER` entry in `public.audit_logs`.
5. Direct the new staff member to sign in at `https://ventureatlas.io/admin/login` and enroll their MFA authenticator application.

### Method B: Emergency CLI Provisioning
If the admin UI is inaccessible, run:
```bash
npx tsx --env-file=.env -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function create() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'newadmin@ventureatlas.io',
    password: 'ReplaceWithStrongSecurePassword123!',
    email_confirm: true,
  });
  if (error) throw error;
  await supabase.from('profiles').upsert({
    id: data.user.id,
    email: 'newadmin@ventureatlas.io',
    name: 'New Administrator',
    role: 'ADMIN',
  });
  console.log('Admin account provisioned:', data.user.id);
}
create();
"
```

---

## 2. Resetting a Staff Password

### Via Admin Portal
1. Navigate to `/admin/users`.
2. Locate the staff member and click **Edit / Reset Password**.
3. Enter a new compliant password (minimum 12 characters).
4. Save changes. The system updates the password via the Supabase Admin API and writes a `PASSWORD_RESET` entry to `audit_logs`.

---

## 3. Resetting MFA (TOTP) Factor for Locked Staff

If an Editor or Admin lost their TOTP authenticator device:
1. Navigate to `/admin/users` as an **ADMIN**.
2. Locate the target user and click **"Reset MFA"**.
3. Confirm the prompt. The API calls `POST /api/admin/mfa/reset`, removes all enrolled factors from Supabase Auth, clears recovery codes, and logs `MFA_RESET` in `audit_logs`.
4. Upon next login, the user will be presented with `/admin/mfa/enroll` to bind a new authenticator device.

---

## 4. Disaster Recovery: Full Admin Lockout Recovery

If all administrators are locked out or MFA devices are lost:
1. Open the [Supabase Web Dashboard](https://supabase.com/dashboard/project/fckmhqyhglfnqhpjzrvu).
2. Go to **Authentication $\rightarrow$ Users**.
3. Locate your admin email (e.g. `adityapoddarmain@gmail.com`).
4. Click **"..."** next to the user and choose **"Reset Password"** or **"Delete Factor"** under Multi-Factor Authentication.
5. Go to the **SQL Editor** in the Supabase Dashboard and run:
```sql
-- Ensure profile has ADMIN role
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'adityapoddarmain@gmail.com';

-- Verify the row
SELECT id, email, role FROM public.profiles WHERE email = 'adityapoddarmain@gmail.com';
```
6. Sign in directly at `/admin/login` and re-enroll MFA at `/admin/mfa/enroll`.

---

## 5. Rotating Cryptographic Secrets

### A. Rotating `SUPABASE_SERVICE_ROLE_KEY`
1. Navigate to the Supabase Dashboard $\rightarrow$ **Project Settings $\rightarrow$ API**.
2. Under **Project API keys**, click **"Generate new secret"** for the `service_role` key.
3. Update `SUPABASE_SERVICE_ROLE_KEY` in your production hosting environment (Vercel / Netlify / Cloudflare / Docker).
4. Trigger a production zero-downtime redeployment.
5. In Supabase Dashboard, revoke the old service role key once the new deployment is live and passing health checks (`/api/health`).

### B. Rotating `READER_COOKIE_SECRET`
1. Generate a new high-entropy 64-character secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
2. Update `READER_COOKIE_SECRET` in production environment variables.
3. Redeploy. Existing reader cookies (`va_reader`) will gracefully renew upon their next visit via `/api/reader/enter`.

---

## 6. Staff Role Permission Reference

| Role | Permissions | MFA Requirement |
| :--- | :--- | :--- |
| **WRITER** | Create and edit own drafts, manage own media. Cannot publish, delete, or view user management. | Optional / Recommended |
| **EDITOR** | Create, edit any article/blog/case study, publish and unpublish, moderate comments. Cannot manage staff roles. | **Mandatory (aal2)** |
| **ADMIN** | Full system control: user provisioning, role assignments, MFA reset, audit log inspection, content management. | **Mandatory (aal2)** |
