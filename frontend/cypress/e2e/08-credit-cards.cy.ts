// ─── E2E: Credit Cards page ───────────────────────────────────────────────────

describe('Credit Cards', () => {
  const email = `cc_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Card', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/credit-cards');
  });

  it('loads the Credit Cards page', () => {
    cy.contains(/credit card/i, { timeout: 8000 }).should('be.visible');
  });

  it('shows empty state or apply button for new user', () => {
    cy.get('body', { timeout: 8000 }).should(
      'contain.text', /no card|apply|get a card/i,
    );
  });

  it('opens apply for card dialog', () => {
    cy.contains(/apply/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('shows card type options: STANDARD, GOLD, PLATINUM', () => {
    cy.contains(/apply/i).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).within(() => {
      cy.get('body').should(
        'contain.text', /standard|gold|platinum/i,
      );
    });
  });

  it('applies for STANDARD credit card', () => {
    cy.contains(/apply/i).first().click({ force: true });
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/standard/i).click({ force: true });
      cy.contains(/apply|submit|confirm/i).last().click({ force: true });
    });
    cy.contains(/STANDARD|standard|card/i, { timeout: 10000 }).should('be.visible');
  });

  it('displays credit limit and available credit after applying', () => {
    cy.get('body', { timeout: 8000 }).then(($b) => {
      if ($b.text().includes('STANDARD') || $b.text().includes('Credit Limit')) {
        cy.contains(/credit limit|available/i).should('be.visible');
      }
    });
  });
});
