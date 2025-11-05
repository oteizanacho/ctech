// Carrusel
    const track = document.getElementById('carouselTrack');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsWrap = document.getElementById('dots');
    let index = 0, timer;

    function renderDots(){
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Ir al slide ' + (i+1));
        if(i === index) b.setAttribute('aria-current', 'true');
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }
    function goTo(i){
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      renderDots(); restart();
    }
    function next(){ goTo(index + 1) }
    function prev(){ goTo(index - 1) }
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    function autoplay(){ timer = setInterval(next, 5000) }
    function stop(){ clearInterval(timer) }
    function restart(){ stop(); autoplay() }

    document.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
    });

    renderDots(); autoplay();



// Cambiar imagen principal
    function changeImage(src, thumbnail) {
      document.getElementById('mainImageSrc').src = src;
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      thumbnail.classList.add('active');
    }

    // Cambiar tabs
    function switchTab(tabId, button) {
      // Ocultar todos los paneles
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      // Quitar active de todos los botones
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      // Mostrar el panel seleccionado
      document.getElementById(tabId).classList.add('active');
      // Activar el botón seleccionado
      button.classList.add('active');
    }



// Cambiar tabs
    function switchTab(tabId, button) {
      // Ocultar todos los paneles
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      // Quitar active de todos los botones
      document.querySelectorAll('.tab-nav-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      // Mostrar el panel seleccionado
      document.getElementById(tabId).classList.add('active');
      // Activar el botón seleccionado
      button.classList.add('active');
    }

    // Toggle switch
    function toggleSwitch(element) {
      element.classList.toggle('active');
    }