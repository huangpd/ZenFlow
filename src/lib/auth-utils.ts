export function isAdmin(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) {
    return false;
  }

  const adminEmails = adminEmailsEnv.split(',').map(e => e.trim());
  return adminEmails.includes(email);
}
