/// <reference types="cypress" />

Cypress.Commands.add('getByTestId', (value: string) =>
  cy.get(`[data-testid="${value}"]`),
)
