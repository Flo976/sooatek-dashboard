import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import LoginForm from '@/components/features/LoginForm';
import { login } from '@/lib/api/auth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/lib/api/auth', () => ({
  login: jest.fn()
}));

describe('LoginForm', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    (login as jest.Mock).mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submits credentials and redirects to dashboard', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'Password123!' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password123!'
    }));

    expect(push).toHaveBeenCalledWith('/dashboard');
  });
});
