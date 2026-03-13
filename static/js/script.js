// --- 1. CONFIGURACIÓN Y ESTADO ---

const date = new Date();
const TODAY = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const defaultHabits = [
    { id: 1, title: "Leer 30 mins", subtitle: "Libro: Atomic Habits", icon: "📚", color: "orange", completedDates: [] },
    { id: 2, title: "Entrenamiento", subtitle: "Rutina de fuerza", icon: "💪", color: "green", completedDates: [] },
    { id: 3, title: "Beber 2L Agua", subtitle: "Hidratación diaria", icon: "💧", color: "blue", completedDates: [] },
    { id: 4, title: "Meditar", subtitle: "10 min de calma", icon: "🧘", color: "purple", completedDates: [] }
];

const AVAILABLE_COLORS = [
    { name: 'blue', hex: 'bg-blue-500' }, { name: 'orange', hex: 'bg-orange-500' },
    { name: 'green', hex: 'bg-green-500' }, { name: 'purple', hex: 'bg-purple-500' },
    { name: 'pink', hex: 'bg-pink-500' }, { name: 'red', hex: 'bg-red-500' },
    { name: 'yellow', hex: 'bg-yellow-400' }, { name: 'teal', hex: 'bg-teal-500' },
    { name: 'indigo', hex: 'bg-indigo-500' }, { name: 'gray', hex: 'bg-gray-600' }
];

const AVAILABLE_ICONS = [
    '📚', '💪', '💧', '🧘', '💰', '🎨', '🎵', '✈️', '🐶', '🎓', 
    '💼', '❤️', '⭐', '🛒', '🎮', '🍎', '🍳', '🚴', '🏊', '🧠',
    '💊', '🧹', '🪴', '📵', '🌞', '🌙', '📝', '🤝', '🗣️', '👣'
];

let currentSelection = { icon: '📚', color: 'blue' };
let isDeleteMode = false;
let itemsToDelete = [];

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

// --- 3. MANEJO DE DATOS ---

function loadData() {
    const stored = localStorage.getItem('myHabitsApp');
    return stored ? JSON.parse(stored) : defaultHabits;
}

function saveData(habits) {
    localStorage.setItem('myHabitsApp', JSON.stringify(habits));
    render();
}

// --- 4. RENDERIZADO PRINCIPAL ---

function render() {
    const habits = loadData();
    const container = document.getElementById('lista-habitos');
    container.innerHTML = '';
    let completedCount = 0;
    const activeHabits = habits.filter(h => !h.archived);

    activeHabits.forEach(habit => {
        const isCompleted = habit.completedDates.includes(TODAY);
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

// --- 5. INTERACCIONES ---

function toggleHabit(id) {
    if (isDeleteMode) {
        if (itemsToDelete.includes(id)) {
            itemsToDelete = itemsToDelete.filter(itemId => itemId !== id);
        } else {
            itemsToDelete.push(id);
            if(navigator.vibrate) navigator.vibrate(20);
        }
        render();
    } else {
        const habits = loadData();
        const habitIndex = habits.findIndex(h => h.id === id);
        
        if (habitIndex > -1) {
            const habit = habits[habitIndex];
            if (habit.completedDates.includes(TODAY)) {
                habit.completedDates = habit.completedDates.filter(d => d !== TODAY);
            } else {
                habit.completedDates.push(TODAY);
                if(navigator.vibrate) navigator.vibrate(40);
            }
            habits[habitIndex] = habit;
            saveData(habits);
        }
    }
}

function handleFabClick() {
    if (isDeleteMode) {
        confirmDeletion();
    } else {
        openModal();
    }
}

// --- 6. FLUJO DE ELIMINACIÓN ---

function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;
    itemsToDelete = [];
    
    const fabBtn = document.getElementById('main-fab');
    const plusIcon = document.getElementById('fab-icon-plus');
    const trashIcon = document.getElementById('fab-icon-trash');
    const trashModeBtn = document.getElementById('btn-trash-mode');

    if (isDeleteMode) {
        fabBtn.classList.replace('bg-black', 'bg-red-600');
        plusIcon.classList.add('hidden');
        trashIcon.classList.remove('hidden');
        trashModeBtn.classList.add('text-red-600', 'bg-red-100');
        if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } else {
        fabBtn.classList.replace('bg-red-600', 'bg-black');
        plusIcon.classList.remove('hidden');
        trashIcon.classList.add('hidden');
        trashModeBtn.classList.remove('text-red-600', 'bg-red-100');
    }
    render();
}

function confirmDeletion() {
    if (itemsToDelete.length === 0) {
        toggleDeleteMode();
        return;
    }
    if (itemsToDelete.length > 0) {
        openModalDelete();
    }
}

function executeDeletion() {
    let habits = loadData();
    
    habits = habits.map(h => {
        if (itemsToDelete.includes(h.id)) {
            h.archived = true;
            h.archivedDate = TODAY;
        }
        return h;
    })

    saveData(habits);
    closeModalDelete();
    toggleDeleteMode(); 
}

// --- 7. MODAL: NUEVO HABITO ---

function initModal() {
    const colorContainer = document.getElementById('container-colors');
    colorContainer.innerHTML = AVAILABLE_COLORS.map(c => `
        <button onclick="selectColor('${c.name}')" 
                class="color-btn group relative w-12 h-12 rounded-full ${c.hex} flex-shrink-0 transition-transform active:scale-90 flex items-center justify-center border-2 border-white shadow-md hover:scale-110"
                data-color="${c.name}">
            <svg class="w-6 h-6 text-white opacity-0 transition-opacity check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </button>
    `).join('');

    const iconContainer = document.getElementById('container-icons');
    iconContainer.innerHTML = AVAILABLE_ICONS.map(icon => `
        <button onclick="selectIcon('${icon}')" 
                class="icon-btn w-14 h-14 rounded-2xl text-2xl flex items-center justify-center transition-all duration-200 border-2 border-transparent hover:bg-gray-50 active:scale-95"
                data-icon="${icon}">
            ${icon}
        </button>
    `).join('');
    
    enableDragScroll('container-colors');
    enableDragScroll('container-icons');
}

function openModal() {
    initModal();
    document.getElementById('modal-nuevo-habito').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('modal-overlay').classList.remove('opacity-0');
        document.getElementById('modal-card').classList.remove('translate-y-full');
    }, 10);

    selectColor(currentSelection.color);
    selectIcon(currentSelection.icon);
    document.getElementById('input-nombre').focus();
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('opacity-0');
    document.getElementById('modal-card').classList.add('translate-y-full');
    
    setTimeout(() => {
        document.getElementById('modal-nuevo-habito').classList.add('hidden');
    }, 300);
} 

function selectColor(colorName) {
    currentSelection.color = colorName;
    document.getElementById('selected-color').value = colorName;

    document.querySelectorAll('.color-btn').forEach(btn => {
        const check = btn.querySelector('.check-icon');
        if(btn.dataset.color === colorName) {
            btn.classList.add('ring-2', 'ring-offset-2', 'ring-black', 'scale-110');
            check.classList.remove('opacity-0');
        } else {
            btn.classList.remove('ring-2', 'ring-offset-2', 'ring-black', 'scale-110');
            check.classList.add('opacity-0');
        }
    });
    updateIconVisuals();
}

function selectIcon(iconChar) {
    currentSelection.icon = iconChar;
    document.getElementById('selected-icon').value = iconChar;
    updateIconVisuals();
}

function updateIconVisuals() {
    const activeColor = currentSelection.color;
    const activeIcon = currentSelection.icon;

    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.className = `icon-btn w-14 h-14 rounded-2xl text-2xl flex items-center justify-center transition-all duration-200 border-2 border-transparent active:scale-95`;
        if (btn.dataset.icon === activeIcon) {
            btn.classList.add(`bg-${activeColor}-100`, `text-${activeColor}-600`, `border-${activeColor}-200`, 'shadow-sm', 'scale-105');
        } else {
            btn.classList.add('bg-gray-50', 'text-gray-500', 'hover:bg-gray-100');
        }
    });
}

function saveNewHabit() {
    const name = document.getElementById('input-nombre').value;
    const detail = document.getElementById('input-detalle').value;
    
    if (!name) return alert("Escribe un nombre para el hábito");

    const habits = loadData();
    habits.unshift({
        id: Date.now(),
        title: name,
        subtitle: detail || "Meta personal",
        icon: currentSelection.icon,
        color: currentSelection.color,
        completedDates: []
    });
    
    saveData(habits);
    closeModal();
    
    document.getElementById('input-nombre').value = "";
    document.getElementById('input-detalle').value = "";
}

// --- 8. MODAL: CONFIRMAR BORRADO ---

function openModalDelete() {
    const modal = document.getElementById('modal-borrar-habito');
    const overlay = document.getElementById('delete-overlay');
    const card = document.getElementById('delete-card');

    modal.classList.remove('hidden');

    setTimeout(() => {
       overlay.classList.remove('opacity-0');
       card.classList.remove('scale-95', 'opacity-0'); 
       card.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeModalDelete() {
    const modal = document.getElementById('modal-borrar-habito');
    const overlay = document.getElementById('delete-overlay');
    const card = document.getElementById('delete-card');

    overlay.classList.add('opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// --- 9. UTILIDADES ---

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

// --- 10. LÓGICA DEL CALENDARIO ---
let viewDate = new Date();

function prevMonth() {
    viewDate.setMonth(viewDate.getMonth() -1);
    renderCalendar();
}

function nextMonth() {
    viewDate.setMonth(viewDate.getMonth() +1);
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const habits = loadData();
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
            const didComplete = h.completedDates.includes(dateStr);

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
                
                <div class="w-9 h-9 bg-black rounded-full flex items-center justify-center shadow-lg shadow-gray-400/50">
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

// 11 -- MODAL: DIA ACTUAL --

function openDayModal(dateStr) {
    const habits = loadData();
    
    // 1. Filtrar qué hábitos se hicieron ese día exacto (misma lógica que el calendario)
    const completedHabits = habits.filter(h => {
        const didComplete = h.completedDates.includes(dateStr);
        const isHiddenBecauseArchived = h.archived && h.archivedDate && dateStr >= h.archivedDate;
        return didComplete && !isHiddenBecauseArchived;
    });

    // 2. Formatear la fecha para el título (Ej: "15 de Febrero, 2026")
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(year, month - 1, day);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('day-modal-title').innerText = dateObj.toLocaleDateString('es-ES', options);

    // 3. Dibujar la lista
    const content = document.getElementById('day-modal-content');
    
    if (completedHabits.length === 0) {
        // Mensaje si no hizo nada
        content.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 opacity-50">
                <span class="text-4xl mb-3">📭</span>
                <p class="text-gray-500 font-medium">No se registraron hábitos este día.</p>
            </div>
        `;
    } else {
        // Dibujar las tarjetitas de los hábitos
        let listHtml = '';
        completedHabits.forEach(h => {
            listHtml += `
            <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-${h.color}-50 text-${h.color}-500 flex items-center justify-center text-2xl">
                    ${h.icon}
                </div>
                <div>
                    <h4 class="font-bold text-gray-900">${h.title}</h4>
                    <p class="text-xs text-gray-400 mt-0.5">${h.subtitle}</p>
                </div>
            </div>`;
        });
        content.innerHTML = listHtml;
    }

    // 4. Mostrar el modal con animación
    const modal = document.getElementById('modal-dia-detalle');
    const overlay = document.getElementById('day-overlay');
    const card = document.getElementById('day-card');

    modal.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        card.classList.remove('translate-y-full');
    }, 10);
}

function closeDayModal() {
    const modal = document.getElementById('modal-dia-detalle');
    const overlay = document.getElementById('day-overlay');
    const card = document.getElementById('day-card');

    overlay.classList.add('opacity-0');
    card.classList.add('translate-y-full');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}