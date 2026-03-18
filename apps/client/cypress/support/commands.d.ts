/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<_Subject = unknown> {
    getByTestId(value: string): Chainable<JQuery<HTMLElement>>
  }
}
