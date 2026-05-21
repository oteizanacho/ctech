const fs = require('fs');
const postcss = require('postcss');

const plugin = postcss.plugin('clean-dark-theme', () => {
    return (root) => {
        root.walkRules((rule) => {
            // Eliminar [data-theme="dark"]
            if (rule.selector && rule.selector.includes('[data-theme="dark"]')) {
                rule.remove();
            }
            // Eliminar #theme-toggle
            if (rule.selector && rule.selector.includes('#theme-toggle')) {
                rule.remove();
            }
        });
        
        root.walkComments((comment) => {
            // Eliminar comentarios de dark mode
            if (comment.text.includes('En modo dark')) {
                comment.remove();
            }
            if (comment.text.includes('Modo Dark')) {
                comment.remove();
            }
        });
    };
});

fs.readFile('styles.css', 'utf8', (err, css) => {
    postcss([plugin])
        .process(css, { from: 'styles.css', to: 'styles.css' })
        .then(result => {
            fs.writeFileSync('styles.css', result.css);
            console.log('CSS limpiado de tema oscuro con éxito!');
        })
        .catch(err => {
            console.error('Error procesando CSS:', err);
        });
});
