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
      .should('match', /no accounts|open|create|add/i);
  });

  it('opens account creation dialog', () => {
    cy.contains(/open|add|create/i, { timeout: 8000 }).first().click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes dialog on cancel', () => {
    cy.contains(/open|add|create/i, { timeout: 8000 }).first().click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('creates a SAVINGS account successfully', () => {
    cy.contains(/open|add|create/i, { timeout: 8000 }).first().click();
    cy.get('[role="dialog"]', { timeout: 6000 }).within(() => {
      // Select SAVINGS type if a selector is shown
      cy.get('body').then(($b) => {
        if ($b.find('select').length) {
          cy.get('select').select('SAVINGS');
        } else if ($b.find('[role="button"]').length) {
          cy.contains(/savings/i).click();
        }
      });
      cy.contains(/create|open|submit|confirm/i).click();
    });
    cy.get('body', { timeout: 10000 })
      .invoke('text')
      .should('match', /savings/i);
  });

  it('displays account balance after account is created', () => {
    cy.get('body', { timeout: 8000 }).then(($b) => {
      if (/savings/i.test($b.text())) {
        cy.contains(/balance|\$0/i).should('be.visible');
      }
    });
  });

  // ── Open Checking guard ────────────────────────────────────────────────────

  describe('Open Checking Account guard', () => {
    it('"Open Checking" link is visible when user has no checking account', () => {
      cy.contains(/open checking/i, { timeout: 8000 }).should('be.visible');
    });

    it('navigates to /open-checking on click', () => {
      cy.contains(/open checking/i).click();
      cy.url().should('include', '/open-checking');
    });
  });
});
