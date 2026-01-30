import { normalizeDay } from '../date';

describe('normalizeDay', () => {
  it('handles English short names', () => {
    expect(normalizeDay('Mon')).toBe(0);
    expect(normalizeDay('Tue')).toBe(1);
    expect(normalizeDay('Wed')).toBe(2);
    expect(normalizeDay('Thu')).toBe(3);
    expect(normalizeDay('Fri')).toBe(4);
    expect(normalizeDay('Sat')).toBe(5);
    expect(normalizeDay('Sun')).toBe(6);
  });

  it('handles English long names', () => {
    expect(normalizeDay('Monday')).toBe(0);
    expect(normalizeDay('Thursday')).toBe(3);
    expect(normalizeDay('Sunday')).toBe(6);
  });

  it('handles German short names', () => {
    expect(normalizeDay('Mo')).toBe(0);
    expect(normalizeDay('Di')).toBe(1);
    expect(normalizeDay('Mi')).toBe(2);
    expect(normalizeDay('Do')).toBe(3);
    expect(normalizeDay('Fr')).toBe(4);
    expect(normalizeDay('Sa')).toBe(5);
    expect(normalizeDay('So')).toBe(6);
  });

  it('handles German long names', () => {
    expect(normalizeDay('Montag')).toBe(0);
    expect(normalizeDay('Dienstag')).toBe(1);
    expect(normalizeDay('Mittwoch')).toBe(2);
    expect(normalizeDay('Donnerstag')).toBe(3);
    expect(normalizeDay('Freitag')).toBe(4);
    expect(normalizeDay('Samstag')).toBe(5);
    expect(normalizeDay('Sonntag')).toBe(6);
  });

  it('handles case insensitivity and whitespace', () => {
    expect(normalizeDay('  mon ')).toBe(0);
    expect(normalizeDay('DIENSTAG')).toBe(1);
  });

  it('handles numeric strings (0=Mon)', () => {
    expect(normalizeDay('0')).toBe(0);
    expect(normalizeDay('6')).toBe(6);
  });

  it('returns -1 for invalid inputs', () => {
    expect(normalizeDay('invalid')).toBe(-1);
    expect(normalizeDay('')).toBe(-1);
  });
});
