// Load all participants from all activities and render in the global participants list
async function loadParticipants() {
  try {
    const response = await fetch('/activities');
    const activities = await response.json();
    // Flatten all participants with their activity
    const participants = [];
    Object.entries(activities).forEach(([activity, details]) => {
      details.participants.forEach(email => {
        participants.push({ email, activity });
      });
    });
    renderParticipants(participants);
  } catch (e) {
    // fallback: clear list
    renderParticipants([]);
  }
}

// Render participants with delete icon
function renderParticipants(participants) {
  const list = document.getElementById('participants-list');
  list.innerHTML = '';
  participants.forEach(({ email, activity }) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    const span = document.createElement('span');
    span.textContent = `${email} (${activity})`;
    li.appendChild(span);
    const del = document.createElement('span');
    del.className = 'delete-icon';
    del.title = 'Remove participant';
    del.innerHTML = '&#128465;'; // Trash can icon
    del.addEventListener('click', () => {
      unregisterParticipant(email, activity);
    });
    li.appendChild(del);
    list.appendChild(li);
  });
}

// Unregister participant from activity
async function unregisterParticipant(email, activity) {
  try {
    const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to unregister');
    loadParticipants();
  } catch (e) {
    alert('Could not unregister participant.');
  }
}

// Initial load of participants
document.addEventListener('DOMContentLoaded', () => {
  loadParticipants();
});
document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${details.participants.map(email => `<li>${email}</li>`).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <p class="no-participants">No participants yet.</p>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after signup
        loadParticipants && loadParticipants(); // Refresh global participants if available
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
