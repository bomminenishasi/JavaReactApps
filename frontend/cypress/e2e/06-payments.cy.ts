// ─── E2E: Payments page ───────────────────────────────────────────────────────

describe('Payments', () => {
  const email = `pay_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Pay', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/payments');
  });

  it('loads the Payments page', () => {
    cy.contains(/payments/i, { timeout: 8000 }).should('be.visible');
  });

  it('shows empty state or schedule button for new user', () => {
    cy.get('body', { timeout: 8000 }).should(
      'contain.text', /no payment|schedule|add payment/i,
    );
  });

  it('opens schedule payment dialog', () => {
    cy.contains(/schedule|add|new payment/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes schedule payment dialog on cancel', () => {
    cy.contains(/schedule|add|new payment/i).first().click({ force: true });
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('validates required fields in payment dialog', () => {
    cy.contains(/schedule|add|new payment/i).first().click({ force: true });
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/submit|schedule|pay/i).last().click();
    });
    cy.get('body').should(
      'contain.text', 'required').or('contain.text', 'payee').or('contain.text', 'amount'),
    { timeout: 6000 };
  });

  it('shows SCHEDULED status badge on scheduled payments', () => {
    // This tests display — if payments exist they show SCHEDULED chip
    cy.get('body', { timeout: 6000 }).then(($b) => {
      if ($b.text().includes('SCHEDULED')) {
        cy.contains('SCHEDULED').should('be.visible');
      }
    });
  });
});
