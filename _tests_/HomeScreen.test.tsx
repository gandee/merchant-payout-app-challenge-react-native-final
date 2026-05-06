import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index';

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

const mockMerchantData = {
  available_balance: 500000,
  pending_balance: 25000,
  currency: 'GBP',
  activity: [
    {
      id: 'act_001',
      type: 'deposit',
      amount: 150000,
      currency: 'GBP',
      date: '2026-01-01T00:00:00.000Z',
      description: 'Payment from Customer ABC',
      status: 'completed',
    },
    {
      id: 'act_002',
      type: 'payout',
      amount: -50000,
      currency: 'GBP',
      date: '2026-01-02T00:00:00.000Z',
      description: 'Payout to Bank Account ****1234',
      status: 'completed',
    },
    {
      id: 'act_003',
      type: 'deposit',
      amount: 230000,
      currency: 'GBP',
      date: '2026-01-03T00:00:00.000Z',
      description: 'Payment from Customer XYZ',
      status: 'completed',
    },
  ],
};

beforeEach(() => {
  global.fetch = jest.fn((url: string) => {
    if (url.includes('/api/merchant/activity')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: mockMerchantData.activity,
          next_cursor: null,
          has_more: false,
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockMerchantData),
    });
  }) as jest.Mock;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('HomeScreen', () => {
  it('shows loading state initially', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('loading')).toBeTruthy();
  });

  it('displays balance after loading', async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('£5000.00')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('displays pending balance', async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('Pending: £250.00')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('shows Show more button', async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('opens transaction modal when Show more pressed', async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeTruthy();
    }, { timeout: 3000 });
    fireEvent.press(screen.getByText('Show more'));
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeTruthy();
    }, { timeout: 3000 });
  });
});