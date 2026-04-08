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
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /personal|checking|open/i);
    cy.get('input').should('have.length.at.least', 1);
  });

  it('shows validation error when required fields are empty', () => {
    cy.contains(/next|continue/i, { timeout: 8000 }).first().click();
    cy.get('body')
      .invoke('text')
      .should('match', /required|enter|field/i);
  });

  it('step 1: fills personal information and advances', () => {
    cy.get('input[name="firstName"], input[placeholder*="first" i]').first()
      .clear().type('Check');
    cy.get('input[name="lastName"], input[placeholder*="last" i]').first()
      .clear().type('User');
    cy.get('input[name="dateOfBirth"], input[type="date"]').first()
      .type('1990-01-15');
    cy.get('input[name="ssn"], input[placeholder*="ssn" i]').first()
      .type('123-45-6789');
    cy.get('input[name="phoneNumber"], input[type="tel"]').first()
      .type('4171234567');
    cy.get('input[name="countryOfCitizenship"], input[placeholder*="country" i]').first()
      .type('USA');
    cy.contains(/next|continue/i).first().click({ force: true });
    // Should now be on step 2 (address/income)
    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /address|income|financial/i);
  });

  it('step 2: fills address and financial information', () => {
    // Step 1 - Personal
    cy.get('input[name="firstName"], input[placeholder*="first" i]').first().type('Check');
    cy.get('input[name="lastName"], input[placeholder*="last" i]').first().type('User');
    cy.get('input[name="dateOfBirth"], input[type="date"]').first().type('1990-01-15');
    cy.get('input[name="ssn"], input[placeholder*="ssn" i]').first().type('123-45-6789');
    cy.get('input[name="phoneNumber"], input[type="tel"]').first().type('4171234567');
    cy.get('input[name="countryOfCitizenship"], input[placeholder*="country" i]').first().type('USA');
    cy.contains(/next|continue/i).first().click({ force: true });

    // Step 2 - Address
    cy.get('input[name="streetAddress"], input[placeholder*="street" i]', { timeout: 6000 })
      .first().type('123 Main St');
    cy.get('input[name="city"]').first().type('Newark');
    cy.get('input[name="state"]').first().type('NJ');
    cy.get('input[name="zipCode"], input[placeholder*="zip" i]').first().type('07306');
    cy.get('input[name="annualIncome"], input[placeholder*="income" i]').first().type('60000');

    // Employment status may be a select or text input
    cy.get('body').then(($b) => {
      if ($b.find('select[name="employmentStatus"]').length) {
        cy.get('select[name="employmentStatus"]').select('EMPLOYED');
      } else {
        cy.get('input[name="employmentStatus"], input[placeholder*="employ" i]')
          .first().type('EMPLOYED');
      }
    });

    cy.contains(/next|continue/i).first().click({ force: true });

    // Should be on step 3 (review/terms)
    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /review|terms|confirm/i);
  });

  it('complete wizard creates checking account and redirects', () => {
    // Step 1
    cy.get('input[name="firstName"], input[placeholder*="first" i]').first().type('Check');
    cy.get('input[name="lastName"], input[placeholder*="last" i]').first().type('User');
    cy.get('input[name="dateOfBirth"], input[type="date"]').first().type('1990-01-15');
    cy.get('input[name="ssn"], input[placeholder*="ssn" i]').first().type('123-45-6789');
    cy.get('input[name="phoneNumber"], input[type="tel"]').first().type('4171234567');
    cy.get('input[name="countryOfCitizenship"], input[placeholder*="country" i]').first().type('USA');
    cy.contains(/next|continue/i).first().click({ force: true });

    // Step 2
    cy.get('input[name="streetAddress"], input[placeholder*="street" i]', { timeout: 6000 })
      .first().type('123 Main St');
    cy.get('input[name="city"]').first().type('Newark');
    cy.get('input[name="state"]').first().type('NJ');
    cy.get('input[name="zipCode"], input[placeholder*="zip" i]').first().type('07306');
    cy.get('input[name="annualIncome"], input[placeholder*="income" i]').first().type('60000');
    cy.get('body').then(($b) => {
      if ($b.find('select[name="employmentStatus"]').length) {
        cy.get('select[name="employmentStatus"]').select('EMPLOYED');
      } else {
        cy.get('input[name="employmentStatus"], input[placeholder*="employ" i]')
          .first().type('EMPLOYED');
      }
    });
    cy.contains(/next|continue/i).first().click({ force: true });

    // Step 3 - Terms
    cy.get('input[type="checkbox"]', { timeout: 6000 }).last().check({ force: true });
    cy.contains(/submit|open account|confirm/i, { timeout: 6000 }).last().click({ force: true });

    cy.url({ timeout: 15000 }).should('match', /accounts|dashboard/);
  });
});
