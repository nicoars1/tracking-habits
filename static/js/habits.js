async function toggleHabit(id) {
  const now = new Date();
  const EXACT_TIME = now.toISOString();
  const TODAY_LOCAL = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const TZ_OFFSET = now.getTimezoneOffset(); // minutos, ej: 180 para Argentina (UTC-3)

  if (isDeleteMode) {
      if (itemsToDelete.includes(id)) {
          itemsToDelete = itemsToDelete.filter(itemId => itemId !== id);
      } else {
          itemsToDelete.push(id);
          if (navigator.vibrate) navigator.vibrate(20);
      }
      render();
      return;
  }

  if (window.USER_LOGGED_IN === 'true') {
      try {
          await fetch('/api/habits/toggle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, date: EXACT_TIME, day: TODAY_LOCAL, offset: TZ_OFFSET })
          });
          render();
      } catch (err) {
          console.error("Error toggle DB:", err);
      }
      return;
  }

  const habits = await loadData();
  const habitIndex = habits.findIndex(h => h.id === id);
  if (habitIndex > -1) {
    const habit = habits[habitIndex];
    const yaCompletadoHoy = habit.completedDates.some(d => toLocalDateString(d) === TODAY_LOCAL);

    habit.completedDates = habit.completedDates.filter(d => toLocalDateString(d) !== TODAY_LOCAL);

      if (!yaCompletadoHoy) {
          habit.completedDates.push(EXACT_TIME);
          if (navigator.vibrate) navigator.vibrate(40);
      }

      habits[habitIndex] = habit;
      await saveData(habits);
  }
}

async function saveNewHabit() {
    const name = document.getElementById('input-nombre').value;
    const detail = document.getElementById('input-detalle').value;
    
    if (!name) return alert("Escribe un nombre para el hábito");

    const newHabit = {
        id: Date.now(),
        title: name,
        subtitle: detail || "Meta personal",
        icon: currentSelection.icon,
        color: currentSelection.color,
        completedDates: [],
        streak: 0,
        created_at: new Date().toISOString()
    };

    const habits = await loadData();

    habits.unshift(newHabit);
    await saveData(habits);

    closeModal();
    document.getElementById('input-nombre').value = "";
    document.getElementById('input-detalle').value = "";
}