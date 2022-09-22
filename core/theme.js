/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a theme.
 */
'use strict';

goog.provide('Blockly.Theme');

goog.require('Blockly.registry');
goog.require('Blockly.utils');


/**
 * Class for a theme.
 * @param {string} name Theme name.
 * @constructor
 */
Blockly.Theme = function(name) {

  /**
   * The theme name. This can be used to reference a specific theme in CSS.
   * @type {string}
   */
  this.name = name;

  // Register the theme by name.
  Blockly.registry.register(Blockly.registry.Type.THEME, name, this);
};

/**
 * A block style.
 * @typedef {{
 *            colourPrimary:string,
 *            colourSecondary:string,
 *            colourTertiary:string,
 *            hat:string
 *          }}
 */
Blockly.Theme.BlockStyle;

/**
 * Gets the class name that identifies this theme.
 * @return {string} The CSS class name.
 * @package
 */
Blockly.Theme.prototype.getClassName = function() {
  return this.name + '-theme';
};
