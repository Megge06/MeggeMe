const win = document.getElementById("post-window");
const ame = document.getElementById("ame-window");
const img = ame.querySelector("img.ame");
const originalListHTML = win.innerHTML;

function enableDragging(el) {
  if (!el) return;
  if (!window.matchMedia("(min-aspect-ratio: 1/1)").matches) return;

  let dragging = false;
  let startX = 0,
    startY = 0;
  let currentX = 0,
    currentY = 0;

  function beginDrag(clientX, clientY) {
    startX = clientX;
    startY = clientY;
    dragging = true;
  }

  function moveDrag(clientX, clientY) {
    if (!dragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;

    const newX = currentX + dx;
    const newY = currentY + dy;
    el.style.transform = `translate(${newX}px, ${newY}px)`;
  }

  function endDrag(clientX, clientY) {
    if (!dragging) return;

    const dx = clientX - startX;
    const dy = clientY - startY;
    currentX += dx;
    currentY += dy;

    dragging = false;
  }

  el.addEventListener("mousedown", (e) => {
    if (e.target !== el) return;
    beginDrag(e.clientX, e.clientY);
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener("mouseup", (e) => endDrag(e.clientX, e.clientY));

  el.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      if (e.target !== el) return;
      beginDrag(t.clientX, t.clientY);
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    },
    { passive: true },
  );

  window.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    endDrag(t.clientX, t.clientY);
  });
}

enableDragging(win);
enableDragging(ame);

let zIndexCounter = 10;

function bringToFront(element) {
  zIndexCounter++;
  element.style.zIndex = zIndexCounter;
}

win.addEventListener("mousedown", () => bringToFront(win));
win.addEventListener("touchstart", () => bringToFront(win));

ame.addEventListener("mousedown", () => bringToFront(ame));
ame.addEventListener("touchstart", () => bringToFront(ame));

async function loadPost(url, event, pushState = true) {
  if (event) event.preventDefault();
  try {
    const res = await fetch(url);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, "text/html");
    const header = doc.querySelector(".post-header");
    const content = doc.querySelector(".post-content");
    const button = doc.querySelector(".post-list-button");
    win.innerHTML = "";
    if (header) win.appendChild(document.adoptNode(header));
    if (content) {
      const adoptedContent = document.adoptNode(content);
      win.appendChild(adoptedContent);

      const slug = url.replace(/\/$/, "").split("/").pop() || "default";
      const commentsDiv = document.createElement("div");
      commentsDiv.className = "comments-section";
      adoptedContent.appendChild(commentsDiv);

      loadComments(commentsDiv, slug, url);
    }
    if (button) win.appendChild(document.adoptNode(button));

    if (pushState) {
      history.pushState({ type: "post", url: url }, "", url);
    }
  } catch (err) {
    win.innerHTML =
      '<p>The blog post could not be loaded. <a onClick="loadList();">Return to Post List.</a></p>';
    console.error("Failed to load post:", err);
  }
}

async function loadComments(container, slug, url) {
  container.innerHTML = `<h3>Comments & Mentions</h3><div class="comments-list">Loading...</div>`;

  const formHtml = `
    <form class="comment-form">
      <h4>Leave a Comment</h4>
      <div class="form-group">
        <label for="comment-name">Name</label>
        <input type="text" id="comment-name" name="name" required maxlength="50" placeholder="Your name..." />
      </div>
      <div class="form-group">
        <label for="comment-message">Message</label>
        <textarea id="comment-message" name="message" required maxlength="1000" placeholder="Type your comment..."></textarea>
      </div>
      <div class="comment-error" style="display: none;"></div>
      <button type="submit" class="comment-submit-btn">Send</button>
    </form>
  `;

  const formTemp = document.createElement("div");
  formTemp.innerHTML = formHtml;
  const form = formTemp.querySelector("form");
  container.appendChild(form);

  const listDiv = container.querySelector(".comments-list");
  const errorDiv = form.querySelector(".comment-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.style.display = "none";
    const nameInput = form.querySelector("#comment-name");
    const messageInput = form.querySelector("#comment-message");
    const submitBtn = form.querySelector(".comment-submit-btn");

    const body = {
      post_slug: slug,
      name: nameInput.value.trim(),
      message: messageInput.value.trim(),
    };

    if (!body.name || !body.message) {
      errorDiv.textContent = "Please fill in all fields.";
      errorDiv.style.display = "block";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        form.reset();
        await fetchAndRenderComments(listDiv, slug, url);
      } else {
        const text = await res.text();
        errorDiv.textContent = text || "Failed to submit comment.";
        errorDiv.style.display = "block";
      }
    } catch (err) {
      errorDiv.textContent = "Network error. Please try again.";
      errorDiv.style.display = "block";
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send";
    }
  });

  await fetchAndRenderComments(listDiv, slug, url);
}

async function fetchLocalComments(slug) {
  try {
    const res = await fetch(`/api/comments?post=${slug}`);
    return res.ok ? await res.json() : [];
  } catch (err) {
    console.error("Local comments fetch failed:", err);
    return [];
  }
}

async function fetchWebmentions(targetUrl) {
  try {
    const res = await fetch(
      `https://webmention.io/api/mentions.jf2?target=${encodeURIComponent(targetUrl)}`,
    );
    if (res.ok) {
      const data = await res.json();
      return data.children || [];
    }
    return [];
  } catch (err) {
    console.error("Webmentions fetch failed:", err);
    return [];
  }
}

async function fetchAndRenderComments(listDiv, slug, url) {
  listDiv.innerHTML = "Loading interactions...";

  const targetUrl = new URL(url, window.location.origin).href;

  const [localComments, webmentions] = await Promise.all([
    fetchLocalComments(slug),
    fetchWebmentions(targetUrl),
  ]);

  listDiv.innerHTML = "";

  if (localComments.length === 0 && webmentions.length === 0) {
    listDiv.innerHTML = "<p>No comments yet. Be the first!</p>";
    return;
  }

  const replies = [];
  const likes = [];
  const reposts = [];

  webmentions.forEach((wm) => {
    const propertyType = wm["wm-property"];
    if (propertyType === "like-of") {
      likes.push(wm);
    } else if (propertyType === "repost-of") {
      reposts.push(wm);
    } else if (
      propertyType === "in-reply-to" ||
      propertyType === "mention-of"
    ) {
      replies.push(wm);
    }
  });

  if (likes.length > 0 || reposts.length > 0) {
    const interactionsBox = document.createElement("div");
    interactionsBox.className = "wm-interactions-box";

    if (likes.length > 0) {
      const likesRow = document.createElement("div");
      likesRow.className = "wm-interaction-row";
      likesRow.innerHTML = `<span class="wm-interaction-label">Likes (${likes.length}):</span> `;
      likes.forEach((like) => {
        const link = document.createElement("a");
        link.href = like.author && like.author.url ? like.author.url : like.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.src =
          like.author && like.author.photo
            ? like.author.photo
            : "../assets/images/icon_cho.png";
        img.alt = like.author && like.author.name ? like.author.name : "Like";
        img.title = like.author && like.author.name ? like.author.name : "Like";
        img.className = "wm-mini-avatar";

        link.appendChild(img);
        likesRow.appendChild(link);
      });
      interactionsBox.appendChild(likesRow);
    }

    if (reposts.length > 0) {
      const repostsRow = document.createElement("div");
      repostsRow.className = "wm-interaction-row";
      repostsRow.innerHTML = `<span class="wm-interaction-label">Reposts (${reposts.length}):</span> `;
      reposts.forEach((repost) => {
        const link = document.createElement("a");
        link.href =
          repost.author && repost.author.url ? repost.author.url : repost.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.src =
          repost.author && repost.author.photo
            ? repost.author.photo
            : "../assets/images/icon_cho.png";
        img.alt =
          repost.author && repost.author.name ? repost.author.name : "Repost";
        img.title =
          repost.author && repost.author.name ? repost.author.name : "Repost";
        img.className = "wm-mini-avatar";

        link.appendChild(img);
        repostsRow.appendChild(link);
      });
      interactionsBox.appendChild(repostsRow);
    }

    listDiv.appendChild(interactionsBox);
  }

  const normalizedReplies = [
    ...localComments.map((c) => ({
      source: "local",
      name: c.name,
      date: new Date(c.date),
      message: c.message,
      avatar: null,
      url: null,
    })),
    ...replies.map((r) => ({
      source: "webmention",
      name: r.author && r.author.name ? r.author.name : "Anonymous",
      date: new Date(r.published || r["wm-received"]),
      message: r.content
        ? r.content.text || r.content.html || "Mentioned this page."
        : "Mentioned this page.",
      avatar: r.author && r.author.photo ? r.author.photo : null,
      url: r.author && r.author.url ? r.author.url : r.url,
    })),
  ];

  normalizedReplies.sort((a, b) => a.date - b.date);

  normalizedReplies.forEach((reply) => {
    const card = document.createElement("div");
    card.className = "comment-card";
    if (reply.source === "webmention") {
      card.classList.add("webmention-card");
    }

    const header = document.createElement("div");
    header.className = "comment-header";

    const nameSpan = document.createElement("span");
    nameSpan.className = "comment-name";

    if (reply.avatar) {
      const avatarImg = document.createElement("img");
      avatarImg.className = "comment-avatar-mini";
      avatarImg.src = reply.avatar;
      avatarImg.alt = "";
      nameSpan.appendChild(avatarImg);
    }

    const nameText = document.createElement("span");
    nameText.textContent = reply.name;
    nameSpan.appendChild(nameText);

    if (reply.url) {
      const link = document.createElement("a");
      link.href = reply.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "comment-webmention-link";
      link.textContent = " [web]";
      nameSpan.appendChild(link);
    }

    const dateSpan = document.createElement("span");
    dateSpan.className = "comment-date";
    dateSpan.textContent = reply.date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    header.appendChild(nameSpan);
    header.appendChild(dateSpan);

    const msgDiv = document.createElement("div");
    msgDiv.className = "comment-message";

    msgDiv.textContent = reply.message;

    card.appendChild(header);
    card.appendChild(msgDiv);
    listDiv.appendChild(card);
  });
}

function loadList(pushState = true) {
  win.innerHTML = originalListHTML;
  if (pushState) {
    history.pushState({ type: "list" }, "", "/blog/");
  }
}

function setAmeExpressionTemp(expression, length = 1500) {
  if (!ame) return;
  if (!img) return;
  if (img.id == "ame-temp-expression") return;
  img.src = `${window.AME_ASSETS_PATH}${expression}.png`;
  img.id = "ame-temp-expression";
  setTimeout(() => {
    img.src = `${window.AME_ASSETS_PATH}neutral.png`;
    img.removeAttribute("id");
  }, length);
}

function blink() {
  if (img.id == "ame-temp-expression") return;
  img.src = `${window.AME_ASSETS_PATH}blink.png`;
  setTimeout(() => {
    img.src = `${window.AME_ASSETS_PATH}neutral.png`;
  }, 150);
}

function randomExpression() {
  const expressions = ["game", "movie", "obsessed"];
  const expr = expressions[Math.floor(Math.random() * expressions.length)];
  setAmeExpressionTemp(expr, 5000);
}

setInterval(randomExpression, 20000);
setInterval(blink, 3000 + Math.random() * 2000);

// Handle back/forward browser buttons
window.addEventListener("popstate", (e) => {
  if (e.state && e.state.type === "post") {
    loadPost(e.state.url, null, false);
  } else {
    loadList(false);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const postPath = params.get("post");
  if (postPath) {
    loadPost(postPath, null, false);
    history.replaceState({ type: "post", url: postPath }, "", postPath);
  }
});
