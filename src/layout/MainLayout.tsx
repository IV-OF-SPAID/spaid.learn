import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import supabase from "../config/supabaseClient";
import Navlogged from "../components/Navlogged";
import type { User } from "@supabase/supabase-js";

const MainLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const profileChannelRef = useRef<any>(null);

  async function generateUniqueUsername() {
    for (let i = 0; i < 10; i++) {
      const candidate = "user" + Math.floor(1000 + Math.random() * 9000);
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", candidate)
        .limit(1);
      if (!existing || (Array.isArray(existing) && existing.length === 0))
        return candidate;
    }
    return "user" + Date.now().toString().slice(-4);
  }

  useEffect(() => {
    // helper to create realtime subscription for a given user id
    function createProfileSubscription(userId: string) {
      // remove existing channel if present
      try {
        if (profileChannelRef.current) {
          // v2 API: removeChannel
          // try both patterns to be resilient to supabase client version
          (supabase.removeChannel as any)?.(profileChannelRef.current);
        }
      } catch (e) {
        /* ignore */
      }
      // create new channel
      profileChannelRef.current = supabase
        .channel(`public:profiles:id=eq.${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${userId}`,
          },
          (payload: any) => {
            const newProfile = payload?.new ?? null;
            if (newProfile) {
              sessionStorage.setItem("profile", JSON.stringify(newProfile));
            } else if (payload?.eventType === "DELETE") {
              sessionStorage.removeItem("profile");
            }
            // notify other parts of the app in the same tab
            window.dispatchEvent(
              new CustomEvent("profile_updated", { detail: newProfile })
            );
          }
        )
        .subscribe();
    }

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;
      const authUser = session?.user ?? null;

      // Added: store session token immediately (no delay)
      if (session) {
        sessionStorage.setItem("token", JSON.stringify(session));
      } else {
        sessionStorage.removeItem("token");
      }

      setUser(authUser);

      if (authUser) {
        // try to get existing profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (!profile) {
          let username = localStorage.getItem("pending_username") ?? null;
          if (!username) {
            username =
              authUser.user_metadata?.full_name ??
              authUser.user_metadata?.name ??
              (await generateUniqueUsername());
          }

          await supabase.from("profiles").upsert(
            {
              id: authUser.id,
              username,
              role: "student",
              created_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          // re-fetch profile after upsert and store it
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (newProfile) {
            sessionStorage.setItem("profile", JSON.stringify(newProfile));
            window.dispatchEvent(
              new CustomEvent("profile_updated", { detail: newProfile })
            );
          }

          localStorage.removeItem("pending_username");
        } else {
          // store existing profile in sessionStorage
          sessionStorage.setItem("profile", JSON.stringify(profile));
          window.dispatchEvent(
            new CustomEvent("profile_updated", { detail: profile })
          );
        }

        // create realtime subscription for this user's profile
        createProfileSubscription(authUser.id);
      } else {
        // no auth user: make sure profile is removed
        sessionStorage.removeItem("profile");
        window.dispatchEvent(
          new CustomEvent("profile_updated", { detail: null })
        );
        if (location.pathname !== "/" && location.pathname !== "/reset") {
          navigate("/", { replace: true });
        }
      }

      if (authUser && location.pathname === "/") {
        navigate("/Home", { replace: true });
      }
    })();

    // Listen for auth changes and set/remove token when user signs in/out
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Extended: include TOKEN_REFRESHED and USER_UPDATED
        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          if (session) {
            sessionStorage.setItem("token", JSON.stringify(session));
          }
          // fetch and store profile for the signed-in user
          (async () => {
            const userId = session?.user?.id;
            if (userId) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();
              if (profile) {
                sessionStorage.setItem("profile", JSON.stringify(profile));
                window.dispatchEvent(
                  new CustomEvent("profile_updated", { detail: profile })
                );
              }
              // ensure realtime subscription is created for new sign-in
              try {
                createProfileSubscription(userId);
              } catch (e) {
                /* ignore */
              }
            }
          })();
        } else if (event === "SIGNED_OUT") {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("profile");
          window.dispatchEvent(
            new CustomEvent("profile_updated", { detail: null })
          );

          // remove realtime channel if present
          try {
            if (profileChannelRef.current) {
              (supabase.removeChannel as any)?.(profileChannelRef.current);
              profileChannelRef.current = null;
            }
          } catch (e) {
            /* ignore */
          }
        }
      }
    );

    return () => {
      // cleanup auth listener
      authListener?.subscription?.unsubscribe?.();
      // cleanup profile realtime channel
      try {
        if (profileChannelRef.current) {
          (supabase.removeChannel as any)?.(profileChannelRef.current);
          profileChannelRef.current = null;
        }
      } catch (e) {
        /* ignore */
      }
    };
  }, [location.pathname, navigate]);

  return (
    <>
      <Navlogged />
      <Outlet />
    </>
  );
};

export default MainLayout;
