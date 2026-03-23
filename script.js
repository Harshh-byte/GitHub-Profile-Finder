let searchBtn = document.querySelector(".search");
let usernameinp = document.querySelector(".username-input");
let card = document.querySelector(".card");
let repoContainer = document.querySelector(".repo-container");

function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

function fetchLinkPreview(url) {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false&meta=true`;
  return fetch(endpoint)
    .then((res) => {
      if (!res.ok) throw new Error("Preview request failed.");
      return res.json();
    })
    .then((payload) => {
      if (payload.status !== "success" || !payload.data) {
        throw new Error("Preview data unavailable.");
      }

      const data = payload.data;
      return {
        title: data.title || getHostname(url),
        description: data.description || "No preview description available.",
        image: data.image?.url || "",
        publisher: data.publisher || getHostname(url),
      };
    });
}

function renderBlogPreview(blogUrl) {
  const previewRoot = card.querySelector(".link-preview");
  if (!previewRoot) return;

  const linkEl = previewRoot.querySelector(".preview-link");
  const titleEl = previewRoot.querySelector(".preview-title");
  const descriptionEl = previewRoot.querySelector(".preview-description");
  const urlEl = previewRoot.querySelector(".preview-url");
  const imageWrapEl = previewRoot.querySelector(".preview-image-wrap");
  const imageEl = previewRoot.querySelector(".preview-image");

  const normalizedUrl = normalizeUrl(blogUrl);
  if (!normalizedUrl) {
    previewRoot.classList.add("hidden");
    return;
  }

  linkEl.href = normalizedUrl;
  previewRoot.classList.remove("hidden");

  titleEl.textContent = "Loading link preview...";
  descriptionEl.textContent = "Fetching metadata for this website.";
  urlEl.textContent = getHostname(normalizedUrl);
  imageWrapEl.classList.add("hidden");

  fetchLinkPreview(normalizedUrl)
    .then((preview) => {
      titleEl.textContent = truncateText(preview.title, 80);
      descriptionEl.textContent = truncateText(preview.description, 140);
      urlEl.textContent = preview.publisher;

      if (preview.image) {
        imageEl.src = preview.image;
        imageEl.alt = `${preview.title} preview`;
        imageWrapEl.classList.remove("hidden");
      } else {
        imageWrapEl.classList.add("hidden");
      }
    })
    .catch(() => {
      titleEl.textContent = "Preview unavailable";
      descriptionEl.textContent =
        "We could not load metadata for this site, but you can still open the link.";
      urlEl.textContent = getHostname(normalizedUrl);
      imageWrapEl.classList.add("hidden");
    });
}

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
  const normalizedBlog = normalizeUrl(details.blog);

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
            <a href="${normalizedBlog || "#"}" target="_blank" rel="noopener noreferrer" class="text-teal-600 hover:text-teal-700 hover:underline">
              ${normalizedBlog ? normalizedBlog.replace(/^https?:\/\//, "") : "N/A"}
            </a>
          </span>
        </div>

        <div class="link-preview hidden mt-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-900/10 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.12)] mx-auto md:mx-0">
          <a class="preview-link group block" href="#" target="_blank" rel="noopener noreferrer">
            <div class="preview-image-wrap hidden relative w-full overflow-hidden bg-slate-100" style="aspect-ratio: 16 / 9;">
              <img class="preview-image h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" alt="Preview image">
              <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/45 to-transparent"></div>
            </div>
            <div class="min-w-0 px-4 py-4 sm:px-5 sm:py-5 text-left">
              <p class="preview-url text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700"></p>
              <p class="preview-title mt-2 text-base sm:text-lg font-bold text-slate-900 leading-snug"></p>
              <p class="preview-description mt-2 text-sm text-slate-600 leading-relaxed"></p>
              <span class="mt-4 inline-flex items-center rounded-full border border-slate-900/10 bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                Open Website
              </span>
            </div>
          </a>
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
      renderBlogPreview(profile.blog);

      if (repos.length > 0) {
        repoContainer.innerHTML = decorateRepos(repos);
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
  const footerText = document.querySelector("footer p");
  if (footerText) {
    footerText.textContent = footerText.textContent.replace(
      "{currentYear}",
      new Date().getFullYear(),
    );
  }
  loadUser("octocat");
});
