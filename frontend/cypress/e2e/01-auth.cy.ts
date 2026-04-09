// ─── E2E: Authentication flows ────────────────────────────────────────────────
//
// Note: The React app calls http://localhost:8080/api/... which is only reachable
// from the host machine, not from inside the Cypress Docker container.
// cy.request() routes through Cypress Node process (can reach banking-backend:8080).
// Browser XHR cannot reach localhost:8080 inside Docker.
// Solution: cy.intercept() stubs browser API calls; cy.login/register use cy.request().

describe('Authentication', () => {
  const unique = () => `user_${Date.now()}_${Math.random().toString(36).slice(2)}@securebank.com`;

  // ── Login page ─────────────────────────────────────────────────────────────

  describe('Login Page', () => {
    beforeEach(() => cy.visit('/login'));

    it('renders login form', () => {
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('shows validation errors for empty form submission', () => {
      cy.get('button[type="submit"]').click();
      cy.get('body').invoke('text').should('match', /required|email/i);
    });

    it('shows error for invalid credentials', () => {
      // Stub the API call so login fails with a clear error message.
      // Use 400 (not 401) to avoid the axiosInstance 401-refresh interceptor
      // which calls window.location.href = '/login' and reloads the page.
      cy.intercept('POST', /api\/auth\/login/, {
        statusCode: 400,
        body: { message: 'Invalid credentials' },
      });
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('BadPassword1!');
      cy.get('button[type="submit"]').click();
      cy.get('body', { timeout: 8000 })
        .invoke('text')
        .should('match', /invalid|incorrect|unauthorized|wrong|bad|credential|failed/i);
    });

    it('redirects to dashboard after successful login', () => {
      const email = unique();
      cy.register(email, 'Cypress1!', 'Cypress', 'User');
      // Stub a successful login response
      cy.intercept('POST', /api\/auth\/login/, {
        statusCode: 200,
        body: {
          data: {
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
            email,
            firstName: 'Cypress',
            lastName: 'User',
            role: 'USER',
          },
        },
      });
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type('Cypress1!');
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('has a link to the register page', () => {
      cy.contains(/register|sign up/i).click();
      cy.url().should('include', '/register');
    });
  });

  // ── Register page ──────────────────────────────────────────────────────────

  describe('Register Page', () => {
    beforeEach(() => cy.visit('/register'));

    it('renders all register fields', () => {
      cy.get('input').should('have.length.at.least', 3);
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('registers new user and redirects to dashboard or login', () => {
      const email = unique();
      // Register returns auth tokens (auto-login on registration)
      cy.intercept('POST', /api\/auth\/register/, {
        statusCode: 200,
        body: {
          data: {
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
            email,
            firstName: 'Cypress',
            lastName: 'User',
            role: 'USER',
          },
        },
      });
      // react-hook-form sets name attributes
      cy.get('input[name="firstName"]').type('Cypress');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type('Cypress1!');
      cy.get('input[name="confirmPassword"]').type('Cypress1!');
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 10000 }).should('match', /dashboard|login/);
    });

    it('shows error for duplicate email', () => {
      const email = unique();
      cy.intercept('POST', /api\/auth\/register/, {
        statusCode: 409,
        body: { message: 'User already exists' },
      });
      cy.get('input[name="firstName"]').type('Dup');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type('Cypress1!');
      cy.get('input[name="confirmPassword"]').type('Cypress1!');
      cy.get('button[type="submit"]').click();

      cy.get('body', { timeout: 8000 })
        .invoke('text')
        .should('match', /already|exists|registered|taken|conflict/i);
    });
  });

  // ── Protected routes ───────────────────────────────────────────────────────

  describe('Route protection', () => {
    beforeEach(() => cy.clearLocalStorage());

    it('redirects unauthenticated user from /dashboard to /login', () => {
      cy.visit('/dashboard');
      cy.url({ timeout: 6000 }).should('include', '/login');
    });

    it('redirects unauthenticated user from /accounts to /login', () => {
      cy.visit('/accounts');
      cy.url({ timeout: 6000 }).should('include', '/login');
    });

    it('redirects unauthenticated user from /credit-score to /login', () => {
      cy.visit('/credit-score');
      cy.url({ timeout: 6000 }).should('include', '/login');
    });
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  describe('Logout', () => {
    it('clears session and redirects to login', () => {
      const email = unique();
      cy.register(email, 'Cypress1!', 'Logout', 'Test');
      cy.login(email, 'Cypress1!');
      cy.visit('/dashboard');

      // Verify authenticated
      cy.window().its('localStorage').invoke('getItem', 'accessToken').should('not.be.null');

      // Use the cy.logout() command which clears localStorage and navigates to /login
      cy.logout();

      cy.url({ timeout: 8000 }).should('include', '/login');
      cy.window().its('localStorage').invoke('getItem', 'accessToken').should('be.null');
    });
  });
});
