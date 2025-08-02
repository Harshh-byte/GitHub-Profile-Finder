let searchBtn = document.querySelector(".search");
let usernameinp = document.querySelector(".username-input");
let card = document.querySelector(".card");
let repoContainer = document.querySelector(".repo-container");

// GitHub API functions
function getProfileData(username) {
  return fetch(`https://api.github.com/users/${username}`).then((res) => {
    if (!res.ok) throw new Error("User not found.");
    return res.json();
  });
}

function getRepos(username) {
  return fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch repos.");
    return res.json();
  });
}

// Decorate profile data
function decorateProfile(details) {
  return `
    <div>
      <img src="${details.avatar_url}" alt="Avatar"
        class="w-32 h-32 rounded-full border-4 border-blue-600 object-cover">
    </div>
    <div class="flex-1 space-y-3 text-center md:text-left">
      <div>
        <h2 class="text-2xl font-bold text-white">${details.name || "No Name"}</h2>
        <p class="text-blue-400 text-sm">@${details.login}</p>
      </div>
      <p class="text-gray-300">${details.bio || "No bio available."}</p>

      <div class="flex flex-wrap gap-4 text-sm text-gray-400 mt-4">
        <span><strong class="text-white">📍</strong> ${details.location || "N/A"}</span>
        <span><strong class="text-white">🏢</strong> ${details.company || "N/A"}</span>
        <span><strong class="text-white">🔗</strong> <a href="${details.blog || "#"}" target="_blank"
            class="text-blue-500 hover:underline">${details.blog ? details.blog.replace(/^https?:\/\//, '') : "N/A"}</a></span>
      </div>

      <div class="flex gap-6 mt-6 text-center text-gray-300 text-sm">
        <div>
          <p class="text-white text-lg font-semibold">${details.public_repos}</p>
          <p>Repos</p>
        </div>
        <div>
          <p class="text-white text-lg font-semibold">${details.followers}</p>
          <p>Followers</p>
        </div>
        <div>
          <p class="text-white text-lg font-semibold">${details.following}</p>
          <p>Following</p>
        </div>
      </div>

      <div class="mt-6 text-sm text-gray-400">
        <strong class="text-white">🗓 Joined:</strong> ${new Date(details.created_at).toDateString()}
      </div>

      <div class="mt-4">
        <a href="${details.html_url}" target="_blank"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl transition duration-200">
          View on GitHub
        </a>
      </div>
    </div>
  `;
}

// Display repos as cards
function decorateRepos(repos) {
  repoContainer.innerHTML = repos.map(repo => `
    <div class="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-gray-700 hover:border-blue-500 transition duration-300 group">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xl font-semibold text-white group-hover:text-blue-400 transition">${repo.name}</h4>
        <a href="${repo.html_url}" target="_blank" title="View Repo" class="text-blue-500 hover:text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-current" viewBox="0 0 20 20">
            <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 01-.707 1.707H15v6a1 1 0 01-1 1h-2a1 1 0 010-2h1V8h-3a1 1 0 010-2h3V3a1 1 0 01.293-.707zM3 5a2 2 0 012-2h4a1 1 0 010 2H5v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
          </svg>
        </a>
      </div>

      <p class="text-gray-300 text-sm mb-4 min-h-[48px]">${repo.description || "No description available."}</p>

      <div class="flex flex-wrap gap-3 text-xs text-gray-400 mt-auto">
        <span class="bg-gray-700/60 px-3 py-1 rounded-full">
          ⭐ ${repo.stargazers_count}
        </span>
        <span class="bg-gray-700/60 px-3 py-1 rounded-full">
          🍴 ${repo.forks_count}
        </span>
        <span class="bg-gray-700/60 px-3 py-1 rounded-full">
          🧑‍💻 ${repo.language || "N/A"}
        </span>
        <span class="ml-auto text-gray-500 text-[11px]">
          Updated: ${new Date(repo.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  `).join('');
}

// Load user profile
function loadUser(username) {
  card.innerHTML = `<p class="text-gray-400 text-lg animate-pulse">Loading...</p>`;
  repoContainer.innerHTML = "";
  repoContainer.classList.add("hidden");

  Promise.all([getProfileData(username), getRepos(username)])
    .then(([profile, repos]) => {
      card.innerHTML = decorateProfile(profile);
      card.classList.remove("hidden");

      if (repos.length > 0) {
        decorateRepos(repos);
        repoContainer.classList.remove("hidden");
      }
    })
    .catch((err) => {
      card.innerHTML = `<p class="text-red-400">${err.message}</p>`;
      repoContainer.classList.add("hidden");
    });
}

// Search button
searchBtn.addEventListener("click", () => {
  const username = usernameinp.value.trim();
  if (username) loadUser(username);
  else alert("Please enter a GitHub username.");
});

// Enter key support
usernameinp.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// Default ghost profile (octocat)
window.addEventListener("DOMContentLoaded", () => {
  loadUser("octocat");
});