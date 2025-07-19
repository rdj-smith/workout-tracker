document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  const workoutList = document.getElementById("workout-list");
  const form = document.getElementById("workoutForm");
  const exerciseInputs = document.getElementById("exerciseInputs");

  fetch("workouts.json")
    .then(res => res.json())
    .then(data => {
      const exercises = data[today] || [];
      if (exercises.length > 0) {
        workoutList.innerHTML = '<ul>' + exercises.map((ex, idx) => {
          let display = typeof ex === 'string' ? ex : ex.name + " — " + ex.sets + " (" + ex.suggested_weight + ")";
          return `<li>${display}</li>`;
        }).join('') + '</ul>';

        // Form input generation
        exerciseInputs.innerHTML = exercises.map((ex, idx) => {
          const id = typeof ex === 'string' ? `ex${idx}` : ex.id;
          const label = typeof ex === 'string' ? ex : ex.name;
          return `
            <label for="${id}_weight">${label} — Weight Used</label>
            <input type="number" id="${id}_weight" placeholder="lbs" />
            <label for="${id}_reps">Reps Completed</label>
            <input type="number" id="${id}_reps" placeholder="Reps" />
          `;
        }).join('');
      } else {
        workoutList.innerHTML = "<p>No workout assigned for today.</p>";
      }
    });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Workout log submitted! (Lambda/DynamoDB submission goes here)");
  });
});