import { render, screen } from '@testing-library/react';
import RiskGauge from './RiskGauge';

describe('RiskGauge Component', () => {
  it('renders correctly with HIGH risk level', () => {
    render(<RiskGauge level="HIGH" percentage={85} contributingFactors={['Stress', 'Isolation']} />);
    
    expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
    expect(screen.getByText(/Stress/i)).toBeInTheDocument();
    expect(screen.getByText(/Isolation/i)).toBeInTheDocument();
  });

  it('renders correctly with LOW risk level', () => {
    render(<RiskGauge level="LOW" percentage={15} contributingFactors={[]} />);
    
    expect(screen.getByText(/LOW/i)).toBeInTheDocument();
  });
});
