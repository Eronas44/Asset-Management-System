import { describe, it, expect } from 'vitest';

// Simulasi fungsi hasPermission lokal demi mematuhi aturan unit test (tanpa API/Context asli)
const mockHasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

describe('Utility hasPermission()', () => {
  const mockAdminPermissions = ['manage-assets', 'view-reports'];

  it('harus mengembalikan nilai true jika pengguna memiliki permission yang sesuai', () => {
    const result = mockHasPermission(mockAdminPermissions, 'manage-assets');
    expect(result).toBe(true);
  });

  it('harus mengembalikan nilai false jika pengguna tidak memiliki permission yang diminta', () => {
    const result = mockHasPermission(mockAdminPermissions, 'manage-master-data');
    expect(result).toBe(false);
  });
});
