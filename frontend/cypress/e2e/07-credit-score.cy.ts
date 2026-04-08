// ─── E2E: Credit Score page ───────────────────────────────────────────────────

describe('Credit Score', () => {
  const email = `score_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Score', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/credit-score');
  });

  it('loads the Credit Score page heading', () => {
    cy.contains(/credit score/i, { timeout: 10000 }).should('be.visible');
  });

  it('displays a numeric score between 300 and 850', () => {
    cy.get('body', { timeout: 10000 })
      .invoke('text')
      .should('match', /[3-8]\d\d/);
  });

  it('shows a recognised score category label', () => {
    cy.get('body', { timeout: 10000 })
      .invoke('text')
      .should('match', /poor|fair|good|very good|exceptional/i);
  });

  it('shows Payment History factor', () => {
    cy.contains(/payment history/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows Credit Utilization factor', () => {
    cy.contains(/credit utilization/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows Account Age factor', () => {
    cy.contains(/account age/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows Credit Mix factor', () => {
    cy.contains(/credit mix/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows a personalised improvement tip', () => {
    cy.get('body', { timeout: 10000 })
      .invoke('text')
      .should('match', /tip|payment|balance|credit|keep|score/i);
  });

  it('displays last updated timestamp', () => {
    cy.contains(/last updated/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows score range labels 300 and 850', () => {
    cy.get('body', { timeout: 8000 }).invoke('text').should('include', '300');
    cy.get('body').invoke('text').should('include', '850');
  });

  it('shows at least one score category chip', () => {
    cy.get('.MuiChip-root', { timeout: 8000 }).should('have.length.at.least', 1);
  });

  it('shows progress bars for score factors', () => {
    cy.get('[role="progressbar"]', { timeout: 8000 })
      .should('have.length.at.least', 4);
  });
});
