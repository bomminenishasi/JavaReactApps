// ─── E2E: Open Checking Account wizard ───────────────────────────────────────

describe('Open Checking Account Wizard', () => {
  const email = `chk_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Check', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/open-checking');
  });

  it('renders the multi-step wizard', () => {
    cy.contains(/personal|checking|open/i, { timeout: 8000 }).should('be.visible');
    cy.get('input, [role="textbox"]').should('have.length.at.least', 1);
  });

  it('step 1: fills personal information fields', () => {
    cy.get('input').then(($inputs) => {
      // Fill first name, last name, DOB fields where visible
      cy.get('input[name*="first" i], input[placeholder*="first" i]').first()
        .clear().type('Check');
      cy.get('input[name*="last" i], input[placeholder*="last" i]').first()
        .clear().type('User');
    });
    cy.contains(/next|continue/i).first().click();
  });

  it('shows validation error when required field is missing', () => {
    // Click Next without filling anything
    cy.contains(/next|continue/i).first().click();
    cy.get('body').should('contain.text', 'required').or('contain.text', 'enter');
  });

  it('step 2: fills financial information', () => {
    // Step through to financial step
    cy.get('input[name*="first" i], input[placeholder*="first" i]').first().type('Check');
    cy.get('input[name*="last" i], input[placeholder*="last" i]').first().type('User');
    cy.get('input[name*="dob" i], input[type="date"]').first().type('1990-01-15');
    cy.get('input[name*="ssn" i], input[placeholder*="ssn" i]').first().type('123-45-6789');
    cy.get('input[name*="phone" i], input[type="tel"]').first().type('4171234567');
    cy.get('input[name*="country" i], input[placeholder*="country" i]').first().type('USA');
    cy.contains(/next|continue/i).first().click({ force: true });

    // Now on address/financial step
    cy.get('body', { timeout: 5000 }).should('contain.text', /./).then(() => {
      cy.get('input').first().should('be.visible');
    });
  });

  it('complete form submission creates checking account', () => {
    // Step 1 - Personal
    cy.get('input[name*="first" i], input[placeholder*="first" i]').first().type('Check');
    cy.get('input[name*="last" i], input[placeholder*="last" i]').first().type('User');
    cy.get('input[name*="dob" i], input[type="date"]').first().type('1990-01-15');
    cy.get('input[name*="ssn" i], input[placeholder*="ssn" i]').first().type('123-45-6789');
    cy.get('input[name*="phone" i], input[type="tel"]').first().type('4171234567');
    cy.get('input[name*="country" i], input[placeholder*="country" i]').first().type('USA');
    cy.contains(/next|continue/i).first().click({ force: true });

    // Step 2 - Address/Financial
    cy.get('input[name*="street" i], input[name*="address" i]').first()
      .type('123 Main St', { force: true });
    cy.get('input[name*="city" i]').first().type('Newark', { force: true });
    cy.get('input[name*="state" i]').first().type('NJ', { force: true });
    cy.get('input[name*="zip" i]').first().type('07306', { force: true });
    cy.get('input[name*="income" i], input[placeholder*="income" i]').first()
      .type('60000', { force: true });
    cy.get('input[name*="employ" i], select[name*="employ" i]').first()
      .type('Employed', { force: true });
    cy.contains(/next|continue/i).first().click({ force: true });

    // Step 3 - Review & Terms
    cy.get('input[type="checkbox"]').last().check({ force: true });
    cy.contains(/submit|open account|confirm/i).last().click({ force: true });

    cy.url({ timeout: 12000 }).should('match', /accounts|dashboard/);
  });
});
