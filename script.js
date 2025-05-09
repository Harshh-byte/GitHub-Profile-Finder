let searchBtn = document.querySelector(".search");
let usernameinp = document.querySelector(".username-input");
let card = document.querySelector(".card");

function getProfileData(username) {
    return fetch(`https://api.github.com/users/${username}`).then((raw) => {
        if (!raw.ok) throw new Error("User not found.")
        return raw.json();
    })
}

function getRepos(username) {
    return fetch(`https://api.github.com/users/${username}/repos?sort=updated`).then((raw) => {
        if (!raw.ok) throw new Error("Failed to fetch repos.")
        return raw.json();
    })
}

function decorateProfileData(details) {
    let data = `<!-- Avatar -->
      <div>
        <img id="avatar" src="${details.avatar_url}" alt="User Avatar"
          class="w-32 h-32 rounded-full border-4 border-blue-600 object-cover">
      </div>

      <!-- Info -->
      <div class="flex-1 space-y-3 text-center md:text-left">
        <div>
          <h2 id="name" class="text-2xl font-bold text-white">${details.name || "No Name"}</h2>
          <p id="username" class="text-blue-400 text-sm">@${details.login}</p>
        </div>

        <p id="bio" class="text-gray-300">${details.bio || "No bio available."}</p>

        <div class="flex flex-wrap gap-4 text-sm text-gray-400 mt-4">
          <span><strong class="text-white">📍 Location:</strong> <span id="location">${details.location || "N/A"}</span></span>
          <span><strong class="text-white">🏢 Company:</strong> <span id="company">${details.company || "N/A"}</span></span>
          <span><strong class="text-white">🔗 Website:</strong> <a id="blog" href="${details.blog || "#"}"
              class="text-blue-500 hover:underline" target="_blank">${details.blog ? details.blog.replace(/^https?:\/\//, '') : "N/A"}</a></span>
        </div>

        <div class="flex gap-6 mt-6 text-center text-gray-300 text-sm">
          <div>
            <p class="text-white text-lg font-semibold" id="repos">${details.public_repos}</p>
            <p>Repos</p>
          </div>
          <div>
            <p class="text-white text-lg font-semibold" id="followers">${details.followers}</p>
            <p>Followers</p>
          </div>
          <div>
            <p class="text-white text-lg font-semibold" id="following">${details.following}</p>
            <p>Following</p>
          </div>
        </div>

        <div class="mt-6 text-sm text-gray-400">
          <strong class="text-white">🗓 Joined:</strong> <span id="joined"> ${new Date(details.created_at).toDateString()}</span>
        </div>

        <div class="mt-4">
          <a id="github-link" href="${details.html_url}" target="_blank"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl transition duration-200">
            View on GitHub
          </a>
        </div>
      </div>
`
return data;
}

searchBtn.addEventListener("click", function () {
    let username = usernameinp.value.trim();
    if (username.length > 0) {
    getProfileData(username)
      .then(data => {
        const html = decorateProfileData(data);
        card.innerHTML = html;
        card.classList.remove("hidden");
      })
      .catch(err => {
        alert("Error: " + err.message);
        card.innerHTML = "";
        card.classList.add("hidden");
      });
  } else {
    alert("Please enter a GitHub username.");
    }
})