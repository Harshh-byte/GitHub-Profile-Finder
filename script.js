let searchBtn = document.querySelector(".search");
let usernameinp = document.querySelector(".username-input");
let card = document.querySelector(".card");
let repoContainer = document.querySelector(".repo-container");

function getProfileData(username) {
  return fetch(`https://api.github.com/users/${username}`).then((res) => {
    if (!res.ok) throw new Error("User not found.");
    return res.json();
  });
}

function getRepos(username) {
  return fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
  ).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch repos.");
    return res.json();
  });
}

function decorateProfile(details) {
  return `
    <div class="flex flex-col md:flex-row gap-8 items-center md:items-start w-full">
      <div class="shrink-0">
        <img src="${details.avatar_url}" alt="Avatar"
          class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover">
      </div>
      
      <div class="flex-1 space-y-4 text-center md:text-left">
        <div>
          <h2 class="text-3xl font-bold text-slate-900">${details.name || details.login}</h2>
          <p class="text-teal-600 text-sm font-semibold mt-1">@${details.login}</p>
        </div>
        
        <p class="text-slate-600 leading-relaxed max-w-2xl">${details.bio || "No bio available."}</p>

        <div class="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-600 mt-4">
          <span class="flex items-center gap-1"><span class="text-lg">📍</span> ${details.location || "N/A"}</span>
          <span class="flex items-center gap-1"><span class="text-lg">🏢</span> ${details.company || "N/A"}</span>
          <span class="flex items-center gap-1"><span class="text-lg">🔗</span> 
            <a href="${details.blog || "#"}" target="_blank" class="text-teal-600 hover:text-teal-700 hover:underline">
              ${details.blog ? details.blog.replace(/^https?:\/\//, "") : "N/A"}
            </a>
          </span>
        </div>

        <div class="flex flex-wrap justify-center md:justify-start gap-8 mt-6">
          <div class="flex flex-col items-center md:items-start">
            <p class="text-slate-900 text-2xl font-bold">${details.public_repos}</p>
            <p class="text-slate-500 uppercase tracking-wider text-xs font-semibold">Repos</p>
          </div>
          <div class="flex flex-col items-center md:items-start">
            <p class="text-slate-900 text-2xl font-bold">${details.followers}</p>
            <p class="text-slate-500 uppercase tracking-wider text-xs font-semibold">Followers</p>
          </div>
          <div class="flex flex-col items-center md:items-start">
            <p class="text-slate-900 text-2xl font-bold">${details.following}</p>
            <p class="text-slate-500 uppercase tracking-wider text-xs font-semibold">Following</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm font-medium text-slate-500">
            🗓 Joined <span class="text-slate-900">${new Date(details.created_at).toDateString()}</span>
          </div>
          <a href="${details.html_url}" target="_blank"
            class="inline-block bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold uppercase tracking-wide px-6 py-3 rounded-xl transition duration-200 shadow-md">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  `;
}

function decorateRepos(repos) {
  return repos
    .map(
      (repo) => `
    <div class="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-900/10 hover:border-teal-400 hover:shadow-md transition duration-300 group flex flex-col h-full">
      <div class="flex items-start justify-between mb-3 gap-2">
        <h4 class="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition line-clamp-1">${repo.name}</h4>
        <a href="${repo.html_url}" target="_blank" title="View Repo" class="text-slate-400 hover:text-teal-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-current" viewBox="0 0 20 20">
            <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 01-.707 1.707H15v6a1 1 0 01-1 1h-2a1 1 0 010-2h1V8h-3a1 1 0 010-2h3V3a1 1 0 01.293-.707zM3 5a2 2 0 012-2h4a1 1 0 010 2H5v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
          </svg>
        </a>
      </div>

      <p class="text-slate-600 text-sm mb-5 flex-1 line-clamp-2">${repo.description || "No description available."}</p>

      <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 mt-auto">
        <span class="bg-slate-900/5 border border-slate-900/10 px-2.5 py-1 rounded-md flex items-center gap-1">
          <span class="text-amber-500 text-sm leading-none">★</span> ${repo.stargazers_count}
        </span>
        <span class="bg-slate-900/5 border border-slate-900/10 px-2.5 py-1 rounded-md flex items-center gap-1">
          <span class="text-slate-400 text-sm leading-none">🍴</span> ${repo.forks_count}
        </span>
        <span class="bg-slate-900/5 border border-slate-900/10 px-2.5 py-1 rounded-md flex items-center gap-1">
          <span class="text-teal-500 text-lg leading-none mt-[-4px]">•</span> ${repo.language || "N/A"}
        </span>
      </div>
    </div>
  `,
    )
    .join("");
}

function loadUser(username) {
  card.innerHTML = `<div class="flex justify-center p-8"><div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500"></div></div>`;
  card.classList.remove("hidden");
  repoContainer.innerHTML = "";
  repoContainer.classList.add("hidden");

  Promise.all([getProfileData(username), getRepos(username)])
    .then(([profile, repos]) => {
      card.innerHTML = decorateProfile(profile);

      if (repos.length > 0) {
        decorateRepos(repos);
        repoContainer.classList.remove("hidden");
      }
    })
    .catch((err) => {
      card.innerHTML = `<p class="text-red-500 font-medium text-center py-4">${err.message}</p>`;
      repoContainer.classList.add("hidden");
    });
}

searchBtn.addEventListener("click", () => {
  const username = usernameinp.value.trim();
  if (username) loadUser(username);
  else alert("Please enter a GitHub username.");
});

usernameinp.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

window.addEventListener("DOMContentLoaded", () => {
  loadUser("octocat");
});
