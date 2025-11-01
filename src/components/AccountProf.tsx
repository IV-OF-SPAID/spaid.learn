import { useEffect, useState, useRef } from "react";
import Avatarcard from "../assets/img/defAvatar.svg";
import { FaPencilAlt, FaCamera } from "react-icons/fa";
import supabase from "../config/supabaseClient";
import { Link } from "react-router-dom";

interface Profile {
  id?: string;
  username?: string | null;
  role?: string | null;
  created_at?: string | null;
  avatar_url?: string | null;
}

const AccountProf = () => {
  // auth user from Supabase (safer than reading sessionStorage)
  const [authUser, setAuthUser] = useState<any>(null);

  // profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string>("Learner");

  // loading state for skeleton
  const [loading, setLoading] = useState<boolean>(true);

  // edit UI state
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState<string>("");
  // keep original value to revert on cancel
  const originalNameRef = useRef<string | null>(null);
  // file input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // local selected file and preview 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // popup state for top notifications
  const [popup, setPopup] = useState<{
    visible: boolean;
    text: string;
    type: "success" | "error";
  }>({ visible: false, text: "", type: "success" });

  // show popup when msg or error changes
  useEffect(() => {
    if (!msg && !error) return;
    const text = error ?? msg ?? "";
    const type = error ? "error" : "success";
    setPopup({ visible: true, text, type });

    const t = setTimeout(() => {
      setPopup((p) => ({ ...p, visible: false }));
    }, 4000);

    return () => clearTimeout(t);
  }, [msg, error]);

  const dismissPopup = () => setPopup((p) => ({ ...p, visible: false }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const getUserRes = await supabase.auth.getUser();
        const user = getUserRes.data?.user ?? null;
        if (!mounted) return;
        setAuthUser(user);

        if (user?.id) {
          // request both username, role and avatar_url; maybeSingle avoids throw when not found
          const { data: profData, error: profError } = await supabase
            .from("profiles")
            .select("username, role, created_at, avatar_url")
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
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleStartEdit = () => {
    setError(null);
    setMsg(null);
    // snapshot current displayed name so cancel can revert reliably
    originalNameRef.current =
      profile?.username ||
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      nameInput;
    setEditing(true);
  };

  const handleCancel = () => {
    // revert nameInput to the original snapshot (fallback to profile/auth meta)
    const original = originalNameRef.current;
    if (original !== null) {
      setNameInput(original);
    } else {
      const displayFromProfile = profile?.username ?? null;
      const displayFromMeta =
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        null;
      setNameInput(displayFromProfile ?? displayFromMeta ?? "");
    }

    // discard any selected avatar preview and clear snapshot/UI state
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {
        /* ignore */
      }
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    originalNameRef.current = null;
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
    setLoading(true);
    setSaving(true);
    try {
      // if a new avatar was selected, upload it first and get the public URL
      let avatarUrl: string | undefined = undefined;
      if (selectedFile) {
        try {
          const ext = selectedFile.name.split(".").pop();
          const filePath = `${authUser.id}/${Date.now()}.${ext}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("Avatar")
            .upload(filePath, selectedFile, { upsert: true });
          if (uploadErr) throw uploadErr;
          const { data: urlData } = supabase.storage
            .from("Avatar")
            .getPublicUrl(filePath);
          avatarUrl = (urlData as any)?.publicUrl;
          if (!avatarUrl) throw new Error("Failed to get public URL");
        } catch (uploadErr) {
          throw uploadErr;
        }
      }

      const { data: upserted, error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
          // include avatar_url when available
          [
            {
              id: authUser.id,
              username: newName,
              ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
            },
          ],
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

      // After successful update, update the sessionStorage profile immediately
      try {
        // merge with existing profile if present
        const existing =
          JSON.parse(sessionStorage.getItem("profile") || "null") || {};
        const updatedProfile = {
          ...existing,
          id: authUser.id,
          username: newName,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        };

        // ensure id is present (DB may return data array/object depending on upsert)
        if (upserted) {
          const returned = Array.isArray(upserted) ? upserted[0] : upserted;
          if (returned && typeof returned === "object") {
            Object.assign(updatedProfile, returned);
          }
        }

        sessionStorage.setItem("profile", JSON.stringify(updatedProfile));
        // notify same-tab listeners (Navlogged listens for this)
        window.dispatchEvent(
          new CustomEvent("profile_updated", { detail: updatedProfile })
        );
      } catch (e) {
        // ...optional: handle sessionStorage errors silently...
      }

      setMsg("Profile saved");

      // refresh profile (include avatar_url) and persist updated profile to sessionStorage
      const { data: refreshedProfData, error: refreshedErr } = await supabase
        .from("profiles")
        .select("username, role, created_at, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle();

      if (refreshedErr) throw refreshedErr;

      const refreshedProf = (refreshedProfData ?? null) as Profile | null;
      setProfile(refreshedProf);
      setRole(refreshedProf?.role ?? "Learner");

      try {
        if (refreshedProf) {
          sessionStorage.setItem("profile", JSON.stringify(refreshedProf));
          window.dispatchEvent(
            new CustomEvent("profile_updated", { detail: refreshedProf })
          );
        }
      } catch (e) {
        /* ignore sessionStorage errors */
      }

      // clear preview/selected file after successful save
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);

      setEditing(false);

      // optional: refresh auth user locally
      const refreshedUserRes = await supabase.auth.getUser();
      setAuthUser(refreshedUserRes.data?.user ?? authUser);
    } catch (err: any) {
      console.error("Save failed", err);
      setError(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  // open file picker when camera clicked (only in edit mode)
  const onCameraClick = () => {
    if (!editing || !fileInputRef.current) return;
    fileInputRef.current.value = ""; // reset
    fileInputRef.current.click();
  };

  // handle file selection (preview only) — do not upload yet
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // revoke previous preview if any
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    // don't upload yet; upload will happen on Save
  };

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // add missing displayName used in JSX
  const displayName =
    profile?.username ??
    authUser?.user_metadata?.full_name ??
    authUser?.user_metadata?.name ??
    nameInput;

  // render skeleton while loading initial data
  if (loading) {
    return (
      <div
        className="h-95 w-full px-10 md:px-15 lg:px-30 py-20 relative"
        aria-busy="true"
      >
        <div className="relative">
          <div className="w-full h-50 bg-gray-200 rounded-md animate-pulse" />

          <div className="absolute bottom-[-90px] h-[120px] w-full flex items-center">
            <div className="flex flex-col md:flex-row md:items-center w-2/4 gap-5 md:pl-5">
              <div className="w-[120px] h-[120px] rounded-full bg-gray-200 animate-pulse" />

              <div className="flex flex-col justify-center gap-2">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="ml-4 flex items-center gap-2">
                <div className="w-28 h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            <div className="w-2/4 h-full flex justify-end items-center">
              <div className="w-30 h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top popup */}
      {popup.visible && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-md flex items-center gap-3 ${
            popup.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          <div className="text-sm">{popup.text}</div>
          <button
            onClick={dismissPopup}
            aria-label="Dismiss notification"
            className="ml-2 text-white opacity-90 hover:opacity-100"
          >
            &#10005;
          </button>
        </div>
      )}

      {/* hidden file input for avatar change */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      <div className=" h-95 w-full px-10 md:px-15 lg:px-30 py-20 relative">
        <div className="relative ">
          <div className="w-1080px h-50 bg-[#f5f5f5]  rounded-md">
            <FaCamera className="text-[#989898] text-3xl absolute top-5 right-7" />
          </div>

          <div className="absolute  bottom-[-90px] h-[120px]  w-full flex items-center">
            <div className="flex flex-col md:flex-row md:items-center  w-2/4 gap-5 md:pl-5 ">
              <div className="relative">
                {/* fixed square container ensures perfect circle + clipping */}
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden">
                  <img
                    // prefer preview, then profile.avatar_url, then auth metadata avatar, then default
                    src={
                      previewUrl ||
                      profile?.avatar_url ||
                      authUser?.user_metadata?.avatar_url ||
                      Avatarcard
                    }
                    alt="Pfp"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* camera icon over avatar — shown only in edit mode */}
              </div>

              {!editing ? (
                <h1 className="md:text-2xl text-xl px-3">{displayName}</h1>
              ) : (
                <input
                  className="md:text-2xl text-xl  px-3 bg-[#f5f5f5]"
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
              {editing && (
                <FaCamera
                  onClick={onCameraClick}
                  role="button"
                  tabIndex={0}
                  title="Change avatar"
                  aria-disabled={false}
                  className="absolute bottom-0 w-fit left-27 text-5xl p-2  cursor-pointer text-[#989898]"
                />
              )}
              {/* <FaCamera className="text-[#989898] text-3xl absolute bottom-5 left-25 md:bottom-0 md:left-27" /> */}
            </div>

            <div className="w-2/4 h-full  flex justify-end items-center">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountProf;
