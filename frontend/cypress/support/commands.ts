// Custom Cypress commands

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      register(email: string, password: string, firstName: string, lastName: string): Chainable<void>;
      logout(): Chainable<void>;
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

/**
 * Login via API (bypasses UI — much faster for test setup)
 */
Cypress.Commands.add('login', (
  email = Cypress.env('testUser'),
  password = Cypress.env('testPassword'),
) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200 && res.body.data?.accessToken) {
      localStorage.setItem('accessToken', res.body.data.accessToken);
      localStorage.setItem('refreshToken', res.body.data.refreshToken);
      localStorage.setItem('user', JSON.stringify({
        email: res.body.data.email,
        firstName: res.body.data.firstName,
        lastName: res.body.data.lastName,
        role: res.body.data.role,
      }));
    }
  });
});

/**
 * Login as admin via API
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login(Cypress.env('adminUser'), Cypress.env('adminPassword'));
});

/**
 * Register a new user via API
 */
Cypress.Commands.add('register', (email, password, firstName, lastName) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/register`,
    body: { email, password, firstName, lastName },
    failOnStatusCode: false,
  });
});

/**
 * Logout: clear localStorage and visit login page
 */
Cypress.Commands.add('logout', () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/auth/logout`,
      body: { refreshToken },
      failOnStatusCode: false,
    });
  }
  cy.clearLocalStorage();
  cy.visit('/login');
});

/**
 * Get element by data-testid attribute
 */
Cypress.Commands.add('getByTestId', (id: string) => {
  return cy.get(`[data-testid="${id}"]`);
});

export {};
