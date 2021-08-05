/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Classes for all types of block events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.BlockChange');

goog.require('Blockly.Events');
goog.require('Blockly.utils.object');
goog.require('Blockly.Xml');

goog.requireType('Blockly.Block');


/**
 * Class for a block change event.
 * @param {!Blockly.Block=} opt_block The changed block.  Undefined for a blank
 *     event.
 * @param {string=} opt_element One of 'field', 'comment', 'disabled', etc.
 * @param {?string=} opt_name Name of input or field affected, or null.
 * @param {*=} opt_oldValue Previous value of element.
 * @param {*=} opt_newValue New value of element.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.BlockChange = function(opt_block, opt_element, opt_name, opt_oldValue,
    opt_newValue) {
  Blockly.Events.BlockChange.superClass_.constructor.call(this, opt_block);
  if (!opt_block) {
    return;  // Blank event to be populated by fromJson.
  }
  this.element = typeof opt_element == 'undefined' ? '' : opt_element;
  this.name = typeof opt_name == 'undefined' ? '' : opt_name;
  this.oldValue = typeof opt_oldValue == 'undefined' ? '' : opt_oldValue;
  this.newValue = typeof opt_newValue == 'undefined' ? '' : opt_newValue;
};
Blockly.utils.object.inherits(Blockly.Events.BlockChange, Blockly.Events.BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.BlockChange.prototype.type = Blockly.Events.BLOCK_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.BlockChange.prototype.toJson = function() {
  var json = Blockly.Events.BlockChange.superClass_.toJson.call(this);
  json['element'] = this.element;
  if (this.name) {
    json['name'] = this.name;
  }
  json['oldValue'] = this.oldValue;
  json['newValue'] = this.newValue;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.BlockChange.prototype.fromJson = function(json) {
  Blockly.Events.BlockChange.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.name = json['name'];
  this.oldValue = json['oldValue'];
  this.newValue = json['newValue'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
Blockly.Events.BlockChange.prototype.isNull = function() {
  return this.oldValue == this.newValue;
};

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.BlockChange.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn("Can't change non-existent block: " + this.blockId);
    return;
  }
  if (block.mutator) {
    // Close the mutator (if open) since we don't want to update it.
    block.mutator.setVisible(false);
  }
  var value = forward ? this.newValue : this.oldValue;
  switch (this.element) {
    case 'field':
      var field = block.getField(this.name);
      if (field) {
        field.setValue(value);
      } else {
        console.warn("Can't set non-existent field: " + this.name);
      }
      break;
    case 'comment':
      block.setCommentText(/** @type {string} */ (value) || null);
      break;
    case 'collapsed':
      block.setCollapsed(!!value);
      break;
    case 'disabled':
      block.setEnabled(!value);
      break;
    case 'inline':
      block.setInputsInline(!!value);
      break;
    case 'mutation':
      var oldMutation = '';
      if (block.mutationToDom) {
        var oldMutationDom = block.mutationToDom();
        oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
      }
      if (block.domToMutation) {
        var dom = Blockly.Xml.textToDom(/** @type {string} */ (value) || '<mutation/>');
        block.domToMutation(dom);
      }
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          block, 'mutation', null, oldMutation, value));
      break;
    default:
      console.warn('Unknown change type: ' + this.element);
  }
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.CHANGE,
    Blockly.Events.BlockChange);