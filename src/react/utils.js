// Sanitize input to prevent XSS attacks while allowing safe HTML like <br>
export const sanitizeInput = (input) => {
  if (!input) return input;
  
  // Allow only safe HTML tags
  const allowedTags = ['br', 'b', 'i', 'u', 'strong', 'em'];
  const tagPattern = /<(\/?)([\w]+)([^>]*)>/gi;
  
  return input.replace(tagPattern, (match, slash, tagName, attributes) => {
    // Convert to lowercase for comparison
    const lowerTagName = tagName.toLowerCase();
    
    // If it's an allowed tag, keep it (but strip attributes for safety except for self-closing br)
    if (allowedTags.includes(lowerTagName)) {
      if (lowerTagName === 'br') {
        return '<br>';
      }
      return `<${slash}${lowerTagName}>`;
    }
    
    // Otherwise, escape it
    return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });
};
