async function syncLocalToDB() {
    const stored = localStorage.getItem('myHabitsApp');
    if (!stored) return;

    let localHabits = JSON.parse(stored);
    
    if (localHabits && !Array.isArray(localHabits) && localHabits.habits) {
        localHabits = localHabits.habits;
    }

    if (!Array.isArray(localHabits) || localHabits.length === 0) {
        localStorage.removeItem('myHabitsApp');
        return;
    }

    try {
        const checkRes = await fetch('/api/habits');
        const dbData = await checkRes.json();
        
        const dbHabitsArray = Array.isArray(dbData.habits) ? dbData.habits : [];

        if (dbData.source === 'db' && dbHabitsArray.length === 0) {
            
            const postRes = await fetch('/api/habits', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ habits: localHabits })
            });

            // si todo sigue bien borramos los datos de localstorage
            if (postRes.ok) {
                localStorage.removeItem('myHabitsApp');
                console.log("Sync completado");
            } else {
                console.error("Hubo un error guardando en el servidor. Conservando copia local.");
            }
            
        } else if (dbData.source === 'db' && dbHabitsArray.length > 0) {
             localStorage.removeItem('myHabitsApp');
        }
    } catch (err) {
        console.error("Error en sync:", err);
    }
}