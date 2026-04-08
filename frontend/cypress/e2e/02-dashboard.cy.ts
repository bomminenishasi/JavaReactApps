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
    cy.contains(/dashboard|welcome|overview/i, { timeout: 8000 }).should('be.visible');
  });

  it('displays summary cards (balance, accounts, etc.)', () => {
    // At least one card/stat section should be visible
    cy.get('.MuiCard-root, [class*="card"], [class*="Card"]', { timeout: 8000 })
      .should('have.length.at.least', 1);
  });

  it('sidebar navigation links are visible', () => {
    cy.contains(/accounts/i).should('be.visible');
    cy.contains(/transactions/i).should('be.visible');
    cy.contains(/payments/i).should('be.visible');
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
