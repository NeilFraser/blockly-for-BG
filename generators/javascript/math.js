/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.JavaScript.math');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['math_number'] = function(block) {
  // Numeric value.
  var code = Number(block.getFieldValue('NUM'));
  var order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC :
              Blockly.JavaScript.ORDER_UNARY_NEGATION;
  return [code, order];
};

Blockly.JavaScript['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.JavaScript.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.JavaScript.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.JavaScript.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.JavaScript.ORDER_DIVISION],
    'POWER': [null, Blockly.JavaScript.ORDER_NONE]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in JavaScript requires a special case since it has no operator.
  if (!operator) {
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.JavaScript['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.JavaScript.valueToCode(block, 'NUM',
        Blockly.JavaScript.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.JavaScript.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.JavaScript.valueToCode(block, 'NUM',
        Blockly.JavaScript.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.JavaScript.valueToCode(block, 'NUM',
        Blockly.JavaScript.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'Math.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'Math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Math.log(' + arg + ')';
      break;
    case 'EXP':
      code = 'Math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'Math.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'Math.round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'Math.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'Math.floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'Math.sin(' + arg + ' / 180 * Math.PI)';
      break;
    case 'COS':
      code = 'Math.cos(' + arg + ' / 180 * Math.PI)';
      break;
    case 'TAN':
      code = 'Math.tan(' + arg + ' / 180 * Math.PI)';
      break;
  }
  if (code) {
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'Math.log(' + arg + ') / Math.log(10)';
      break;
    case 'ASIN':
      code = 'Math.asin(' + arg + ') / Math.PI * 180';
      break;
    case 'ACOS':
      code = 'Math.acos(' + arg + ') / Math.PI * 180';
      break;
    case 'ATAN':
      code = 'Math.atan(' + arg + ') / Math.PI * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Blockly.JavaScript.ORDER_DIVISION];
};

Blockly.JavaScript['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Math.PI', Blockly.JavaScript.ORDER_MEMBER],
    'E': ['Math.E', Blockly.JavaScript.ORDER_MEMBER],
    'GOLDEN_RATIO':
        ['(1 + Math.sqrt(5)) / 2', Blockly.JavaScript.ORDER_DIVISION],
    'SQRT2': ['Math.SQRT2', Blockly.JavaScript.ORDER_MEMBER],
    'SQRT1_2': ['Math.SQRT1_2', Blockly.JavaScript.ORDER_MEMBER],
    'INFINITY': ['Infinity', Blockly.JavaScript.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.JavaScript['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.JavaScript.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.JavaScript.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.JavaScript.provideFunction_(
        'mathIsPrime',
        ['function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
         '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if (n == 2 || n == 3) {',
         '    return true;',
         '  }',
         '  // False if n is NaN, negative, is 1, or not whole.',
         '  // And false if n is divisible by 2 or 3.',
         '  if (isNaN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
            ' n % 3 == 0) {',
         '    return false;',
         '  }',
         '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {',
         '    if (n % (x - 1) == 0 || n % (x + 1) == 0) {',
         '      return false;',
         '    }',
         '  }',
         '  return true;',
         '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.JavaScript.valueToCode(block, 'DIVISOR',
          Blockly.JavaScript.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.JavaScript.ORDER_EQUALITY];
};

Blockly.JavaScript['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'DELTA',
      Blockly.JavaScript.ORDER_ADDITION) || '0';
  var varName = Blockly.JavaScript.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = (typeof ' + varName + ' == \'number\' ? ' + varName +
      ' : 0) + ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.JavaScript['math_round'] = Blockly.JavaScript['math_single'];
// Trigonometry functions have a single operand.
Blockly.JavaScript['math_trig'] = Blockly.JavaScript['math_single'];

Blockly.JavaScript['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'DIVIDEND',
      Blockly.JavaScript.ORDER_MODULUS) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'DIVISOR',
      Blockly.JavaScript.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.JavaScript.ORDER_MODULUS];
};

Blockly.JavaScript['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'LOW',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var argument2 = Blockly.JavaScript.valueToCode(block, 'HIGH',
      Blockly.JavaScript.ORDER_NONE) || 'Infinity';
  var code = 'Math.min(Math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.JavaScript.valueToCode(block, 'FROM',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'TO',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var functionName = Blockly.JavaScript.provideFunction_(
      'mathRandomInt',
      ['function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(a, b) {',
       '  if (a > b) {',
       '    // Swap a and b to ensure a is smaller.',
       '    var c = a;',
       '    a = b;',
       '    b = c;',
       '  }',
       '  return Math.floor(Math.random() * (b - a + 1) + a);',
       '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['Math.random()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_NONE) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_NONE) || '0';
  return ['Math.atan2(' + argument1 + ', ' + argument0 + ') / Math.PI * 180',
      Blockly.JavaScript.ORDER_DIVISION];
};
