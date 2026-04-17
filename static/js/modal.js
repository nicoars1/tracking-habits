// New habit modal 
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

//  Delete modal
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

// Day Modal
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

// Funciones
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

// --- FUNCIONES PARA EL MODAL DE PERFIL ---

function openProfileModal() {
    const modal = document.getElementById('modal-perfil');
    const overlay = document.getElementById('profile-overlay');
    const card = document.getElementById('profile-card');

    modal.classList.remove('hidden');

    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        card.classList.remove('translate-y-full');
    }, 10);
}

function closeProfileModal() {
    const modal = document.getElementById('modal-perfil');
    const overlay = document.getElementById('profile-overlay');
    const card = document.getElementById('profile-card');

    overlay.classList.add('opacity-0');
    card.classList.add('translate-y-full');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// --- FUNCION PARA EL MODAL DE BORRAR CUENTA ---
function openDeleteAccountModal() {
    const modal = document.getElementById('modal-borrar-cuenta');
    const overlay = document.getElementById('delete-account-overlay');
    const card = document.getElementById('delete-account-card');

    modal.classList.remove('hidden');
    
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        // Quitamos la reducción de escala y la invisibilidad para que haga "zoom in"
        card.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeDeleteAccountModal() {
    const modal = document.getElementById('modal-borrar-cuenta');
    const overlay = document.getElementById('delete-account-overlay');
    const card = document.getElementById('delete-account-card');

    overlay.classList.add('opacity-0');
    // Volvemos a achicar la tarjeta para que desaparezca
    card.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}