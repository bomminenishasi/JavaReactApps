// ─── E2E: Authentication flows ────────────────────────────────────────────────

describe('Authentication', () => {
  const unique = () => `user_${Date.now()}@securebank.com`;

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
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('BadPassword!');
      cy.get('button[type="submit"]').click();
      cy.get('body', { timeout: 8000 })
        .invoke('text')
        .should('match', /invalid|incorrect|unauthorized|wrong/i);
    });

    it('redirects to dashboard after successful login', () => {
      const email = unique();
      cy.register(email, 'Cypress1!', 'Cypress', 'User');
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
      cy.get('input').then(($inputs) => {
        // Fill firstName, lastName (first two text inputs), then email and password
        cy.wrap($inputs.filter('[name="firstName"], [placeholder*="First" i], [placeholder*="first" i]').first()).type('Cypress');
        cy.wrap($inputs.filter('[name="lastName"], [placeholder*="Last" i], [placeholder*="last" i]').first()).type('User');
      });
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('Cypress1!');
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 10000 }).should('match', /dashboard|login/);
    });

    it('shows error for duplicate email', () => {
      const email = unique();
      cy.register(email, 'Cypress1!', 'Dup', 'User');

      cy.get('input').then(($inputs) => {
        cy.wrap($inputs.filter('[name="firstName"], [placeholder*="First" i], [placeholder*="first" i]').first()).type('Dup');
        cy.wrap($inputs.filter('[name="lastName"], [placeholder*="Last" i], [placeholder*="last" i]').first()).type('User');
      });
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('Cypress1!');
      cy.get('button[type="submit"]').click();

      cy.get('body', { timeout: 8000 })
        .invoke('text')
        .should('match', /already|exists|registered/i);
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

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-btn"]').length) {
          cy.getByTestId('logout-btn').click();
        } else {
          cy.get('[aria-label*="account" i], [aria-label*="user" i], [aria-label*="menu" i]')
            .first().click({ force: true });
          cy.contains(/logout|sign out/i).click();
        }
      });

      cy.url({ timeout: 8000 }).should('include', '/login');
      cy.window().its('localStorage').invoke('getItem', 'accessToken').should('be.null');
    });
  });
});
