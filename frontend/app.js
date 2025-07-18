// const apiUrl = "https://your-api-id.execute-api.us-east-1.amazonaws.com/logs"; // Replace after deploy

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  const container = document.getElementById('workout-list');

  fetch('workouts.json')
    .then(response => response.json())
    .then(data => {
      const exercises = data[today] || [];
      if (exercises.length > 0) {
        container.innerHTML = `<h2>${today.toUpperCase()} WORKOUT</h2><ul>` +
          exercises.map(ex => `<li>${ex}</li>`).join('') + '</ul>';
      } else {
        container.innerHTML = `<p>No workout assigned for today (${today}).</p>`;
      }
    })
    .catch(err => {
      console.error("Failed to load workouts.json:", err);
      container.innerHTML = `<p>Error loading workouts.</p>`;
    });
});
