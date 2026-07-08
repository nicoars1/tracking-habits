async function render() {
    const habits = await loadData();
    const container = document.getElementById('lista-habitos');
    container.innerHTML = '';
    let completedCount = 0;
    const activeHabits = habits.filter(h => !h.archived);

    activeHabits.forEach(habit => {
        const isCompleted = habit.completedDates.some(d => toLocalDateString(d) === TODAY);
        if(isCompleted) completedCount++;

        let cardClasses = "group relative rounded-2xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer overflow-hidden border ";
        let iconHTML = habit.icon;
        let checkHTML = "";
        
        if (isDeleteMode) {
            const isSelectedToDelete = itemsToDelete.includes(habit.id);
            
            if (isSelectedToDelete) {
                cardClasses += "bg-red-50 border-red-500 scale-95 shadow-inner";
            } else {
                cardClasses += "bg-white border-gray-200 animate-wiggle opacity-80";
            }

            const radioClass = isSelectedToDelete ? "bg-red-500 border-red-500" : "border-gray-300 bg-white";
            checkHTML = `<div class="w-6 h-6 rounded-full border-2 ${radioClass} flex items-center justify-center transition-colors">
                            ${isSelectedToDelete ? '<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>' : ''}
                         </div>`;
        } else {
            cardClasses += isCompleted 
                ? "bg-gray-50 border-transparent opacity-60" 
                : "bg-white shadow-sm border-gray-100 active:scale-[0.98]";

            checkHTML = isCompleted
                ? `<div class="w-8 h-8 rounded-full bg-${habit.color}-500 flex items-center justify-center text-white shadow-sm transition-all transform scale-110"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>`
                : `<div class="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-${habit.color}-400 transition-colors"></div>`;
        }

        const iconColorClass = (isCompleted && !isDeleteMode)
            ? `bg-${habit.color}-100 text-${habit.color}-600` 
            : `bg-${habit.color}-50 text-${habit.color}-500`;

        const html = `
        <div onclick="toggleHabit(${habit.id})" class="${cardClasses}">
            <div class="flex items-center gap-4 z-10 pointer-events-none"> 
                <div class="w-14 h-14 rounded-2xl ${iconColorClass} flex items-center justify-center text-2xl shadow-inner">
                    ${iconHTML}
                </div>
                <div>
                    <h3 class="font-bold text-gray-900 text-lg leading-tight ${(isCompleted && !isDeleteMode) ? 'line-through text-gray-500' : ''}">${habit.title}</h3>
                    <p class="text-xs text-gray-400 font-medium mt-0.5">${habit.subtitle}</p>
                </div>
            </div>
            <div class="z-10 pointer-events-none">
                ${checkHTML}
            </div>
        </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
    
    const percentage = habits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;
    const progressText = document.getElementById('progress-text');
    if(progressText) progressText.innerText = `${percentage}%`;
    if(isNaN(percentage)) progressText.innerText = "0%"
}

function renderWeekStrip() {
    const container = document.getElementById('week-strip');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    
    for (let i = -3; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        let dayStr = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
        const dayName = dayStr.charAt(0).toUpperCase() + dayStr.slice(1, 3); 
        const dayNumber = d.getDate();
        
        let html = '';

        if (i === 0) {
            html = `
            <div class="flex flex-col items-center gap-1 transform scale-110">
                <span class="text-xs font-bold text-blue-600">Hoy</span>
                <div class="w-11 h-11 rounded-full border-2 border-blue-600 bg-blue-50 text-blue-700 flex items-center justify-center text-base font-bold shadow-sm">
                    ${dayNumber}
                </div>
            </div>`;
        } else if (i < 0) {
            html = `
            <div class="flex flex-col items-center gap-1 opacity-50">
                <span class="text-xs font-medium text-gray-500">${dayName}</span>
                <div class="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-sm font-medium text-gray-700">
                    ${dayNumber}
                </div>
            </div>`;
        } else {
            html = `
            <div class="flex flex-col items-center gap-1 opacity-40">
                <span class="text-xs font-medium text-gray-500">${dayName}</span>
                <div class="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-sm font-medium text-gray-700">
                    ${dayNumber}
                </div>
            </div>`;
        }
        container.insertAdjacentHTML('beforeend', html);
    }
}