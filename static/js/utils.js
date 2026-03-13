function enableDragScroll(elementId) {
    const slider = document.getElementById(elementId);
    if (!slider) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('cursor-grabbing');
        slider.classList.remove('cursor-grab');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('cursor-grabbing');
        slider.classList.add('cursor-grab');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('cursor-grabbing');
        slider.classList.add('cursor-grab');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
}