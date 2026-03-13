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

function handleFabClick() {
    if (isDeleteMode) {
        confirmDeletion();
    } else {
        openModal();
    }
}