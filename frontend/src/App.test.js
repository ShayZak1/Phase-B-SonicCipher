import { render, screen } from '@testing-library/preact';
import App from './App';

test('renders learn preact link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn preact/i);
  expect(linkElement).toBeInTheDocument();
});
