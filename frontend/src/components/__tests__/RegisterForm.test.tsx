import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import RegisterForm from '@/components/features/RegisterForm';
import { register as registerUser } from '@/lib/api/auth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/lib/api/auth', () => ({
  register: jest.fn()
}));

describe('RegisterForm', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    (registerUser as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('requires matching passwords', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Strong password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat password'), {
      target: { value: 'Mismatch123!' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });

    expect(registerUser).not.toHaveBeenCalled();
  });
});
