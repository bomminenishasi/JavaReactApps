// Global Cypress support file — runs before every spec

import './commands';

// Suppress uncaught exception errors from the app under test
Cypress.on('uncaught:exception', (_err, _runnable) => false);

// Log test names to Cypress dashboard
beforeEach(() => {
  cy.log(`Running: ${Cypress.currentTest.titlePath.join(' > ')}`);
});
