const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');
const start = orig.indexOf('const mn=');
const end = orig.indexOf('So=500,xn=Gr(Wi)');
const mnCode = orig.slice(start, end);

// Let's find all global/free variables referenced inside mn
// We can use a simple parser: wrap mn in a function that shadows nothing
const acorn = require('acorn');
const walk = require('acorn-walk');

const parsed = acorn.parse(mnCode, { ecmaVersion: 2022, sourceType: 'module' });

const declared = new Set();
const referenced = new Set();

walk.ancestor(parsed, {
  VariableDeclarator(node) {
    if (node.id.type === 'Identifier') declared.add(node.id.name);
    if (node.id.type === 'ArrayPattern') {
      node.id.elements.forEach(el => {
        if (el && el.type === 'Identifier') declared.add(el.name);
      });
    }
    if (node.id.type === 'ObjectPattern') {
      node.id.properties.forEach(p => {
        if (p.value && p.value.type === 'Identifier') declared.add(p.value.name);
      });
    }
  },
  FunctionDeclaration(node) {
    if (node.id) declared.add(node.id.name);
    node.params.forEach(p => {
      if (p.type === 'Identifier') declared.add(p.name);
    });
  },
  FunctionExpression(node) {
    node.params.forEach(p => {
      if (p.type === 'Identifier') declared.add(p.name);
    });
  },
  ArrowFunctionExpression(node) {
    node.params.forEach(p => {
      if (p.type === 'Identifier') declared.add(p.name);
      if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') declared.add(p.left.name);
    });
  },
  CatchClause(node) {
    if (node.param && node.param.type === 'Identifier') declared.add(node.param.name);
  },
  Identifier(node, ancestors) {
    const parent = ancestors[ancestors.length - 2];
    // Check if it is a property key
    if (parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed) {
      return;
    }
    if (parent && parent.type === 'Property' && parent.key === node && !parent.computed) {
      return;
    }
    referenced.add(node.name);
  }
});

// Javascript built-ins
const jsBuiltins = new Set([
  'window', 'document', 'console', 'Math', 'Number', 'String', 'Date', 'Promise', 'setTimeout', 'clearTimeout',
  'requestAnimationFrame', 'cancelAnimationFrame', 'Array', 'Object', 'Boolean', 'Error', 'Intl', 'Set', 'Map',
  'crypto', 'Infinity', 'NaN', 'undefined', 'parseInt', 'parseFloat', 'isNaN', 'isFinite'
]);

const freeVars = [];
referenced.forEach(name => {
  if (!declared.has(name) && !jsBuiltins.has(name)) {
    freeVars.push(name);
  }
});

console.log('FREE VARIABLES IN MN:');
console.log(freeVars);
