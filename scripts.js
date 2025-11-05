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