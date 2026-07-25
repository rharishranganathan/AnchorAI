import { render, screen } from '@testing-library/react';
import GroundingScript from './GroundingScript';

describe('GroundingScript Component', () => {
  it('renders grounding steps and title', () => {
    const steps = ['Breathe in deeply', 'Hold for 4 seconds', 'Exhale slowly'];
    render(<GroundingScript title="5-4-3-2-1 Technique" durationMinutes={2} steps={steps} />);
    
    expect(screen.getByText('5-4-3-2-1 Technique')).toBeInTheDocument();
    expect(screen.getByText(/2 Min Exercise/i)).toBeInTheDocument();
    expect(screen.getByText('Breathe in deeply')).toBeInTheDocument();
    expect(screen.getByText('Exhale slowly')).toBeInTheDocument();
  });
});
