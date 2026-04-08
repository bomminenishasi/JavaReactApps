// ─── E2E: Transactions page ───────────────────────────────────────────────────

describe('Transactions', () => {
  const email = `txn_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Txn', 'User');
    // Create a savings account via API after login
    cy.login(email, 'Cypress1!');
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/accounts`,
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      body: { accountType: 'SAVINGS' },
      failOnStatusCode: false,
    });
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/transactions');
  });

  it('loads the Transactions page', () => {
    cy.contains(/transactions/i, { timeout: 8000 }).should('be.visible');
  });

  it('shows empty state when no transactions exist', () => {
    cy.get('body', { timeout: 8000 }).should(
      'contain.text', 'no transaction').or('contain.text', 'No transaction').or('contain.text', 'empty'),
    { timeout: 8000 };
  });

  it('shows transfer, deposit, withdraw action buttons', () => {
    cy.get('body', { timeout: 8000 }).should(
      'contain.text', /transfer|deposit|withdraw/i,
    );
  });

  it('opens deposit dialog', () => {
    cy.contains(/deposit/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes deposit dialog on cancel', () => {
    cy.contains(/deposit/i).first().click({ force: true });
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('opens transfer dialog', () => {
    cy.contains(/transfer/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('validates amount field in deposit dialog', () => {
    cy.contains(/deposit/i).first().click({ force: true });
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/submit|deposit|confirm/i).click();
    });
    cy.get('body').should('contain.text', 'required').or('contain.text', 'amount');
  });
});
