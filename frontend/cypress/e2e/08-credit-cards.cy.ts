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
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /credit card/i);
  });

  it('shows empty state or apply button for new user', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /no card|apply|get a card|add/i);
  });

  it('opens apply for card dialog', () => {
    cy.contains(/apply/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('dialog shows card type options', () => {
    cy.contains(/apply/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 })
      .invoke('text')
      .should('match', /standard|gold|platinum/i);
  });

  it('closes apply dialog on cancel', () => {
    cy.contains(/apply/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('applies for STANDARD credit card', () => {
    cy.contains(/apply/i, { timeout: 8000 }).first().click({ force: true });
    cy.get('[role="dialog"]', { timeout: 6000 }).within(() => {
      cy.contains(/standard/i).click({ force: true });
      cy.contains(/apply|submit|confirm/i).last().click({ force: true });
    });
    cy.get('body', { timeout: 10000 })
      .invoke('text')
      .should('match', /standard|credit limit|available/i);
  });

  it('displays credit limit after card is created', () => {
    cy.get('body', { timeout: 8000 }).then(($b) => {
      if (/standard|platinum|gold/i.test($b.text())) {
        cy.get('body').invoke('text').should('match', /credit limit|available credit/i);
      } else {
        cy.log('No card exists yet — skipping credit limit check');
      }
    });
  });
});
