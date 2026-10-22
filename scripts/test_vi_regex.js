const s = 'review chứt kế rất';
console.log('With \\b:', /\bchứt\s+kế\b/gi.test(s));
console.log('With custom boundary:', /(?:^|[\s,.:;!?])chứt\s+kế(?=$|[\s,.:;!?])/gi.test(s));

// Let's test a helper function for boundary-safe Vietnamese replacement
function replaceVi(str, pattern, replacement) {
  // pattern without \b
  const re = new RegExp('(^|[\\s,.:;!?])(' + pattern + ')(?=$|[\\s,.:;!?])', 'gi');
  return str.replace(re, (match, prefix) => prefix + replacement);
}

console.log('replaceVi result:', replaceVi(s, 'chứt\\s+kế', 'thiết kế'));
