import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn’t start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn’t create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can’t be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don’t have permission to sign up.",
        Configuration:
          "Sign-up isn’t working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0D0D0D] p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-[#1A1A1A] p-8 shadow-xl border border-[#2E2E2E]"
      >
        <h1 className="mb-2 text-center text-3xl font-black text-white uppercase tracking-tighter">
          BODY<span className="text-[#FF6A1A]">FORGE</span>
        </h1>
        <p className="mb-8 text-center text-gray-400 text-sm font-medium">
          CREATE YOUR ACCOUNT
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider">
              Email
            </label>
            <div className="overflow-hidden rounded-xl border border-[#2E2E2E] bg-[#0D0D0D] px-4 py-3 focus-within:border-[#FF6A1A] transition-colors">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-white outline-none placeholder:text-gray-600"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="overflow-hidden rounded-xl border border-[#2E2E2E] bg-[#0D0D0D] px-4 py-3 focus-within:border-[#FF6A1A] transition-colors">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-white outline-none placeholder:text-gray-600"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-900/50 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#FF6A1A] px-4 py-4 text-base font-black text-white uppercase tracking-widest transition-all hover:bg-[#FF3A00] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#FF6A1A]/20"
          >
            {loading ? "FORGING..." : "SIGN UP"}
          </button>
          <p className="text-center text-sm text-gray-500 font-medium">
            ALREADY HAVE AN ACCOUNT?{" "}
            <a
              href={`/account/signin${typeof window !== "undefined" ? window.location.search : ""}`}
              className="text-[#FF6A1A] hover:text-[#FF3A00] font-bold"
            >
              SIGN IN
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
