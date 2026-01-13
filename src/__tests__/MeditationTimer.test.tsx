import React from 'react';
import { render, screen, act } from '@testing-library/react';
import MeditationTimer from '@/components/MeditationTimer';
import { saveMeditationSession } from '@/actions/meditation';

jest.mock('@/actions/meditation', () => ({
  saveMeditationSession: jest.fn(),
}));

jest.mock('@/components/CelebrationEffect', () => {
    return function DummyCelebration() {
        return <div data-testid="celebration">Celebration</div>;
    };
});

// Mock AudioContext
const mockAudioContext = {
  createOscillator: () => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    type: 'sine',
  }),
  createGain: () => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
  }),
  currentTime: 0,
  destination: {},
};
(window as any).AudioContext = jest.fn(() => mockAudioContext);


describe('MeditationTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('stops when time reaches 0', async () => {
    render(<MeditationTimer />);

    // There are duration buttons (4), reset (1), play (1), settings (1).
    // Play button is the 6th one (index 5)
    const buttons = screen.getAllByRole('button');
    const playBtn = buttons[5]; 
    
    // Start timer
    await act(async () => {
        playBtn.click();
    });

    // Fast forward 25 mins (25 * 60 * 1000 ms) + buffer
    // The component defaults to 25 mins
    await act(async () => {
        jest.advanceTimersByTime(25 * 60 * 1000);
    });
    
    // Should be 0:00
    // If bug exists, it might be -0:01 or similar if the render happens
    
    // Advance a bit more to see if it goes negative
    await act(async () => {
        jest.advanceTimersByTime(5000); 
    });

    // If bug exists, text might contain negative numbers
    const timeDisplay = screen.getByText(/-?\d+:\d+/);
    expect(timeDisplay.textContent).toBe('0:00');
    
    // Verify completion called
    expect(saveMeditationSession).toHaveBeenCalled();
  });
});
