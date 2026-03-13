// --- 2. INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en el index (pantalla Hoy)
    if (document.getElementById('lista-habitos')) {
        const opcionesFecha = { day: 'numeric', month: 'long' };
        const opcionesDia = { weekday: 'long' };
        
        document.getElementById('header-fecha').innerText = date.toLocaleDateString('es-ES', opcionesFecha);
        document.getElementById('header-dia-semana').innerText = date.toLocaleDateString('es-ES', opcionesDia);
        //document.getElementById('dia-numero').innerText = date.getDate();

        renderWeekStrip();
        render();
    }
    
    // Si estamos en el calendario (pantalla Mes)
    if (document.getElementById('calendar-grid')) {
        renderCalendar();
    }
});