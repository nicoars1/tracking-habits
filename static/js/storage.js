async function loadData() {
    try {
        const res = await fetch('/api/habits');
        const data = await res.json();

        if (data.source === 'db') {
            return Array.isArray(data.habits) ? data.habits : [];
        } else {
            const stored = localStorage.getItem('myHabitsApp');
            return stored ? JSON.parse(stored) : (typeof defaultHabits !== 'undefined' ? defaultHabits : []);
        }
    } catch (error) {
        console.error("Error en loadData:", error);
        const stored = localStorage.getItem('myHabitsApp');
        return stored ? JSON.parse(stored) : [];
    }
}

async function saveData(habits) {
    try {
        const res = await fetch('/api/habits');
        const data = await res.json();

        if (data.source === 'db') {
            await fetch('/api/habits', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ habits: habits })
            });
        } else {
            localStorage.setItem('myHabitsApp', JSON.stringify(habits));
        }
    } catch (error) {
        console.error("Error en saveData:", error);
        localStorage.setItem('myHabitsApp', JSON.stringify(habits));
    }

    await render();
}