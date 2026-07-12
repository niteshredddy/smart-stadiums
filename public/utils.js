/**
 * Core Utilities for StadiumAI Hub
 * Provides shared DOM manipulation, formatting, and DOM update helpers
 */
(function () {
  'use strict';

  const Utils = {
    /**
     * Capitalizes the first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize: (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Updates text content of a DOM element if it exists
     * @param {string} elementId - ID of the element
     * @param {string} text - Text to set
     */
    updateText: (elementId, text) => {
      const el = document.getElementById(elementId);
      if (el) el.textContent = text;
    },

    /**
     * Toggles a CSS class on an element based on a condition
     * @param {HTMLElement} element - The DOM element
     * @param {string} className - The class to toggle
     * @param {boolean} condition - True to add, false to remove
     */
    toggleClass: (element, className, condition) => {
      if (element) {
        element.classList.toggle(className, condition);
      }
    },

    /**
     * Set inner HTML of an element if it exists
     * @param {string} elementId - ID of the element
     * @param {string} html - HTML string
     */
    updateHTML: (elementId, html) => {
      const el = document.getElementById(elementId);
      if (el) el.innerHTML = html;
    },

    /**
     * Creates a standardized DOM element with attributes
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Map of attributes (e.g. { class: 'btn', role: 'button' })
     * @param {string} [innerHTML] - Optional inner HTML
     * @returns {HTMLElement} The created element
     */
    createElement: (tag, attributes = {}, innerHTML = '') => {
      const el = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          el.className = value;
        } else {
          el.setAttribute(key, value);
        }
      });
      if (innerHTML) el.innerHTML = innerHTML;
      return el;
    },
  };

  // Export globally
  window.Utils = Utils;
})();
