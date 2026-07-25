import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock Web Speech API to prevent errors during test
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
  })),
});

describe('Home Dashboard Component', () => {
  it('renders the main AnchorAI heading', () => {
    render(<Home />);
    
    // Check if AnchorAI is rendered
    const headingAnchor = screen.getByText('Anchor');
    const headingAI = screen.getByText('AI');
    
    expect(headingAnchor).toBeInTheDocument();
    expect(headingAI).toBeInTheDocument();
  });

  it('renders the SOS Button', () => {
    render(<Home />);
    
    // Using testid or role would be better, but we can check text fallback
    const textFallbackButton = screen.getByText(/Prefer to type/i);
    expect(textFallbackButton).toBeInTheDocument();
  });
});
