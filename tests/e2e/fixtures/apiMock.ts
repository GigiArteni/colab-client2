import type { Page, Route } from '@playwright/test';

export type WorkspaceScenario =
  | 'active'
  | 'inactive'
  | 'archived'
  | 'unknown'
  | 'network_error';

export type AuthScenario =
  | 'password'
  | 'otp'
  | 'mfa'
  | 'invalid_credentials'
  | 'tenant_inactive'
  | 'tenant_unknown';

export interface MockTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const DEFAULT_TOKENS: MockTokens = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  token_type: 'Bearer',
  expires_in: 3600,
};

export const MOCK_USER = {
  id: '1',
  name: 'Test User',
  email: 'test@acme.example',
  phone: '+40700000000',
};

export const MOCK_ENTITIES = [
  { id: '1', name: 'Acme Corp', logo: null },
  { id: '2', name: 'Beta Ltd', logo: null },
];

/**
 * Mock the workspace lookup endpoint for a given scenario.
 * Always intercepts GET /v1/workspaces/:slug.
 */
export async function mockWorkspaceLookup(page: Page, scenario: WorkspaceScenario): Promise<void> {
  await page.route('**/v1/workspaces/**', (route: Route) => {
    if (scenario === 'network_error') {
      return route.abort('failed');
    }

    const body: Record<string, unknown> = { data: { exists: false } };

    if (scenario === 'active') {
      body.data = { exists: true, status: 'active', display_name: 'Acme Corp' };
    } else if (scenario === 'inactive') {
      body.data = { exists: true, status: 'suspended', display_name: 'Acme Corp' };
    } else if (scenario === 'archived') {
      body.data = { exists: true, status: 'archived', display_name: 'Acme Corp' };
    }
    // 'unknown' → exists: false

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

/**
 * Mock POST /auth/check — returns 'password' or 'otp' method.
 */
export async function mockAuthCheck(page: Page, method: 'password' | 'otp'): Promise<void> {
  await page.route('**/auth/check', (route: Route) => {
    if (route.request().method() !== 'POST') return route.continue();

    const body =
      method === 'otp'
        ? {
            method: 'otp',
            user_exists: true,
            channels: [
              { channel: 'email', label: 'Email', masked_destination: 't***@acme.example', preferred: true },
              { channel: 'sms', label: 'SMS', masked_destination: '+407***000', preferred: false },
            ],
          }
        : { method: 'password', user_exists: true };

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

/**
 * Mock POST /login — supports password success, MFA challenge, or error scenarios.
 */
export async function mockLogin(page: Page, scenario: AuthScenario, tokens?: MockTokens): Promise<void> {
  await page.route('**/login', (route: Route) => {
    if (route.request().method() !== 'POST') return route.continue();

    if (scenario === 'invalid_credentials') {
      return route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'The provided credentials are incorrect.', errors: {} }),
      });
    }

    if (scenario === 'tenant_inactive') {
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Tenant inactive', error: { message_key: 'tenant_inactive' } }),
      });
    }

    if (scenario === 'tenant_unknown') {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Tenant not found', error: { message_key: 'tenant_unknown' } }),
      });
    }

    if (scenario === 'mfa') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            requires_mfa: true,
            mfa_token: 'mock-mfa-token',
            methods: [{ method: 'totp', label: 'Authenticator App' }],
          },
        }),
      });
    }

    // password success
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: tokens ?? DEFAULT_TOKENS }),
    });
  });
}

/**
 * Mock POST /auth/otp/request.
 */
export async function mockOtpRequest(page: Page): Promise<void> {
  await page.route('**/auth/otp/request', (route: Route) => {
    if (route.request().method() !== 'POST') return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'OTP sent',
        channel: 'email',
        masked_destination: 't***@acme.example',
        expires_in: 300,
      }),
    });
  });
}

/**
 * Mock POST /auth/otp/verify.
 */
export async function mockOtpVerify(
  page: Page,
  success: boolean,
  tokens?: MockTokens,
): Promise<void> {
  await page.route('**/auth/otp/verify', (route: Route) => {
    if (route.request().method() !== 'POST') return route.continue();
    if (!success) {
      return route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid OTP code' }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tokens ?? DEFAULT_TOKENS),
    });
  });
}

/**
 * Mock POST /auth/mfa/challenge.
 */
export async function mockMfaChallenge(page: Page): Promise<void> {
  await page.route('**/auth/mfa/challenge', (route: Route) => {
    if (route.request().method() !== 'POST') return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        challenge_type: 'totp',
        masked_destination: null,
      }),
    });
  });
}

/**
 * Mock POST /auth/mfa/verify.
 */
export async function mockMfaVerify(
  page: Page,
  success: boolean,
  tokens?: MockTokens,
): Promise<void> {
  await page.route('**/auth/mfa/verify', (route: Route) => {
    if (route.request().method() !== 'POST') return route.continue();
    if (!success) {
      return route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid MFA code' }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: tokens ?? DEFAULT_TOKENS }),
    });
  });
}

/**
 * Mock POST /forgot-password.
 */
export async function mockForgotPassword(page: Page, success = true): Promise<void> {
  await page.route('**/forgot-password', (route: Route) => {
    if (route.request().method() !== 'POST') return route.continue();
    if (!success) {
      return route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email not found' }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) });
  });
}

/**
 * Mock POST /reset-password.
 */
export async function mockResetPassword(page: Page, success = true, tokens?: MockTokens): Promise<void> {
  await page.route('**/reset-password', (route: Route) => {
    if (route.request().method() !== 'POST') return route.continue();
    if (!success) {
      return route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid or expired token' }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: tokens ?? DEFAULT_TOKENS }),
    });
  });
}

/**
 * Mock GET /profile — returns current user.
 */
export async function mockProfile(page: Page): Promise<void> {
  await page.route('**/profile', (route: Route) => {
    if (route.request().method() !== 'GET') return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_USER }),
    });
  });
}

/**
 * Mock GET /entities — returns entity list.
 */
export async function mockEntities(page: Page, entities = MOCK_ENTITIES): Promise<void> {
  await page.route('**/entities**', (route: Route) => {
    if (route.request().method() !== 'GET') return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: entities, meta: { total: entities.length } }),
    });
  });
}

/**
 * Mock all post-auth bootstrap endpoints so the app can fully initialize.
 */
export async function mockAppBootstrap(page: Page, entities = MOCK_ENTITIES): Promise<void> {
  await mockProfile(page);
  await mockEntities(page, entities);

  // Dashboard / invoices stub to prevent 404 noise
  await page.route('**/invoices**', (route: Route) => {
    if (route.request().method() !== 'GET') return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0 } }),
    });
  });

  await page.route('**/subscriptions**', (route: Route) => {
    if (route.request().method() !== 'GET') return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0 } }),
    });
  });

  await page.route('**/meters**', (route: Route) => {
    if (route.request().method() !== 'GET') return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0 } }),
    });
  });

  await page.route('**/notifications**', (route: Route) => {
    if (route.request().method() !== 'GET') return route.continue();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0 } }),
    });
  });
}
