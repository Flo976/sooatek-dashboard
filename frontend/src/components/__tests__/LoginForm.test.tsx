import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import LoginForm from '@/components/features/LoginForm';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}));

describe('LoginForm', () => {
  const push = jest.fn();
  const refresh = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push, refresh });
    (signIn as jest.Mock).mockResolvedValue({ error: null });
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

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'user@example.com',
        password: 'Password123!',
        redirect: false
      })
    );

    expect(push).toHaveBeenCalledWith('/dashboard');
    expect(refresh).toHaveBeenCalled();
  });
});
