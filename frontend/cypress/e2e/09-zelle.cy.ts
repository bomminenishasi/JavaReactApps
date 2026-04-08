// ─── E2E: Zelle page ──────────────────────────────────────────────────────────

describe('Zelle', () => {
  const email = `zelle_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Zelle', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/zelle');
  });

  it('loads the Zelle page', () => {
    cy.contains(/zelle/i, { timeout: 8000 }).should('be.visible');
  });

  it('shows send money form', () => {
    cy.contains(/send/i, { timeout: 8000 }).should('be.visible');
    cy.get('input[type="email"], input[name*="email" i], input[placeholder*="email" i]')
      .should('exist');
  });

  it('shows empty transfer history for new user', () => {
    cy.get('body', { timeout: 8000 }).should(
      'contain.text', /no transfer|no transaction|history|empty/i,
    );
  });

  it('validates recipient email field', () => {
    cy.contains(/send/i).first().click({ force: true });

    // Fill amount but not recipient
    cy.get('input[name*="amount" i], input[placeholder*="amount" i]').first()
      .type('50', { force: true });
    cy.contains(/send|submit/i).last().click({ force: true });

    cy.get('body', { timeout: 6000 }).should(
      'contain.text', 'required').or('contain.text', 'email').or('contain.text', 'recipient'),
    { timeout: 6000 };
  });

  it('validates amount is required', () => {
    cy.get('input[type="email"], input[name*="email" i]').first()
      .type('recipient@example.com', { force: true });
    cy.contains(/send|submit/i).last().click({ force: true });

    cy.get('body', { timeout: 6000 }).should(
      'contain.text', 'required').or('contain.text', 'amount'),
    { timeout: 6000 };
  });
});
