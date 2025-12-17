import { ProviderAdapter } from '../providerAdapter';

describe('ProviderAdapter', () => {
  const mockDto = {
    id: 'prov-1',
    businessName: 'Top Salon',
    user: {
      id: 'user-1',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '12345',
    },
    bio: 'Experienced stylist',
    isVerified: true,
    certifications: [{ id: 'c1', title: 'Cert A', year: 2023 }],
    website: 'example.com',
  };

  it('transforms DTO to domain model correctly', () => {
    const model = ProviderAdapter.toDomain(mockDto as any);
    
    expect(model.id).toBe('prov-1');
    expect(model.businessName).toBe('Top Salon');
    expect(model.firstName).toBe('Max');
    expect(model.lastName).toBe('Mustermann');
    expect(model.fullName).toBe('Max Mustermann');
    expect(model.bio).toBe('Experienced stylist');
    expect(model.isVerified).toBe(true);
    expect(model.socialMedia.website).toBe('example.com');
  });

  it('handles missing user fields gracefully', () => {
    const incompleteDto = {
      id: 'prov-2',
      // user object missing entirely
    };
    
    const model = ProviderAdapter.toDomain(incompleteDto as any);
    
    expect(model.id).toBe('prov-2');
    expect(model.firstName).toBe('');
    expect(model.fullName).toBe('');
  });

  it('transforms certification list correctly', () => {
    const certsDto = [
      { id: 'c1', title: 'Cert A', institution: 'Inst A', year: 2023 },
      { id: 'c2', title: 'Cert B', institution: 'Inst B', year: 2022 },
    ];
    
    const list = ProviderAdapter.toCertificationList(certsDto);
    expect(list).toHaveLength(2);
    expect(list[0].title).toBe('Cert A');
    expect(list[0].year).toBe('2023');
  });
});
