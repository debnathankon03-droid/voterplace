import { getActions, getPhaseInfo } from '@/lib/decisionEngine';
import { UserProfile } from '@/types';

describe('decisionEngine', () => {
  const baseProfile: UserProfile = {
    uid: '123',
    age: 20,
    state: 'MH',
    voterStatus: 'eligible_unregistered',
    preferredLanguage: 'en',
    onboardingComplete: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
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
      expect(actions.some(a => a.id === 'learn-process')).toBe(true);
    });

    it('returns polling station locator for registered users during campaign', () => {
      const actions = getActions({ ...baseProfile, voterStatus: 'registered' }, 'campaigning');
      expect(actions.some(a => a.id === 'polling-station')).toBe(true);
      expect(actions.some(a => a.id === 'add-to-calendar')).toBe(true);
    });

    it('returns polling day actions for registered users', () => {
      const actions = getActions({ ...baseProfile, voterStatus: 'registered' }, 'polling_day');
      expect(actions.some(a => a.id === 'how-to-vote')).toBe(true);
      expect(actions.some(a => a.id === 'polling-hours')).toBe(true);
    });

    it('returns counting day actions for registered users', () => {
      const actions = getActions({ ...baseProfile, voterStatus: 'registered' }, 'counting');
      expect(actions.some(a => a.id === 'counting-info')).toBe(true);
    });

    it('returns concluded actions for registered users', () => {
      const actions = getActions({ ...baseProfile, voterStatus: 'registered' }, 'concluded');
      expect(actions.some(a => a.id === 'results')).toBe(true);
    });

    it('handles silence period correctly', () => {
      const actions = getActions({ ...baseProfile, voterStatus: 'registered' }, 'silence_period');
      expect(actions.some(a => a.id === 'polling-day-checklist')).toBe(true);
    });

    it('returns unknown status actions', () => {
      const actions = getActions({ ...baseProfile, voterStatus: 'unknown' }, 'no_election');
      expect(actions.some(a => a.id === 'determine-status')).toBe(true);
    });
  });

  describe('getPhaseInfo', () => {
    it('returns correct info for all phases', () => {
      expect(getPhaseInfo('polling_day').label).toBe('Polling Day');
      expect(getPhaseInfo('no_election').label).toBe('No Active Election');
      expect(getPhaseInfo('announced').label).toBe('Election Announced');
      expect(getPhaseInfo('nomination').label).toBe('Nominations Open');
      expect(getPhaseInfo('campaigning').label).toBe('Campaign Period');
      expect(getPhaseInfo('silence_period').label).toBe('Silence Period');
      expect(getPhaseInfo('counting').label).toBe('Counting Day');
      expect(getPhaseInfo('concluded').label).toBe('Election Concluded');
    });
  });
});
