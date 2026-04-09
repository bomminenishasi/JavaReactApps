// ─── E2E: Open Checking Account wizard ───────────────────────────────────────
//
// Wizard steps:
//   0 – Personal Info  (firstName, lastName, dateOfBirth, ssn, countryOfCitizenship)
//   1 – Contact Info   (phoneNumber, streetAddress, city, state, zipCode)
//   2 – Financial Info (annualIncome, employmentStatus)
//   3 – Account Features (info only, "Looks Good" button)
//   4 – Review & Confirm (checkbox + "Open My Checking Account" button)
//
// countryOfCitizenship, state, employmentStatus are MUI Selects —
// interaction: click the .MuiSelect-select div, then pick [role="option"].

describe('Open Checking Account Wizard', () => {
  const email = `chk_${Date.now()}@securebank.com`;

  before(() => {
    cy.register(email, 'Cypress1!', 'Check', 'User');
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    cy.visit('/open-checking');
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────

  // Fill Step 0 – Personal Info
  // firstName / lastName are pre-filled from Redux auth state (user registered as Check/User)
  const fillStep0 = () => {
    cy.get('input[type="date"]', { timeout: 6000 }).first().type('1990-01-15');
    // SSN: type raw digits — formatSSN auto-formats to 123-45-6789
    cy.contains('label', /social security|ssn/i)
      .parent().find('input').first().clear().type('123456789');
    // Country of Citizenship — MUI Select (only one .MuiSelect-select on this step)
    cy.get('.MuiSelect-select').first().click();
    cy.get('[role="option"]').contains('United States').click();
  };

  // Fill Step 1 – Contact Info
  const fillStep1 = () => {
    // Phone: type raw digits — formatPhone auto-formats to (417) 123-4567
    cy.contains('label', /phone/i, { timeout: 6000 })
      .parent().find('input').first().clear().type('4171234567');
    cy.contains('label', /street/i)
      .parent().find('input').first().clear().type('123 Main St');
    cy.contains('label', /^city$/i)
      .parent().find('input').first().clear().type('Newark');
    // State — MUI Select
    cy.contains('label', /^state$/i)
      .parent().find('.MuiSelect-select').click();
    cy.get('[role="option"]').contains('NJ').click();
    cy.contains('label', /zip/i)
      .parent().find('input').first().clear().type('07306');
  };

  // Fill Step 2 – Financial Info
  const fillStep2 = () => {
    cy.contains('label', /annual income/i, { timeout: 6000 })
      .parent().find('input').first().clear().type('60000');
    // Employment Status — MUI Select
    cy.get('.MuiSelect-select').first().click();
    cy.get('[role="option"]').first().click(); // Employed (Full-time / Part-time)
  };

  // ── Tests ────────────────────────────────────────────────────────────────────

  it('renders the multi-step wizard', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /personal|checking|open/i);
    cy.get('input').should('have.length.at.least', 1);
  });

  it('shows validation error when required fields are empty', () => {
    cy.contains('button', /continue/i, { timeout: 8000 }).first().click();
    cy.get('body')
      .invoke('text')
      .should('match', /required|enter|must be/i);
  });

  it('step 1: fills personal information and advances to Contact Info', () => {
    fillStep0();
    cy.contains('button', /continue/i).click();
    // Now on Step 1 – Contact Info
    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /phone|contact|address/i);
  });

  it('step 2: advances through contact info to Financial Info', () => {
    fillStep0();
    cy.contains('button', /continue/i).click();

    fillStep1();
    cy.contains('button', /continue/i, { timeout: 6000 }).click();

    // Now on Step 2 – Financial Info
    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /income|employment|financial/i);
  });

  it('complete wizard creates checking account and shows success', () => {
    // Step 0 – Personal Info
    fillStep0();
    cy.contains('button', /continue/i).click();

    // Step 1 – Contact Info
    fillStep1();
    cy.contains('button', /continue/i, { timeout: 6000 }).click();

    // Step 2 – Financial Info
    fillStep2();
    cy.contains('button', /continue/i, { timeout: 6000 }).click();

    // Step 3 – Account Features (no inputs, button says "Looks Good")
    cy.contains('button', /looks good/i, { timeout: 6000 }).click();

    // Step 4 – Review & Confirm
    cy.get('input[type="checkbox"]', { timeout: 6000 }).check({ force: true });
    cy.contains('button', /open my checking/i, { timeout: 6000 }).click();

    // Should see success screen or redirect to accounts
    cy.get('body', { timeout: 15000 })
      .invoke('text')
      .should('match', /account opened|congratulations|accounts/i);
  });
});
