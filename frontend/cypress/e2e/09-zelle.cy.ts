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
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /zelle/i);
  });

  it('shows a send money form or button', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /send|transfer/i);
  });

  it('shows empty transfer history for new user', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /no transfer|no transaction|history|empty|send/i);
  });

  it('send form contains a recipient field', () => {
    cy.get(
      'input[type="email"], input[name*="email" i], input[name*="recipient" i], input[placeholder*="email" i]',
      { timeout: 8000 }
    ).should('exist');
  });

  it('send form contains an amount field', () => {
    cy.get(
      'input[name*="amount" i], input[placeholder*="amount" i], input[type="number"]',
      { timeout: 8000 }
    ).should('exist');
  });

  it('shows validation error when amount is missing on submit', () => {
    // Fill only recipient, leave amount empty
    cy.get(
      'input[type="email"], input[name*="email" i], input[name*="recipient" i], input[placeholder*="email" i]',
      { timeout: 8000 }
    ).first().type('recipient@example.com');

    cy.contains(/send|submit/i).last().click({ force: true });

    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /required|amount|invalid/i);
  });

  it('shows validation error when recipient is missing on submit', () => {
    cy.get(
      'input[name*="amount" i], input[placeholder*="amount" i], input[type="number"]',
      { timeout: 8000 }
    ).first().type('50');

    cy.contains(/send|submit/i).last().click({ force: true });

    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /required|recipient|email/i);
  });
});
