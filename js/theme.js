// Sistema de temas Light/Dark
(function() {
  'use strict';
  
  // Obtener tema guardado o usar light por defecto
  const getTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  };
  
  // Aplicar tema
  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
  };
  
  // Actualizar icono del botón
  const updateThemeIcon = (theme) => {
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(icon => {
      if (icon.classList) {
        // Es un icono de Font Awesome
        icon.classList.remove('fa-moon', 'fa-sun');
        icon.classList.add(theme === 'dark' ? 'fa-sun' : 'fa-moon');
      }
    });
  };
  
  // Toggle tema
  const toggleTheme = () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  };
  
  // Inicializar tema al cargar
  const initTheme = () => {
    const theme = getTheme();
    applyTheme(theme);
  };
  
  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const toggleButtons = document.querySelectorAll('#theme-toggle, .theme-toggle-btn');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });
  
  // Exportar funciones para uso global si es necesario
  window.themeManager = {
    toggle: toggleTheme,
    set: applyTheme,
    get: getTheme
  };
})();
