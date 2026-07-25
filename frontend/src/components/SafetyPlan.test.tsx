import { render, screen } from '@testing-library/react';
import SafetyPlan from './SafetyPlan';

describe('SafetyPlan Component', () => {
  it('renders immediate actions and coping strategies', () => {
    const actions = ['Call Sponsor immediately'];
    const strategies = ['Go for a walk', 'Drink water'];
    const signs = ['Increased heart rate'];

    render(
      <SafetyPlan
        planTitle="Crisis Safety Plan"
        immediateActions={actions}
        copingStrategies={strategies}
        warningSigns={signs}
      />
    );

    expect(screen.getByText('Crisis Safety Plan')).toBeInTheDocument();
    expect(screen.getByText('Call Sponsor immediately')).toBeInTheDocument();
    expect(screen.getByText('Go for a walk')).toBeInTheDocument();
    expect(screen.getByText('Increased heart rate')).toBeInTheDocument();
  });
});
