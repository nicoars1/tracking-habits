document.addEventListener('DOMContentLoaded', async () => {

    if (window.USER_LOGGED_IN === 'true') {
        await syncLocalToDB();
    }

    if (document.getElementById('lista-habitos')) {
        const opcionesFecha = { day: 'numeric', month: 'long' };
        const opcionesDia = { weekday: 'long' };
        
        document.getElementById('header-fecha').innerText = date.toLocaleDateString('es-ES', opcionesFecha);
        document.getElementById('header-dia-semana').innerText = date.toLocaleDateString('es-ES', opcionesDia);

        renderWeekStrip();
        await render();
    }
    
    if (document.getElementById('calendar-grid')) {
        renderCalendar();
    }
});