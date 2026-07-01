import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('renders the login page by default', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
});

test('opens the registration page from login', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /register/i }));

  expect(await screen.findByRole('heading', { name: /register/i })).toBeInTheDocument();
});
