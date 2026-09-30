export function maskNik(nik?: string | null): string {
if (!nik) return '-';
const clean = nik.replace(/\s+/g, '');
if (clean.length <= 4) return clean;
return 'X'.repeat(clean.length - 4) + clean.slice(-4);
}

export function maskPhone(phone?: string | null): string {
if (!phone) return '-';
const clean = phone.replace(/\s+/g, '');
if (clean.length <= 6) return clean;
return clean.slice(0, 4) + 'X'.repeat(clean.length - 8) + clean.slice(-4);
}

export function maskEmail(email?: string | null): string {
if (!email) return '-';
const [user, domain] = email.split('@');
if (!domain) return email;
const visible = user.slice(0, 2);
return visible + '***@' + domain;
}
