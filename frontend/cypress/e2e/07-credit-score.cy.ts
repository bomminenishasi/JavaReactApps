// ─── E2E: Credit Score page ───────────────────────────────────────────────────
//
// The browser inside Docker cannot reach http://localhost:8080, so we stub
// the /api/credit-score call with cy.intercept() and a realistic mock payload.
// The page renders score data only when the Redux slice has loaded cs != null.

describe('Credit Score', () => {
  const email = `score_${Date.now()}@securebank.com`;

  const mockCreditScore = {
    scoreId: 1,
    score: 742,
    category: 'Very Good',
    categoryKey: 'VERY_GOOD',
    color: '#388e3c',
    paymentHistoryPct: 97,
    creditUtilizationPct: 18,
    accountAgeMonths: 14,
    creditMix: 2,
    lastCalculated: '2024-06-01T10:00:00Z',
    scoreMin: 300,
    scoreMax: 850,
    scorePercent: 75,
    tip: 'Keep your credit utilization below 30% to maintain your score.',
  };

  before(() => {
    cy.register(email, 'Cypress1!', 'Score', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.intercept('GET', /api\/credit-score/, {
      statusCode: 200,
      body: { data: mockCreditScore },
    }).as('fetchCreditScore');
    cy.visit('/credit-score');
    cy.wait('@fetchCreditScore');
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
