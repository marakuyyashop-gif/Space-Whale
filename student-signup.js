(() => {
  const client = window.spaceWhaleSupabase;
  const form = document.getElementById("studentSignupForm");
  const createButton = document.getElementById("createAccountButton");
  const signInButton = document.getElementById("signInButton");
  const message = document.getElementById("studentSignupMessage");
  const params = new URLSearchParams(location.search);
  const invite = params.get("invite");

  if (!invite) {
    message.textContent = "This student link is missing its invitation code.";
    createButton.disabled = true;
    signInButton.disabled = true;
    return;
  }

  async function acceptInvite() {
    const { data, error } = await client.rpc("accept_student_invite", {
      p_token: invite
    });

    if (error) throw error;
    if (!data?.ok) throw new Error("Could not connect this account to the teacher.");

    location.href = "dashboard.html";
  }

  async function finishExistingSession() {
    const { data } = await client.auth.getSession();
    if (data.session) {
      message.textContent = "Connecting your account to the teacher…";
      try {
        await acceptInvite();
      } catch (error) {
        message.textContent = error.message;
      }
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    createButton.disabled = true;
    signInButton.disabled = true;
    message.textContent = "Creating account…";

    const email = document.getElementById("studentEmail").value.trim();
    const password = document.getElementById("studentPassword").value;

    const { data, error } = await client.auth.signUp({
      email,
      password
    });

    if (error) {
      createButton.disabled = false;
      signInButton.disabled = false;
      message.textContent = error.message;
      return;
    }

    if (!data.session) {
      createButton.disabled = false;
      signInButton.disabled = false;
      message.textContent = "Account created, but Supabase is still requiring email confirmation. Turn off Confirm email in Supabase for this test flow.";
      return;
    }

    message.textContent = "Connecting your account to the teacher…";

    try {
      await acceptInvite();
    } catch (error) {
      createButton.disabled = false;
      signInButton.disabled = false;
      message.textContent = error.message;
    }
  });

  signInButton.addEventListener("click", async () => {
    createButton.disabled = true;
    signInButton.disabled = true;
    message.textContent = "Signing in…";

    const email = document.getElementById("studentEmail").value.trim();
    const password = document.getElementById("studentPassword").value;

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.session) {
      createButton.disabled = false;
      signInButton.disabled = false;
      message.textContent = error?.message || "Could not sign in.";
      return;
    }

    message.textContent = "Connecting your account to the teacher…";

    try {
      await acceptInvite();
    } catch (error) {
      createButton.disabled = false;
      signInButton.disabled = false;
      message.textContent = error.message;
    }
  });

  finishExistingSession();
})();