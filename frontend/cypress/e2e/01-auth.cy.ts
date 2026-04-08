// ─── E2E: Authentication flows ────────────────────────────────────────────────

describe('Authentication', () => {
  const unique = () => `user_${Date.now()}@securebank.com`;

  // ── Login page ─────────────────────────────────────────────────────────────

  describe('Login Page', () => {
    beforeEach(() => cy.visit('/login'));

    it('renders login form', () => {
      cy.get('input[name="email"], input[type="email"]').should('be.visible');
      cy.get('input[name="password"], input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('shows validation errors for empty form submission', () => {
      cy.get('button[type="submit"]').click();
      cy.get('body').should('contain.text', 'required').or('contain.text', 'email');
    });

    it('shows error for invalid credentials', () => {
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('BadPassword!');
      cy.get('button[type="submit"]').click();
      cy.get('body').should(
        'contain.text', 'Invalid').or('contain.text', 'incorrect').or('contain.text', 'Unauthorized'),
      { timeout: 8000 };
    });

    it('redirects to dashboard after successful login', () => {
      // Register then login
      const email = unique();
      cy.register(email, 'Cypress1!', 'Cypress', 'User');

      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type('Cypress1!');
      cy.get('button[type="submit"]').click();

      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('has a link to the register page', () => {
      cy.get('a[href*="register"], button').contains(/register|sign up/i).click();
      cy.url().should('include', '/register');
    });
  });

  // ── Register page ──────────────────────────────────────────────────────────

  describe('Register Page', () => {
    beforeEach(() => cy.visit('/register'));

    it('renders all register fields', () => {
      cy.get('input[name="firstName"], input[placeholder*="first" i]').should('exist');
      cy.get('input[name="lastName"], input[placeholder*="last" i]').should('exist');
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('registers new user and redirects to dashboard', () => {
      const email = unique();

      cy.get('input[name="firstName"], input[placeholder*="first" i]').first().type('Cypress');
      cy.get('input[name="lastName"], input[placeholder*="last" i]').first().type('User');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('Cypress1!');
      cy.get('button[type="submit"]').click();

      cy.url({ timeout: 10000 }).should('match', /dashboard|login/);
    });

    it('shows error for duplicate email', () => {
      const email = unique();
      cy.register(email, 'Cypress1!', 'Dup', 'User');

      cy.get('input[name="firstName"], input[placeholder*="first" i]').first().type('Dup');
      cy.get('input[name="lastName"], input[placeholder*="last" i]').first().type('User');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('Cypress1!');
      cy.get('button[type="submit"]').click();

      cy.get('body', { timeout: 8000 }).should(
        'contain.text', 'already').or('contain.text', 'exists'),
      { timeout: 8000 };
    });
  });

  // ── Protected routes ───────────────────────────────────────────────────────

  describe('Route protection', () => {
    it('redirects unauthenticated user from /dashboard to /login', () => {
      cy.clearLocalStorage();
      cy.visit('/dashboard');
      cy.url({ timeout: 6000 }).should('include', '/login');
    });

    it('redirects unauthenticated user from /accounts to /login', () => {
      cy.clearLocalStorage();
      cy.visit('/accounts');
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

      // Click logout (look for button or menu item)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-btn"]').length) {
          cy.getByTestId('logout-btn').click();
        } else {
          // Try avatar/menu fallback
          cy.get('[aria-label*="account"], [aria-label*="user"], [aria-label*="menu"]')
            .first().click({ force: true });
          cy.contains(/logout|sign out/i).click();
        }
      });

      cy.url({ timeout: 8000 }).should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.be.null;
      });
    });
  });
});
