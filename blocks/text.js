/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Text blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Constants.Text');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Extensions');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldTextInput');


Blockly.defineBlocksWithJsonArray([
  // Block for text value
  {
    "type": "text",
    "message0": "%1",
    "args0": [{
      "type": "field_input",
      "name": "TEXT",
      "text": ""
    }],
    "output": "String",
    "colour": "%{BKY_TEXTS_HUE}",
    "helpUrl": "%{BKY_TEXT_TEXT_HELPURL}",
    "tooltip": "%{BKY_TEXT_TEXT_TOOLTIP}",
    "extensions": [
      "text_quotes",
      "parent_tooltip_when_inline"
    ]
  }
]);

/**
 *
 * @mixin
 * @package
 * @readonly
 */
Blockly.Constants.Text.QUOTE_IMAGE_MIXIN = {
  /**
   * Image data URI of an LTR opening double quote (same as RTL closing double quote).
   * @readonly
   */
  QUOTE_IMAGE_LEFT_DATAURI:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAA' +
    'n0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY' +
    '1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1' +
    'HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMf' +
    'z9AylsaRRgGzvZAAAAAElFTkSuQmCC',
  /**
   * Image data URI of an LTR closing double quote (same as RTL opening double quote).
   * @readonly
   */
  QUOTE_IMAGE_RIGHT_DATAURI:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAA' +
    'qUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhg' +
    'gONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvB' +
    'O3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5Aos' +
    'lLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==',
  /**
   * Pixel width of QUOTE_IMAGE_LEFT_DATAURI and QUOTE_IMAGE_RIGHT_DATAURI.
   * @readonly
   */
  QUOTE_IMAGE_WIDTH: 12,
  /**
   * Pixel height of QUOTE_IMAGE_LEFT_DATAURI and QUOTE_IMAGE_RIGHT_DATAURI.
   * @readonly
   */
  QUOTE_IMAGE_HEIGHT: 12,

  /**
   * Inserts appropriate quote images before and after the named field.
   * @param {string} fieldName The name of the field to wrap with quotes.
   * @this {Blockly.Block}
   */
  quoteField_: function(fieldName) {
    for (var i = 0, input; (input = this.inputList[i]); i++) {
      for (var j = 0, field; (field = input.fieldRow[j]); j++) {
        if (fieldName == field.name) {
          input.insertFieldAt(j, this.newQuote_(true));
          input.insertFieldAt(j + 2, this.newQuote_(false));
          return;
        }
      }
    }
    console.warn('field named "' + fieldName + '" not found in ' + this.toDevString());
  },

  /**
   * A helper function that generates a FieldImage of an opening or
   * closing double quote. The selected quote will be adapted for RTL blocks.
   * @param {boolean} open If the image should be open quote (“ in LTR).
   *                       Otherwise, a closing quote is used (” in LTR).
   * @return {!Blockly.FieldImage} The new field.
   * @this {Blockly.Block}
   */
  newQuote_: function(open) {
    var isLeft = this.RTL ? !open : open;
    var dataUri = isLeft ?
      this.QUOTE_IMAGE_LEFT_DATAURI :
      this.QUOTE_IMAGE_RIGHT_DATAURI;
    return new Blockly.FieldImage(
        dataUri,
        this.QUOTE_IMAGE_WIDTH,
        this.QUOTE_IMAGE_HEIGHT,
        isLeft ? '“' : '”');
  }
};

/**
 * Wraps TEXT field with images of double quote characters.
 * @this {Blockly.Block}
 */
Blockly.Constants.Text.TEXT_QUOTES_EXTENSION = function() {
  this.mixin(Blockly.Constants.Text.QUOTE_IMAGE_MIXIN);
  this.quoteField_('TEXT');
};

Blockly.Extensions.register('text_quotes',
    Blockly.Constants.Text.TEXT_QUOTES_EXTENSION);
