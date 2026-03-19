import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usersAPI } from "../../lib/api";

export default function ProfilePage() {
  const { username } = useParams();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) return;

        const data = await usersAPI.getPublicProfile(username);
        setProfile(data);
      } catch (err) {
        console.error("Failed to load public profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white text-xl">
        User not found
      </div>
    );
  }

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt)
    : new Date();

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl bg-gradient-to-br from-[#0f172a] to-[#111827] border border-[#1e293b] rounded-3xl shadow-2xl p-10">

        <div className="flex flex-col items-center">

          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-[2px] mb-6 shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#111827]">
              <img
                src={`https://ui-avatars.com/api/?name=${profile.username}&background=111827&color=10b981&size=256`}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            {profile.username}
          </h1>

          <p className="text-gray-400 text-lg mb-10">
            SolveOn Public Profile
          </p>

          <div className="grid grid-cols-3 gap-6 w-full">

            <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {profile.totalSolved}
              </div>
              <div className="text-gray-400 font-medium">
                Solved
              </div>
            </div>

            <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold text-cyan-400 mb-2">
                {profile.totalSubmissions}
              </div>
              <div className="text-gray-400 font-medium">
                Submissions
              </div>
            </div>

            <div className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold text-orange-400 mb-2">
                {profile.streak}
              </div>
              <div className="text-gray-400 font-medium">
                Streak
              </div>
            </div>

          </div>

          <div className="mt-10 text-gray-500 text-base">
            Joined{" "}
            {joinedDate.toLocaleString("default", {
              month: "long",
            })}{" "}
            {joinedDate.getFullYear()}
          </div>

        </div>
      </div>
    </div>
  );
}