const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Eliminar bloques [data-theme='dark'] {...}
css = css.replace(/\[data-theme="dark"\]\s*[^{]*\{[^}]*\}/g, '');

// Eliminar #theme-toggle {...} y variaciones
css = css.replace(/#theme-toggle\s*[^{]*\{[^}]*\}/g, '');

// También eliminar comentarios relacionados a dark mode
css = css.replace(/\/\* En modo dark.*?\*\//g, '');

// Limpiar líneas vacías excesivas
css = css.replace(/\n\s*\n/g, '\n\n');

fs.writeFileSync('styles.css', css);
console.log('CSS cleaned.');
