import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import PayoutsScreen from '../app/(tabs)/payouts';

jest.mock('@/modules/ScreenSecurity', () => ({
  __esModule: true,
  default: {
    getDeviceId: jest.fn(() => 'mock-device-id'),
    isBiometricAuthenticated: jest.fn(() => Promise.resolve(true)),
    startScreenshotDetection: jest.fn(),
    stopScreenshotDetection: jest.fn(),
    addScreenshotListener: jest.fn(() => ({ remove: jest.fn() })),
  }
}));

const mockFetch = (status: number, body: object) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    })
  ) as jest.Mock;
};

describe('PayoutsScreen', () => {
  beforeEach(() => {
    mockFetch(201, {
      id: 'payout_123',
      status: 'completed',
      amount: 10000,
      currency: 'GBP',
      iban: 'FR1212345123451234567A123',
      created_at: '2026-01-01T00:00:00.000Z',
    });
  });

  it('renders correctly', () => {
    render(<PayoutsScreen />);
    expect(screen.getByText('Send Payout')).toBeTruthy();
  });

  it('confirm button disabled when form empty', () => {
    render(<PayoutsScreen />);
    const button = screen.getByTestId('confirm-button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('confirm button enabled with valid input', () => {
    render(<PayoutsScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('0.00'), '100');
    fireEvent.changeText(
      screen.getByPlaceholderText('FR1212345123451234567A12310131231231231'),
      'FR1212345123451234567A123'
    );
    const button = screen.getByTestId('confirm-button');
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });

  it('confirm button disabled when amount is zero', () => {
    render(<PayoutsScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('0.00'), '0');
    fireEvent.changeText(
      screen.getByPlaceholderText('FR1212345123451234567A12310131231231231'),
      'FR1212345123451234567A123'
    );
    const button = screen.getByTestId('confirm-button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('shows confirmation modal when confirm pressed', () => {
    render(<PayoutsScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('0.00'), '100');
    fireEvent.changeText(
      screen.getByPlaceholderText('FR1212345123451234567A12310131231231231'),
      'FR1212345123451234567A123'
    );
    fireEvent.press(screen.getByTestId('confirm-button'));
    expect(screen.getByText('Confirm Payout')).toBeTruthy();
  });

  it('shows success screen after successful payout', async () => {
    render(<PayoutsScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('0.00'), '100');
    fireEvent.changeText(
      screen.getByPlaceholderText('FR1212345123451234567A12310131231231231'),
      'FR1212345123451234567A123'
    );
    fireEvent.press(screen.getByTestId('confirm-button'));
    fireEvent.press(screen.getByTestId('modal-confirm-button'));
    await waitFor(() => {
      expect(screen.getByText('Payout Completed')).toBeTruthy();
    });
  });

  it('shows insufficient funds error', async () => {
    mockFetch(400, { error: 'Insufficient funds' });
    render(<PayoutsScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('0.00'), '888.88');
    fireEvent.changeText(
      screen.getByPlaceholderText('FR1212345123451234567A12310131231231231'),
      'FR1212345123451234567A123'
    );
    fireEvent.press(screen.getByTestId('confirm-button'));
    fireEvent.press(screen.getByTestId('modal-confirm-button'));
    await waitFor(() => {
      expect(screen.getByText('Insufficient funds.')).toBeTruthy();
    });
  });

  it('shows service unavailable error', async () => {
    mockFetch(503, { error: 'Service unavailable' });
    render(<PayoutsScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('0.00'), '999.99');
    fireEvent.changeText(
      screen.getByPlaceholderText('FR1212345123451234567A12310131231231231'),
      'FR1212345123451234567A123'
    );
    fireEvent.press(screen.getByTestId('confirm-button'));
    fireEvent.press(screen.getByTestId('modal-confirm-button'));
    await waitFor(() => {
      expect(
        screen.getByText('Service temporarily unavailable. Please try again later.')
      ).toBeTruthy();
    });
  });

  it('resets form after successful payout', async () => {
    render(<PayoutsScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('0.00'), '100');
    fireEvent.changeText(
      screen.getByPlaceholderText('FR1212345123451234567A12310131231231231'),
      'FR1212345123451234567A123'
    );
    fireEvent.press(screen.getByTestId('confirm-button'));
    fireEvent.press(screen.getByTestId('modal-confirm-button'));
    await waitFor(() => {
      expect(screen.getByText('Payout Completed')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('Create Another Payout'));
    expect(screen.getByText('Send Payout')).toBeTruthy();
  });
});