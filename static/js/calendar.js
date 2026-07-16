let viewDate = new Date();

function prevMonth() {
    viewDate.setMonth(viewDate.getMonth() -1);
    renderCalendar();
}

function nextMonth() {
    viewDate.setMonth(viewDate.getMonth() +1);
    renderCalendar();
}

async function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const habits = await loadData();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('calendar-month-title').innerText = `${monthNames[month]} ${year}`;

    
    const totalDays = new Date(year, month + 1, 0).getDate();
    let firstDayIndex = new Date(year, month, 1).getDay();

    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 

    let html = '';

    
    for (let i = 0; i < firstDayIndex; i++) {
        html += `<div class="h-20 sm:h-24"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === TODAY;
        
        const completedHabits = habits.filter(h => {
            const didComplete = h.completedDates.some(d => toLocalDateString(d) === dateStr);

            const isHiddenBecauseArchived = h.archived && h.archivedDate && dateStr >= h.archivedDate;

            return didComplete && !isHiddenBecauseArchived;
        })
        
        let dotsHtml = '';
        completedHabits.forEach(h => {
            dotsHtml += `<div class="w-2 h-2 rounded-full ${h.color === 'black' ? 'bg-gray-800' : 'bg-' + h.color + '-500'}"></div>`;
        });

        if (isToday) {
            html += `
            <div id="dia-actual" class="h-20 sm:h-24 flex flex-col items-center justify-between py-2 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer" onclick="openDayModal('${dateStr}')">
                
                <div class="w-9 h-9 bg-[#25633f] rounded-full flex items-center justify-center shadow-lg shadow-gray-400/50">
                    <span class="text-base font-bold text-white">${day}</span>
                </div>
                
                <div class="flex flex-wrap justify-center gap-1 px-1">
                    ${completedHabits.map(h => `<div class="w-2 h-2 rounded-full border border-gray-600 ${h.color === 'white' ? 'bg-white' : 'bg-' + h.color + '-400'}"></div>`).join('')}
                </div>
            </div>`;
        } else {
            html += `
            <div  onclick="openDayModal('${dateStr}')" class="h-20 sm:h-24 flex flex-col items-center justify-between py-2 rounded-2xl active:bg-gray-100 transition-colors border border-transparent cursor-pointer">
                
                <div class="w-9 h-9 flex items-center justify-center">
                    <span class="text-base font-medium text-gray-700">${day}</span>
                </div>
                
                <div class="flex flex-wrap justify-center gap-1 px-1">
                    ${dotsHtml}
                </div>
            </div>`;
        }
    }

    grid.innerHTML = html;

    setTimeout(() => {
        const diaActual = document.getElementById('dia-actual');

        if (diaActual) {
            diaActual.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, 50)
}