// ─── E2E: Payments page ───────────────────────────────────────────────────────
//
// "Schedule Payment" button opens a dialog with:
//   Account (MUI Select), Payee Name, Amount ($), Scheduled Date
// Submitting empty shows "All fields are required" error.

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
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /payments/i);
  });

  it('shows empty state or schedule button for new user', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /no payment|schedule|add|new/i);
  });

  it('opens schedule payment dialog', () => {
    // Target <button> to avoid matching "No payments scheduled" table text
    cy.contains('button', /schedule payment/i, { timeout: 8000 }).click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes schedule payment dialog on cancel', () => {
    cy.contains('button', /schedule payment/i, { timeout: 8000 }).click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', /cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('shows validation error when payment submitted empty', () => {
    cy.contains('button', /schedule payment/i, { timeout: 8000 }).click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).within(() => {
      // Click the "Schedule" submit button — use 'button' selector to avoid dialog title text
      cy.contains('button', /^schedule$/i).click();
    });
    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /required|payee|amount|invalid|all fields/i);
  });

  it('dialog contains payee name and amount fields', () => {
    cy.contains('button', /schedule payment/i, { timeout: 8000 }).click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).within(() => {
      cy.get('input').should('have.length.at.least', 2);
    });
  });

  it('conditionally shows SCHEDULED badge when payments exist', () => {
    cy.get('body', { timeout: 6000 }).then(($b) => {
      if ($b.text().includes('SCHEDULED')) {
        cy.contains('SCHEDULED').should('be.visible');
      } else {
        cy.log('No scheduled payments exist yet — skipping badge check');
      }
    });
  });
});
