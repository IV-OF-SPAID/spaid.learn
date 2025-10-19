import { useEffect, useState } from "react";
import Avatarcard from "../assets/img/defAvatar.svg";
import { FaPencilAlt, FaCamera } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { Link } from "react-router-dom";

interface Profile {
  id?: string;
  username?: string | null;
  role?: string | null;
  created_at?: string | null;
}

const AccountProf = () => {
  // auth user from Supabase (safer than reading sessionStorage)
  const [authUser, setAuthUser] = useState<any>(null);

  // profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string>("Learner");

  // edit UI state
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const getUserRes = await supabase.auth.getUser();
        const user = getUserRes.data?.user ?? null;
        if (!mounted) return;
        setAuthUser(user);

        if (user?.id) {
          // request both username and role; maybeSingle avoids throw when not found
          const { data: profData, error: profError } = await supabase
            .from("profiles")
            .select("username, role, created_at")
            .eq("id", user.id)
            .maybeSingle();

          if (profError) {
            console.error("fetch profile error:", profError);
          } else if (mounted) {
            const prof = (profData ?? null) as Profile | null;
            setProfile(prof);
            setRole(prof?.role ?? "Learner");

            // prefer profile.username, then auth metadata full_name/name
            const displayFromProfile = prof?.username ?? null;
            const displayFromMeta =
              user.user_metadata?.full_name || user.user_metadata?.name || null;
            setNameInput(displayFromProfile ?? displayFromMeta ?? "");
          }
        }
      } catch (err) {
        console.error("AccountProf load error:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleStartEdit = () => {
    setError(null);
    setMsg(null);
    setEditing(true);
  };

  const handleCancel = () => {
    // reset nameInput to latest values
    const displayFromProfile = profile?.username ?? null;
    const displayFromMeta =
      authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || null;
    setNameInput(displayFromProfile ?? displayFromMeta ?? "");
    setEditing(false);
    setError(null);
    setMsg(null);
  };

  const handleSave = async () => {
    setError(null);
    setMsg(null);

    if (!authUser?.id) {
      setError("Not authenticated");
      return;
    }

    const newName = nameInput.trim();
    if (!newName) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const { data: upserted, error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
            [{ id: authUser.id, username: newName }],
            { onConflict: "id" } // valid option in v2
          )
        .select("id, username, role, created_at")
        .maybeSingle();

      if (upsertErr) throw upsertErr;

      setProfile(upserted ?? null);
      setRole(upserted?.role ?? role);

      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: newName },
      });
      if (authErr) throw authErr;

      setMsg("Profile saved");
    } finally {
      setSaving(false);
    }
    try {
      const { data: refreshedProfData, error: refreshedErr } = await supabase
        .from("profiles")
        .select("username, role, created_at")
        .eq("id", authUser.id)
        .maybeSingle();

      if (refreshedErr) throw refreshedErr;

      const refreshedProf = (refreshedProfData ?? null) as Profile | null;
      setProfile(refreshedProf);
      setRole(refreshedProf?.role ?? "Learner");
      setMsg("Profile saved");
      setEditing(false);

      // optional: refresh auth user locally
      const refreshedUserRes = await supabase.auth.getUser();
      setAuthUser(refreshedUserRes.data?.user ?? authUser);
    } catch (err: any) {
      console.error("Save failed", err);
      setError(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    profile?.username ||
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    nameInput ||
    "-";

  return (
    <div className=" h-95 w-full px-10 md:px-15 lg:px-30 py-20 relative">
      <div className="relative ">
        <div className="w-1080px h-50 bg-[#f5f5f5]  rounded-md">
          <FaCamera className="text-[#989898] text-3xl absolute top-5 right-7" />
        </div>

        <div className="absolute  bottom-[-90px] h-[120px]  w-full flex items-center">
          <div className="flex flex-col md:flex-row md:items-center  w-2/4 gap-5 md:pl-5 ">
            <img
              src={authUser?.user_metadata?.avatar_url || Avatarcard}
              alt="Pfp"
              className="w-[120px] rounded-full "
            />

            {!editing ? (
              <h1 className="md:text-2xl text-xl ">{displayName}</h1>
            ) : (
              <input
                className="md:text-2xl text-xl border px-3 py-2 rounded"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                disabled={saving}
                aria-label="Edit display name"
              />
            )}

            {role === "instructor" && (
              <Link
                to="/add-course"
                className=" ml-2 flex bg-[#f5f5f5] w-30 justify-center items-center h-10 rounded-md cursor-pointer"
              >
                Add Course
              </Link>
            )}

            {!editing ? (
              <button
                onClick={handleStartEdit}
                className="ml-4 flex items-center gap-2 bg-[#f5f5f5] px-3 py-2 rounded"
              >
                <FaPencilAlt />
                Edit Profile
              </button>
            ) : (
              <div className="ml-4 flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#f5f5f5] px-3 py-2 rounded"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 bg-white border px-3 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            <FaCamera className="text-[#989898] text-3xl absolute bottom-5 left-25 md:bottom-0 md:left-27" />
          </div>

          <div className="w-2/4 h-full  flex justify-end items-center">
            <button
              type="button"
              className="flex bg-[#f5f5f5] w-30 justify-center items-center h-10 rounded-md gap-2 cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {(error || msg) && (
        <div className="mt-6 text-sm">
          {error && <div className="text-red-600">{error}</div>}
          {msg && <div className="text-green-600">{msg}</div>}
        </div>
      )}
    </div>
  );
};

export default AccountProf;