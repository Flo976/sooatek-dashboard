import { render, screen } from '@testing-library/react';

import Dashboard from '@/components/features/Dashboard';

describe('Dashboard', () => {
  it('renders default stats when none provided', () => {
    render(<Dashboard />);

    expect(screen.getByText(/Welcome back, there!/i)).toBeInTheDocument();
    expect(screen.getByText('Active sessions')).toBeInTheDocument();
    expect(screen.getByText('Open alerts')).toBeInTheDocument();
    expect(screen.getByText('Last activity')).toBeInTheDocument();
  });
});
