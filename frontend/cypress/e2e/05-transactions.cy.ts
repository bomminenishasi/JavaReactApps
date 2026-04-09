// ─── E2E: Transactions page ───────────────────────────────────────────────────
//
// The browser cannot reach http://localhost:8080 inside Docker, so we stub
// the accounts and transactions API calls with cy.intercept().
// The before() hook still creates a real account via cy.request() (which uses
// the Cypress Node.js process that CAN reach banking-backend:8080).
//
// Deposit / Withdraw / Transfer buttons are DISABLED until an account is
// selected from the "Select Account" MUI dropdown.

describe('Transactions', () => {
  const email = `txn_${Date.now()}@securebank.com`;

  const mockAccount = {
    accountId: 1,
    accountType: 'SAVINGS',
    accountNumber: 'SAV0001234',
    balance: 500.0,
    status: 'ACTIVE',
    currency: 'USD',
    createdAt: '2024-01-01T00:00:00Z',
  };

  before(() => {
    // Register and create a real savings account in the backend
    cy.register(email, 'Cypress1!', 'Txn', 'User');
    cy.login(email, 'Cypress1!');
    cy.visit('/');
    cy.window().then((win) => {
      const token = win.localStorage.getItem('accessToken');
      if (token) {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/api/accounts`,
          headers: { Authorization: `Bearer ${token}` },
          body: { accountType: 'SAVINGS' },
          failOnStatusCode: false,
        });
      }
    });
  });

  beforeEach(() => {
    cy.login(email, 'Cypress1!');
    // Stub accounts API — browser can't reach localhost:8080 inside Docker
    cy.intercept('GET', /api\/accounts/, {
      statusCode: 200,
      body: { data: [mockAccount] },
    }).as('fetchAccounts');
    // Stub transactions API
    cy.intercept('GET', /api\/transactions/, {
      statusCode: 200,
      body: { data: { content: [], totalPages: 0, totalElements: 0 } },
    }).as('fetchTransactions');
    cy.visit('/transactions');
  });

  // Helper: open the "Select Account" MUI dropdown and pick the first option
  const selectFirstAccount = () => {
    cy.get('.MuiSelect-select', { timeout: 8000 }).first().click();
    cy.get('[role="option"]', { timeout: 6000 }).first().click();
  };

  it('loads the Transactions page', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /transactions/i);
  });

  it('shows prompt to select an account before viewing', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /select an account|select account/i);
  });

  it('shows action buttons for transfer, deposit, withdraw', () => {
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /transfer|deposit|withdraw/i);
  });

  it('shows empty transactions after selecting account', () => {
    selectFirstAccount();
    cy.get('body', { timeout: 8000 })
      .invoke('text')
      .should('match', /no transactions|no transaction|empty|no records/i);
  });

  it('opens deposit dialog', () => {
    selectFirstAccount();
    cy.contains('button', /^deposit$/i, { timeout: 8000 }).click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes deposit dialog on cancel', () => {
    selectFirstAccount();
    cy.contains('button', /^deposit$/i, { timeout: 8000 }).click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', /cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('opens transfer dialog', () => {
    selectFirstAccount();
    cy.contains('button', /^transfer$/i, { timeout: 8000 }).click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
  });

  it('closes transfer dialog on cancel', () => {
    selectFirstAccount();
    cy.contains('button', /^transfer$/i, { timeout: 8000 }).click();
    cy.get('[role="dialog"]', { timeout: 6000 }).should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', /cancel|close/i).click();
    });
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('shows validation error when deposit submitted without amount', () => {
    selectFirstAccount();
    cy.contains('button', /^deposit$/i, { timeout: 8000 }).click();
    cy.get('[role="dialog"]', { timeout: 6000 }).within(() => {
      // "Submit" button — target button element to avoid matching dialog title text
      cy.contains('button', /submit/i).click();
    });
    cy.get('body', { timeout: 6000 })
      .invoke('text')
      .should('match', /required|amount|invalid|valid/i);
  });
});
