const apiUrl = "https://your-api-id.execute-api.us-east-1.amazonaws.com/logs"; // Replace after deploy

document.getElementById("logForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const exercise = document.getElementById("exercise").value;
  const reps = document.getElementById("reps").value;
  const weight = document.getElementById("weight").value;
  const today = new Date().toISOString().split("T")[0];

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: "default_user",
      date: today,
      exercise,
      reps,
      weight,
    })
  });

  const data = await response.json();
  document.getElementById("output").textContent = JSON.stringify(data, null, 2);
});