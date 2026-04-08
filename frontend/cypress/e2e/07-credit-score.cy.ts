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

  it('loads the Credit Score page', () => {
    cy.contains(/credit score/i, { timeout: 10000 }).should('be.visible');
  });

  it('displays a numeric score between 300 and 850', () => {
    cy.get('body', { timeout: 10000 }).should('contain.text', /[3-8]\d\d/);
    cy.contains(/[3-8]\d\d/).then(($el) => {
      const score = parseInt($el.text().trim(), 10);
      expect(score).to.be.within(300, 850);
    });
  });

  it('shows score category label', () => {
    cy.get('body', { timeout: 10000 }).should(
      'contain.text', /Poor|Fair|Good|Very Good|Exceptional/i,
    );
  });

  it('shows the four score factor labels', () => {
    cy.contains(/payment history/i, { timeout: 10000 }).should('be.visible');
    cy.contains(/credit utilization/i).should('be.visible');
    cy.contains(/account age/i).should('be.visible');
    cy.contains(/credit mix/i).should('be.visible');
  });

  it('shows personalised tip text', () => {
    cy.contains(/tip|improve|payment|balance|keep/i, { timeout: 10000 }).should('be.visible');
  });

  it('displays last updated timestamp', () => {
    cy.contains(/last updated|updated/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows score range 300-850', () => {
    cy.contains(/300/i, { timeout: 8000 }).should('be.visible');
    cy.contains(/850/i).should('be.visible');
  });

  it('shows score category color chip', () => {
    // The chip/badge with the category name should be visible
    cy.get('.MuiChip-root, [class*="chip"], [class*="Chip"]', { timeout: 8000 })
      .should('have.length.at.least', 1);
  });
});
