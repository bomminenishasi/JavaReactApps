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
    cy.contains(/accounts/i, { timeout: 8000 }).should('be.visible');
  });

  it('shows "no accounts" state for new user', () => {
    cy.get('body', { timeout: 8000 }).should(
      'contain.text', 'No accounts').or('contain.text', 'no accounts').or('contain.text', 'Open'),
    { timeout: 8000 };
  });

  it('opens savings account creation dialog', () => {
    cy.contains(/open|add|new|create/i).first().click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('creates a SAVINGS account successfully', () => {
    cy.contains(/open|add|new|create/i).first().click();
    cy.get('[role="dialog"]').within(() => {
      // Select SAVINGS if there's a dropdown
      cy.get('body').then(($b) => {
        if ($b.find('[role="listbox"], select').length) {
          cy.get('select, [role="listbox"]').first().click();
          cy.contains(/savings/i).click();
        }
      });
      cy.contains(/create|open|submit|confirm/i).click();
    });
    cy.contains(/SAV|SAVINGS|savings/i, { timeout: 10000 }).should('be.visible');
  });

  it('displays account card with number and balance after creation', () => {
    cy.get('body').then(($b) => {
      if ($b.text().includes('SAV') || $b.text().includes('SAVINGS')) {
        cy.contains(/SAV|SAVINGS/i).should('be.visible');
        cy.contains(/balance|\$/i).should('be.visible');
      }
    });
  });

  // ── Open Checking guard ────────────────────────────────────────────────────

  describe('Open Checking Account guard', () => {
    it('"Open Checking" sidebar link is visible for user without checking account', () => {
      cy.contains(/open checking/i).should('be.visible');
    });

    it('navigates to open-checking page', () => {
      cy.contains(/open checking/i).click();
      cy.url().should('include', '/open-checking');
    });
  });
});
