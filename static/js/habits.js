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