import { describe, it, expect } from 'vitest';
import { GUIDE_TOPICS, ROLE_METADATA } from '../data/userGuidesData';

describe('Basis Data Panduan Program (userGuidesData)', () => {
  it('harus memuat metadata untuk tiga peran utama: superuser, admin, dan staff', () => {
    expect(ROLE_METADATA.superuser).toBeDefined();
    expect(ROLE_METADATA.admin).toBeDefined();
    expect(ROLE_METADATA.staff).toBeDefined();

    expect(ROLE_METADATA.superuser.badgeName).toBe('SUPER USER');
    expect(ROLE_METADATA.admin.badgeName).toBe('ADMIN');
    expect(ROLE_METADATA.staff.badgeName).toBe('USER / STAFF');
  });

  it('harus memiliki topik panduan yang terdefinisi untuk masing-masing peran', () => {
    const superuserTopics = GUIDE_TOPICS.filter(
      (t) => t.targetRole === 'superuser' || t.targetRole === 'all'
    );
    const adminTopics = GUIDE_TOPICS.filter(
      (t) => t.targetRole === 'admin' || t.targetRole === 'all'
    );
    const staffTopics = GUIDE_TOPICS.filter(
      (t) => t.targetRole === 'staff' || t.targetRole === 'all'
    );

    expect(superuserTopics.length).toBeGreaterThan(2);
    expect(adminTopics.length).toBeGreaterThan(2);
    expect(staffTopics.length).toBeGreaterThan(2);
  });

  it('setiap topik wajib memiliki ID unik, judul, ringkasan, dan langkah-langkah implementasi', () => {
    const ids = new Set<string>();

    GUIDE_TOPICS.forEach((topic) => {
      expect(ids.has(topic.id)).toBe(false);
      ids.add(topic.id);

      expect(topic.title.trim().length).toBeGreaterThan(0);
      expect(topic.summary.trim().length).toBeGreaterThan(0);
      expect(topic.steps.length).toBeGreaterThan(0);
      expect(topic.keywords.length).toBeGreaterThan(0);
    });
  });

  it('harus memuat panduan Backup & Restore dan Kelola Pengguna untuk Super User', () => {
    const backupTopic = GUIDE_TOPICS.find((t) => t.id === 'su-backups');
    const userTopic = GUIDE_TOPICS.find((t) => t.id === 'su-users');

    expect(backupTopic).toBeDefined();
    expect(backupTopic?.targetRole).toBe('superuser');

    expect(userTopic).toBeDefined();
    expect(userTopic?.targetRole).toBe('superuser');
  });

  it('harus memuat panduan Peminjaman Aset dan Scan QR untuk User / Staff', () => {
    const borrowTopic = GUIDE_TOPICS.find((t) => t.id === 'user-create-borrowing');
    const qrTopic = GUIDE_TOPICS.find((t) => t.id === 'qr-scanner-guide');

    expect(borrowTopic).toBeDefined();
    expect(qrTopic).toBeDefined();
  });
});
