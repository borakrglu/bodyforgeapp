import useAuth from "@/utils/useAuth";
import { useEffect } from "react";

function MainComponent() {
  const { signOut } = useAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    };
    handleSignOut();
  }, [signOut]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0D0D0D] p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1A1A1A] p-8 shadow-xl border border-[#2E2E2E] text-center">
        <h1 className="mb-4 text-2xl font-black text-white uppercase tracking-tighter">
          SIGNING OUT...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A1A] mx-auto"></div>
      </div>
    </div>
  );
}

export default MainComponent;
