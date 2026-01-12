import { useEffect, useState, useRef } from "react";
import Avatarcard from "../assets/img/defAvatar.svg";
import pallete from "../assets/img/pallete.png";
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
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string>("Learner");
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState<string>("");
  const originalNameRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [popup, setPopup] = useState<{
    visible: boolean;
    text: string;
    type: "success" | "error";
  }>({ visible: false, text: "", type: "success" });

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
          const { data: profData, error: profError } = await supabase
            .from("profiles")
            .select("username, role, created_at, avatar_url")
            .eq("id", user.id)
            .maybeSingle();

          if (!profError && mounted) {
            const prof = (profData ?? null) as Profile | null;
            setProfile(prof);
            setRole(prof?.role ?? "Learner");

            const displayFromProfile = prof?.username ?? null;
            const displayFromMeta =
              user.user_metadata?.full_name || user.user_metadata?.name || null;
            setNameInput(displayFromProfile ?? displayFromMeta ?? "");

            // Sync profile to sessionStorage so Navlogged gets the avatar_url
            if (prof) {
              const profileToStore = { ...prof, id: user.id };
              sessionStorage.setItem("profile", JSON.stringify(profileToStore));
              window.dispatchEvent(
                new CustomEvent("profile_updated", { detail: profileToStore })
              );
            }
          }
        }
      } catch {
        // silently handle error
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
    originalNameRef.current =
      profile?.username ||
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      nameInput;
    setEditing(true);
  };

  const handleCancel = () => {
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

    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {
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
      let newAvatarUrl: string | undefined = undefined;
      if (selectedFile) {
        const ext = selectedFile.name.split(".").pop();
        const filePath = `${authUser.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("Avatar")
          .upload(filePath, selectedFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from("Avatar")
          .getPublicUrl(filePath);
        newAvatarUrl = (urlData as any)?.publicUrl;
        if (!newAvatarUrl) throw new Error("Failed to get public URL");
      }

      const { data: upserted, error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
          [
            {
              id: authUser.id,
              username: newName,
              ...(newAvatarUrl ? { avatar_url: newAvatarUrl } : {}),
            },
          ],
          { onConflict: "id" }
        )
        .select("id, username, role, created_at, avatar_url")
        .maybeSingle();

      if (upsertErr) throw upsertErr;

      setProfile(upserted ?? null);
      setRole(upserted?.role ?? role);

      // Determine final avatar URL
      const finalAvatarUrl =
        newAvatarUrl ||
        upserted?.avatar_url ||
        profile?.avatar_url ||
        authUser?.user_metadata?.avatar_url;

      // Update auth metadata with both name and avatar
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: newName,
          avatar_url: finalAvatarUrl,
        },
      });
      if (authErr) throw authErr;

      // Update sessionStorage and dispatch event for Navlogged
      const updatedProfile = {
        id: authUser.id,
        username: newName,
        role: upserted?.role ?? role,
        avatar_url: finalAvatarUrl,
        created_at: upserted?.created_at,
      };
      sessionStorage.setItem("profile", JSON.stringify(updatedProfile));
      window.dispatchEvent(
        new CustomEvent("profile_updated", { detail: updatedProfile })
      );

      // Also update token in sessionStorage with new avatar
      try {
        const existingToken = JSON.parse(
          sessionStorage.getItem("token") || "null"
        );
        if (existingToken?.user?.user_metadata) {
          existingToken.user.user_metadata.full_name = newName;
          existingToken.user.user_metadata.avatar_url = finalAvatarUrl;
          sessionStorage.setItem("token", JSON.stringify(existingToken));
          window.dispatchEvent(
            new CustomEvent("token_updated", { detail: existingToken })
          );
        }
      } catch {
        /* ignore */
      }

      setMsg("Profile saved");

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      setEditing(false);

      const refreshedUserRes = await supabase.auth.getUser();
      setAuthUser(refreshedUserRes.data?.user ?? authUser);
    } catch (err: any) {
      setError(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const onCameraClick = () => {
    if (!editing || !fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const displayName =
    profile?.username ??
    authUser?.user_metadata?.full_name ??
    authUser?.user_metadata?.name ??
    nameInput;

  // Avatar URL with proper fallback
  const avatarUrl =
    previewUrl ||
    profile?.avatar_url ||
    authUser?.user_metadata?.avatar_url ||
    Avatarcard;

  if (loading) {
    return (
      <div
        className="min-h-[420px] md:min-h-[380px] w-full px-4 md:px-15 lg:px-30 py-20 pb-40 md:pb-20 relative"
        aria-busy="true"
      >
        <div className="relative">
          <div className="w-full h-50 bg-gray-200 rounded-md animate-pulse" />
          <div className="absolute bottom-[-180px] md:bottom-[-90px] h-auto md:h-[120px] w-full flex flex-col md:flex-row md:items-center">
            <div className="flex flex-col md:flex-row md:items-center w-full md:w-2/4 gap-3 md:gap-5 md:pl-5">
              <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full bg-gray-200 animate-pulse mx-auto md:mx-0" />
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-full md:w-2/4 flex justify-center md:justify-end items-center mt-4 md:mt-0">
              <div className="w-30 h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      <div className="min-h-[420px] md:min-h-[380px] w-full px-4 md:px-15 lg:px-30 py-20 pb-40 md:pb-20 relative">
        <div className="relative">
          <div
            className="w-full h-50 rounded-md bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${pallete})` }}
          />

          <div className="absolute bottom-[-180px] md:bottom-[-90px] h-auto md:h-[120px] w-full flex flex-col md:flex-row md:items-center">
            <div className="flex flex-col md:flex-row md:items-center w-full md:w-2/4 gap-3 md:gap-5 md:pl-5">
              {/* Avatar */}
              <div className="relative mx-auto md:mx-0 flex-shrink-0">
                <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden">
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {editing && (
                  <FaCamera
                    onClick={onCameraClick}
                    role="button"
                    tabIndex={0}
                    title="Change avatar"
                    className="absolute bottom-0 right-0 text-3xl md:text-4xl p-1.5 md:p-2 cursor-pointer text-[#ff9801] bg-white rounded-full shadow-md"
                  />
                )}
              </div>

              {/* Name and Add Course - side by side on desktop, stacked on mobile */}
              <div className="flex flex-col items-center md:items-start gap-2">
                {!editing ? (
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                    <h1 className="md:text-2xl text-lg text-center md:text-left whitespace-nowrap">
                      {displayName}
                    </h1>
                    {role !== "student" && (
                      <Link
                        to="/add-course"
                        className="flex text-white bg-[#ff9801] px-4 justify-center items-center h-8 rounded cursor-pointer text-sm whitespace-nowrap"
                      >
                        Add Course
                      </Link>
                    )}
                  </div>
                ) : (
                  <input
                    className="md:text-2xl text-lg px-3 border-b border-gray-300 focus:outline-none focus:border-[#ff9801] text-center md:text-left w-full max-w-[250px]"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    disabled={saving}
                    aria-label="Edit display name"
                  />
                )}
              </div>
            </div>

            {/* Edit Profile / Save / Cancel buttons */}
            <div className="w-full md:w-2/4 flex justify-center md:justify-end items-center mt-4 md:mt-0">
              {!editing ? (
                <button
                  onClick={handleStartEdit}
                  className="flex text-white items-center gap-2 bg-[#ff9801] px-3 h-8 rounded cursor-pointer text-sm md:text-base"
                >
                  <FaPencilAlt className="text-white" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center text-white gap-2 bg-[#ff9801] cursor-pointer px-3 h-8 rounded text-sm md:text-base"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex text-white items-center gap-2 bg-[#ff0300] cursor-pointer px-3 h-8 rounded text-sm md:text-base"
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
