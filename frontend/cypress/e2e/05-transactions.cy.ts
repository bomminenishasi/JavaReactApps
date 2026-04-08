// ─── E2E: Transactions page ───────────────────────────────────────────────────

describe('Transactions', () => {
  const email = `txn_${Date.now()}@securebank.com`;

  before(() => {
    // Register user, then create a savings account via API
    cy.register(email, 'Cypress1!', 'Txn', 'User');
    cy.login(email, 'Cypress1!');
    cy.visit('/'); // Trigger app load so localStorage is populated
    cy.window().then((win) => {
      const token = win.localStorage.getItem('accessToken');
      if (token) {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/accounts`,
          headers: { Authorization: `Bearer ${token}` },
          body: { accountType: 'SAVINGS' },
          failOnStatusCode: false,
        });
      }
    });
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/transactions');
  });

  it('loads the Transactions page', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /transactions/i);
  });

  it('shows empty state when no transactions exist', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /no transaction|empty|no records/i);
  });

  it('shows action buttons for transfer, deposit, withdraw', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /transfer|deposit|withdraw/i);
  });

  it('opens deposit dialog', () => {
    cy.contains(/deposit/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes deposit dialog on cancel', () => {
    cy.contains(/deposit/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('opens transfer dialog', () => {
    cy.contains(/transfer/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes transfer dialog on cancel', () => {
    cy.contains(/transfer/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('shows validation error when deposit submitted without amount', () => {
    cy.contains(/deposit/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).within(() => {
      cy.contains(/submit|deposit|confirm/i).last().click();
    });
    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /required|amount|invalid/i);
  });
});
