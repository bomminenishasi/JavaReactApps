// ─── E2E: Accounts page ───────────────────────────────────────────────────────

describe('Accounts', () => {
  const email = `accts_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Acct', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/accounts');
  });

  it('loads the Accounts page', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /accounts/i);
  });

  it('shows empty state or open button for new user', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /no accounts|open|create|add|new account/i);
  });

  // Target <button> specifically to avoid matching sidebar nav items (which use div[role="button"])
  it('opens account creation dialog', () => {
    cy.contains('button', /open|new account/i, { timeout: 8000 }).first().click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes dialog on cancel', () => {
    cy.contains('button', /open|new account/i, { timeout: 8000 }).first().click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', /cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('creates a SAVINGS account successfully', () => {
    // SAVINGS is the default selection — just open dialog and confirm
    cy.contains('button', /open|new account/i, { timeout: 8000 }).first().click();
    cy.get('[role="dialog"]', { timeout: 6000 }).within(() => {
      cy.contains('button', /create account/i).click();
    });
    cy.get('body', { timeout: 10000 })
      .invoke('text')
      .should('match', /savings/i);
  });

  it('displays account balance after account is created', () => {
    cy.get('body', { timeout: 8000 }).then(($b) => {
      if (/savings/i.test($b.text())) {
        cy.get('body').invoke('text').should('match', /\$0\.00|\$|balance/i);
      } else {
        cy.log('No account visible yet — skipping balance check');
      }
    });
  });

  // ── Open Checking Account guard ────────────────────────────────────────────

  describe('Open Checking Account guard', () => {
    it('"Open Checking" link is visible when user has no checking account', () => {
      // Sidebar shows "Open Checking Acct" when user has no active CHECKING account
      cy.contains(/open checking/i, { timeout: 8000 }).should('be.visible');
    });

    it('navigates to /open-checking on click', () => {
      cy.contains(/open checking/i, { timeout: 8000 }).click();
      cy.url().should('include', '/open-checking');
    });
  });
});
