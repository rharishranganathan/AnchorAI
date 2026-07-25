import { render, screen } from '@testing-library/react';
import CaregiverPanel from './CaregiverPanel';

describe('CaregiverPanel Component', () => {
  it('renders advice, dos, donts, and notification status', () => {
    render(
      <CaregiverPanel
        summary="User needs support"
        dos={['Stay calm', 'Listen']}
        donts={['Do not judge']}
        conversationStarters={['How can I support you?']}
        notifyFamily={true}
        notifyReason="High craving detected"
      />
    );

    expect(screen.getByText('Caregiver Support Guide')).toBeInTheDocument();
    expect(screen.getByText('Family has been notified')).toBeInTheDocument();
    expect(screen.getByText('High craving detected')).toBeInTheDocument();
    expect(screen.getByText('Stay calm')).toBeInTheDocument();
    expect(screen.getByText('Do not judge')).toBeInTheDocument();
  });
});
