function saveUserSession(role, name, email) {
  const userData = {
    role,
    name,
    email,
    loggedInAt: Date.now()
  };
  localStorage.setItem("skillforgeUser", JSON.stringify(userData));
}

function redirectToDashboard(role) {
  const r = (role || "").toLowerCase();
  let target = "../Dashboards/student.html";
  if (r === "instructor") target = "../Dashboards/instructor.html";
  else if (r === "admin") target = "../Dashboards/admin.html";
  window.location.href = target;
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

const navAnchors = document.querySelectorAll(".nav-links a");
navAnchors.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (navLinks) {
      navLinks.classList.remove("open");
    }
    navAnchors.forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
  });
});

const getStartedBtn = document.getElementById("getStartedBtn");
if (getStartedBtn) {
  getStartedBtn.addEventListener("click", () => {
    const signupModal = document.getElementById("signupModal");
    if (signupModal) signupModal.style.display = "flex";
  });
}

const exploreCoursesBtn = document.getElementById("exploreCoursesBtn");
if (exploreCoursesBtn) {
  exploreCoursesBtn.addEventListener("click", () => {
    const coursesSection = document.getElementById("courses");
    if (coursesSection) {
      coursesSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
}

const ctaSignupBtn = document.getElementById("ctaSignupBtn");
if (ctaSignupBtn) {
  ctaSignupBtn.addEventListener("click", () => {
    const signupModal = document.getElementById("signupModal");
    if (signupModal) signupModal.style.display = "flex";
  });
}

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginBtnMobile = document.getElementById("loginBtnMobile");
const signupBtnMobile = document.getElementById("signupBtnMobile");

[loginBtn, loginBtnMobile].forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      const loginModal = document.getElementById("loginModal");
      if (loginModal) loginModal.style.display = "flex";
    });
  }
});

[signupBtn, signupBtnMobile].forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      const signupModal = document.getElementById("signupModal");
      if (signupModal) signupModal.style.display = "flex";
    });
  }
});

const modalCloseButtons = document.querySelectorAll(".modal-close");
modalCloseButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const modalId = btn.getAttribute("data-close-modal");
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = "none";
    }
  });
});

const modals = document.querySelectorAll(".modal-backdrop");
modals.forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.style.display = "none";
    }
  });
});

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roleEl = document.getElementById("loginRole");
    const emailEl = document.getElementById("loginEmail");
    const passwordEl = document.getElementById("loginPassword");
    const error = document.getElementById("loginError");

    if (!roleEl || !emailEl || !passwordEl || !error) return;

    const role = roleEl.value;
    const email = emailEl.value.trim();
    const password = passwordEl.value.trim();

    if (!email || !password) {
      error.style.display = "block";
      return;
    }

    error.style.display = "none";

    const nameGuess = email.split("@")[0] || "User";
    saveUserSession(role, nameGuess, email);
    redirectToDashboard(role);
  });
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roleEl = document.getElementById("signupRole");
    const nameEl = document.getElementById("signupName");
    const emailEl = document.getElementById("signupEmail");
    const passwordEl = document.getElementById("signupPassword");
    const error = document.getElementById("signupError");

    if (!roleEl || !nameEl || !emailEl || !passwordEl || !error) return;

    const role = roleEl.value;
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value.trim();

    if (!name || !email || !password) {
      error.style.display = "block";
      return;
    }

    error.style.display = "none";

    saveUserSession(role, name, email);
    redirectToDashboard(role);
  });
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you for contacting SkillForge. We will get back to you soon.");
    e.target.reset();
  });
}
