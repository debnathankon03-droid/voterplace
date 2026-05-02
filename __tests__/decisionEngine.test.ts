import { getActions, getPhaseInfo } from '@/lib/decisionEngine';
import { UserProfile, ElectionPhase } from '@/types';

describe('decisionEngine', () => {
  const baseProfile: UserProfile = {
    age: 20,
    state: 'MH',
    voterStatus: 'eligible_unregistered',
    language: 'en',
    accessibilityNeeded: false,
  };

  describe('getActions', () => {
    it('returns registration actions for eligible unregistered users', () => {
      const actions = getActions(baseProfile, 'no_election');
      expect(actions.some(a => a.id === 'register-now')).toBe(true);
    });

    it('returns warning for unregistered users if election announced', () => {
      const actions = getActions(baseProfile, 'announced');
      expect(actions.some(a => a.id === 'deadline-warning')).toBe(true);
    });

    it('returns future voter actions for under 18 users', () => {
      const actions = getActions({ ...baseProfile, voterStatus: 'under_18' }, 'no_election');
      expect(actions.some(a => a.id === 'future-voter')).toBe(true);
    });

    it('returns polling station locator for registered users during campaign', () => {
      const actions = getActions({ ...baseProfile, voterStatus: 'registered' }, 'campaigning');
      expect(actions.some(a => a.id === 'polling-station')).toBe(true);
    });
  });

  describe('getPhaseInfo', () => {
    it('returns label and description for polling day', () => {
      const info = getPhaseInfo('polling_day');
      expect(info.label).toBe('Polling Day');
      expect(info.description).toContain('Today is voting day');
    });
  });
});
