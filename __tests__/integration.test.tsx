import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingPage from '@/app/onboarding/page';

// Mock the useRouter hook from Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Onboarding Flow Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders the initial step correctly', () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/Where do you vote\?/i)).toBeInTheDocument();
  });

  it('allows user to navigate through the entire flow (adult voter)', async () => {
    render(<OnboardingPage />);

    // Step 0: Location
    const stateSelect = screen.getByRole('combobox');
    fireEvent.change(stateSelect, { target: { value: 'Delhi' } });
    
    // Click Continue
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    // Step 1: Age & Status
    await waitFor(() => {
      expect(screen.getByText(/Tell us about yourself/i)).toBeInTheDocument();
    });

    const ageInput = screen.getByPlaceholderText(/Enter your age/i);
    fireEvent.change(ageInput, { target: { value: '25' } });

    // Select registered
    const registeredButton = screen.getByText(/Yes, I'm registered/i);
    fireEvent.click(registeredButton);
    
    // Click Continue
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 2: Language
    await waitFor(() => {
      expect(screen.getByText(/Choose your language/i)).toBeInTheDocument();
    });
    
    const enButton = screen.getAllByText('English')[0];
    fireEvent.click(enButton);

    // Finish onboarding
    const finishButton = screen.getByRole('button', { name: /Finish Setup/i });
    fireEvent.click(finishButton);

    // Profile should be saved in localStorage
    await waitFor(() => {
      const savedProfile = JSON.parse(localStorage.getItem('matdaan-profile') || '{}');
      expect(savedProfile.age).toBe(25);
      expect(savedProfile.state).toBe('Delhi');
      expect(savedProfile.voterStatus).toBe('registered');
      expect(savedProfile.preferredLanguage).toBe('en');
    });
  });

  it('handles edge case: under 18 future voter', async () => {
    render(<OnboardingPage />);

    // Step 0: Location
    const stateSelect = screen.getByRole('combobox');
    fireEvent.change(stateSelect, { target: { value: 'Maharashtra' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 1: Age
    await waitFor(() => {
      expect(screen.getByText(/Tell us about yourself/i)).toBeInTheDocument();
    });
    
    const ageInput = screen.getByPlaceholderText(/Enter your age/i);
    fireEvent.change(ageInput, { target: { value: '16' } });

    // "You're a future voter" text should appear
    expect(screen.getByText(/future voter/i)).toBeInTheDocument();

    // Click Continue
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 2: Language
    await waitFor(() => {
      expect(screen.getByText(/Choose your language/i)).toBeInTheDocument();
    });
    
    const hiButton = screen.getByText('Hindi');
    fireEvent.click(hiButton);

    // Finish
    fireEvent.click(screen.getByRole('button', { name: /Finish Setup/i }));

    // Profile check
    await waitFor(() => {
      const savedProfile = JSON.parse(localStorage.getItem('matdaan-profile') || '{}');
      expect(savedProfile.voterStatus).toBe('under_18');
      expect(savedProfile.preferredLanguage).toBe('hi');
    });
  });
});
