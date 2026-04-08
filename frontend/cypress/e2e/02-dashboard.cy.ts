// ─── E2E: Dashboard ───────────────────────────────────────────────────────────

describe('Dashboard', () => {
  const email = `dash_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Dash', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/dashboard');
  });

  it('shows the dashboard heading', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /dashboard|welcome|overview/i);
  });

  it('displays at least one summary card', () => {
    cy.get('.MuiCard-root, [class*="Card"]', { timeout: 8000 })
      .should('have.length.at.least', 1);
  });

  it('sidebar shows Accounts navigation link', () => {
    cy.contains(/^accounts$/i, { timeout: 8000 }).should('be.visible');
  });

  it('sidebar shows Transactions navigation link', () => {
    cy.contains(/^transactions$/i, { timeout: 8000 }).should('be.visible');
  });

  it('sidebar shows Payments navigation link', () => {
    cy.contains(/^payments$/i, { timeout: 8000 }).should('be.visible');
  });

  it('navigates to Accounts page from sidebar', () => {
    cy.contains(/^accounts$/i).click();
    cy.url().should('include', '/accounts');
  });

  it('navigates to Transactions page from sidebar', () => {
    cy.contains(/^transactions$/i).click();
    cy.url().should('include', '/transactions');
  });

  it('navigates to Payments page from sidebar', () => {
    cy.contains(/^payments$/i).click();
    cy.url().should('include', '/payments');
  });

  it('navigates to Credit Score page from sidebar', () => {
    cy.contains(/credit score/i).click();
    cy.url().should('include', '/credit-score');
  });
});
