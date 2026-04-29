// ============================================================
// Decision Engine — The brain of Matdaan Mitra
// ============================================================
// Pure function: takes a UserProfile + ElectionPhase, returns
// prioritized ActionCards. No side effects, fully unit-testable.
// ============================================================

import { ActionCard, ElectionPhase, UserProfile } from '@/types';

/**
 * Core decision function that determines what action cards to show
 * based on the user's registration status and the current election phase.
 *
 * Priority: 0 = critical/urgent, 1 = high, 2 = medium, 3 = low
 *
 * @param profile - The user's profile (age, state, voterStatus, etc.)
 * @param phase   - The current election phase
 * @returns Sorted array of ActionCards (lowest priority number = most important)
 */
export function getActions(profile: UserProfile, phase: ElectionPhase): ActionCard[] {
  const actions: ActionCard[] = [];

  // ──────────────────────────────────────────────────────────
  // Branch 1: Under 18 — Future voter pathway
  // ──────────────────────────────────────────────────────────
  if (profile.voterStatus === 'under_18') {
    actions.push({
      id: 'future-voter',
      priority: 1,
      title: 'You\'re a Future Voter! 🌟',
      description: 'You can pre-register once you turn 17. Learn about the process so you\'re ready to vote on your 18th birthday!',
      cta: { label: 'Learn About Pre-Registration', href: '/chat?topic=pre-registration', type: 'internal' },
      icon: 'sparkles',
    });
    actions.push({
      id: 'learn-process',
      priority: 2,
      title: 'Understand the Election Process',
      description: 'Take our quiz to learn how Indian democracy works — from nominations to counting day.',
      cta: { label: 'Start Learning', href: '/quiz', type: 'internal' },
      icon: 'book-open',
    });
    actions.push({
      id: 'myth-buster',
      priority: 3,
      title: 'Myth vs Fact',
      description: 'Don\'t fall for election misinformation. Learn to spot common myths.',
      cta: { label: 'Bust Myths', href: '/myths', type: 'internal' },
      icon: 'shield-check',
    });
    return actions.sort((a, b) => a.priority - b.priority);
  }

  // ──────────────────────────────────────────────────────────
  // Branch 2: Eligible but NOT registered
  // ──────────────────────────────────────────────────────────
  if (profile.voterStatus === 'eligible_unregistered') {
    // Urgent deadline warning if election is approaching
    if (phase !== 'no_election' && phase !== 'concluded') {
      actions.push({
        id: 'deadline-warning',
        priority: 0,
        title: '⚠️ Registration Deadline Approaching',
        description: 'An election has been announced! Register NOW to ensure you can vote. Deadlines are strict.',
        cta: { label: 'Register Immediately', href: 'https://www.nvsp.in/', type: 'external' },
        icon: 'alert-triangle',
        phase,
      });
    }

    actions.push({
      id: 'register-now',
      priority: 1,
      title: 'Register to Vote',
      description: 'Fill Form 6 online on the NVSP portal. You\'ll need Aadhaar, address proof, and a passport photo. Takes ~10 minutes.',
      cta: { label: 'Start Registration (NVSP)', href: 'https://www.nvsp.in/', type: 'external' },
      icon: 'user-plus',
    });

    actions.push({
      id: 'documents-checklist',
      priority: 2,
      title: 'Documents You\'ll Need',
      description: 'Aadhaar card, address proof, passport-size photo, and age proof. Get the full checklist.',
      cta: { label: 'View Checklist', href: '/chat?topic=registration-documents', type: 'internal' },
      icon: 'file-text',
    });

    actions.push({
      id: 'learn-rights',
      priority: 3,
      title: 'Know Your Voter Rights',
      description: 'Every citizen has the right to vote freely and without coercion. Learn your rights.',
      cta: { label: 'Learn More', href: '/chat?topic=voter-rights', type: 'internal' },
      icon: 'scale',
    });

    return actions.sort((a, b) => a.priority - b.priority);
  }

  // ──────────────────────────────────────────────────────────
  // Branch 3: Registered voter — phase-dependent guidance
  // ──────────────────────────────────────────────────────────
  if (profile.voterStatus === 'registered') {
    // Always-available actions
    actions.push({
      id: 'verify-roll',
      priority: phase === 'no_election' ? 2 : 1,
      title: 'Verify Your Name on the Voter Roll',
      description: 'Make sure your name, photo, and details are correct on the Electoral Roll.',
      cta: { label: 'Check on Voter Portal', href: 'https://voterportal.eci.gov.in/', type: 'external' },
      icon: 'search',
    });

    // Phase-specific actions
    switch (phase) {
      case 'no_election':
        actions.push({
          id: 'learn-rights',
          priority: 3,
          title: 'Know Your Rights & Duties',
          description: 'Understand your rights as a voter and the Model Code of Conduct.',
          cta: { label: 'Learn More', href: '/chat?topic=voter-rights', type: 'internal' },
          icon: 'scale',
        });
        actions.push({
          id: 'quiz-challenge',
          priority: 4,
          title: 'Test Your Election Knowledge',
          description: 'How well do you know the Indian election process? Take a quiz!',
          cta: { label: 'Start Quiz', href: '/quiz', type: 'internal' },
          icon: 'brain',
        });
        break;

      case 'announced':
      case 'nomination':
      case 'campaigning':
        actions.push({
          id: 'polling-station',
          priority: 1,
          title: 'Find Your Polling Station',
          description: `Locate your designated polling booth in ${profile.constituency || profile.state}.`,
          cta: { label: 'Find Station', href: '/locator', type: 'internal' },
          icon: 'map-pin',
          phase,
        });
        actions.push({
          id: 'add-to-calendar',
          priority: 1,
          title: 'Add Polling Day to Calendar',
          description: 'Never miss election day! Add it to your Google Calendar with a reminder.',
          cta: { label: 'Add to Calendar', href: '/api/calendar/add', type: 'calendar' },
          icon: 'calendar',
          phase,
        });
        actions.push({
          id: 'whats-on-ballot',
          priority: 2,
          title: 'What\'s on the Ballot?',
          description: 'Understand EVM, VVPAT, NOTA, and how to cast your vote correctly.',
          cta: { label: 'Learn About Voting', href: '/chat?topic=voting-process', type: 'internal' },
          icon: 'vote',
          phase,
        });
        break;

      case 'silence_period':
        actions.push({
          id: 'polling-day-checklist',
          priority: 1,
          title: '📋 Polling Day Checklist',
          description: 'Voter ID (EPIC), know your booth number, wear comfortable clothing, eat before you go.',
          cta: { label: 'View Full Checklist', href: '/chat?topic=polling-checklist', type: 'internal' },
          icon: 'clipboard-check',
          phase,
        });
        actions.push({
          id: 'find-booth',
          priority: 1,
          title: 'Locate Your Polling Booth',
          description: 'Get directions to your polling station.',
          cta: { label: 'Find Station', href: '/locator', type: 'internal' },
          icon: 'map-pin',
          phase,
        });
        break;

      case 'polling_day':
        actions.push({
          id: 'how-to-vote',
          priority: 1,
          title: '🗳️ How to Vote — Step by Step',
          description: 'Queue → verify identity → receive ballot slip → press EVM button → check VVPAT → ink on finger → done!',
          cta: { label: 'Full Guide', href: '/chat?topic=how-to-vote', type: 'internal' },
          icon: 'check-circle',
          phase,
        });
        actions.push({
          id: 'polling-hours',
          priority: 1,
          title: '⏰ Polling Hours',
          description: 'Polls are typically open 7:00 AM to 6:00 PM. If you\'re in the queue by 6 PM, you WILL get to vote.',
          cta: { label: 'More Details', href: '/chat?topic=polling-hours', type: 'internal' },
          icon: 'clock',
          phase,
        });
        actions.push({
          id: 'grievance-helpline',
          priority: 2,
          title: '📞 Report Issues — Call 1950',
          description: 'Facing problems at the booth? Call the ECI helpline 1950 or file a complaint online.',
          cta: { label: 'File Complaint', href: 'https://eci.gov.in/grievances/', type: 'external' },
          icon: 'phone',
          phase,
        });
        break;

      case 'counting':
        actions.push({
          id: 'counting-info',
          priority: 2,
          title: 'Counting Day — What Happens?',
          description: 'Results are tallied round by round. Watch live on ECI\'s official portal.',
          cta: { label: 'Learn About Counting', href: '/chat?topic=counting-process', type: 'internal' },
          icon: 'bar-chart',
          phase,
        });
        break;

      case 'concluded':
        actions.push({
          id: 'results',
          priority: 2,
          title: 'Election Results',
          description: 'View official results on the Election Commission portal.',
          cta: { label: 'View Results', href: 'https://results.eci.gov.in/', type: 'external' },
          icon: 'trophy',
          phase,
        });
        break;
    }
  }

  // ──────────────────────────────────────────────────────────
  // Universal actions (for any status)
  // ──────────────────────────────────────────────────────────
  if (profile.voterStatus === 'unknown') {
    actions.push({
      id: 'determine-status',
      priority: 1,
      title: 'Let\'s Figure Out Your Status',
      description: 'Answer a few questions so we can give you personalized guidance.',
      cta: { label: 'Update Profile', href: '/onboarding', type: 'internal' },
      icon: 'help-circle',
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

/**
 * Get the label and description for an election phase.
 */
export function getPhaseInfo(phase: ElectionPhase): { label: string; description: string } {
  const phaseMap: Record<ElectionPhase, { label: string; description: string }> = {
    no_election: { label: 'No Active Election', description: 'No elections currently scheduled. Stay informed!' },
    announced: { label: 'Election Announced', description: 'The Election Commission has announced upcoming elections.' },
    nomination: { label: 'Nominations Open', description: 'Candidates are filing their nomination papers.' },
    campaigning: { label: 'Campaign Period', description: 'Candidates are actively campaigning. Evaluate manifestos!' },
    silence_period: { label: 'Silence Period', description: 'Campaigning has ended. Reflect and prepare to vote.' },
    polling_day: { label: 'Polling Day', description: 'Today is voting day! Exercise your right.' },
    counting: { label: 'Counting Day', description: 'Votes are being counted. Results coming soon.' },
    concluded: { label: 'Election Concluded', description: 'Results have been announced.' },
  };
  return phaseMap[phase];
}
