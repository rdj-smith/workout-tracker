document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  const container = document.getElementById('workout-list');

  fetch('workouts.json')
    .then(response => response.json())
    .then(data => {
      const exercises = data[today] || [];
      if (exercises.length > 0) {
        container.innerHTML = `
          <h2>${today.toUpperCase()} WORKOUT</h2>
          <form id="log-form">
            <label><strong>Your Name:</strong> <input type="text" name="user_name" required></label><br><br>
            <ul>
              ${exercises.map((ex, i) => `
                <li>
                  <strong>${ex.name}</strong><br>
                  <small>Sets: ${ex.sets} — Suggested: ${ex.suggested_weight}</small><br>
                  <label>Weight Used: <input type="text" name="${ex.id}_weight"></label><br>
                  <label>Reps Done: <input type="text" name="${ex.id}_reps"></label><br><br>
                </li>
              `).join('')}
            </ul>
            <button type="submit">Submit Log</button>
          </form>
          <div id="submit-status"></div>
        `;

        document.getElementById('log-form').addEventListener('submit', async (e) => {
          e.preventDefault();

          const formData = new FormData(e.target);
          const payload = {
            user_name: formData.get("user_name"),
            date: new Date().toISOString(),
            day: today,
            log: exercises.map(ex => ({
              id: ex.id,
              name: ex.name,
              sets: ex.sets,
              suggested_weight: ex.suggested_weight,
              weight_used: formData.get(`${ex.id}_weight`),
              reps_done: formData.get(`${ex.id}_reps`)
            }))
          };

          try {
            const response = await fetch("https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/logs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });

            if (response.ok) {
              document.getElementById("submit-status").innerText = "✅ Workout submitted successfully!";
            } else {
              document.getElementById("submit-status").innerText = "❌ Failed to submit workout.";
            }
          } catch (err) {
            console.error(err);
            document.getElementById("submit-status").innerText = "❌ Network error while submitting.";
          }
        });
      } else {
        container.innerHTML = `<p>No workout assigned for today (${today}).</p>`;
      }
    })
    .catch(err => {
      console.error("Failed to load workouts.json:", err);
      container.innerHTML = `<p>Error loading workouts.</p>`;
    });
});
