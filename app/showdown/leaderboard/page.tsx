"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, BarChart3 } from "lucide-react";
import Navbar from "@/frontend/components/layout/Navbar";
import { createClient } from "@/frontend/lib/supabase";
import PageHeader from "@/frontend/components/layout/PageHeader";

interface LeaderboardEntry {
  user_id: string;
  total_score: number;
  games_played: number;
  wins: number;
  profiles?: { username: string; full_name: string };
}

interface LeaderboardRow {
  user_id: string;
  total_score: number;
  games_played: number;
  wins: number;
}

interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("leaderboard")
        .select("user_id, total_score, games_played, wins")
        .order("total_score", { ascending: false })
        .limit(50);

      if (leaderboardError) {
        console.error("Unable to load leaderboard", leaderboardError);
        setError("The leaderboard could not be loaded right now.");
        setLoading(false);
        return;
      }

      const leaderboardRows = (leaderboardData || []) as LeaderboardRow[];
      const userIds = Array.from(new Set(leaderboardRows.map((row) => row.user_id)));
      let profilesById = new Map<string, { username: string; full_name: string }>();

      if (userIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .in("id", userIds);

        if (profileError) {
          console.error("Unable to load leaderboard profiles", profileError);
        } else {
          profilesById = new Map(
            ((profileRows || []) as ProfileRow[]).map((profile) => [
              profile.id,
              { username: profile.username || "", full_name: profile.full_name || "" },
            ])
          );
        }
      }

      setEntries(
        leaderboardRows.map((entry) => ({
          ...entry,
          profiles: profilesById.get(entry.user_id),
        }))
      );
      setLoading(false);
    };

    load();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-sm font-bold text-[var(--muted-foreground)] w-6 text-center">#{rank + 1}</span>;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container-narrow">
        <PageHeader eyebrow="Showdown rankings" title="Leaderboard" description="See who is setting the pace across live quiz battles and keep an eye on your own progress." icon={Trophy} meta="TOTAL SCORE  •  GAMES PLAYED  •  WINS">
          <span className="hidden h-14 w-14 place-items-center rounded-2xl bg-[#edf2df] text-[#75822b] sm:grid"><BarChart3 className="h-6 w-6" /></span>
        </PageHeader>

        {loading ? (
          <div className="card py-20 text-center text-[var(--muted-foreground)]">Loading rankings...</div>
        ) : error ? (
          <div role="alert" className="card border-red-100 bg-red-50 py-12 text-center text-sm text-red-700">{error}</div>
        ) : entries.length === 0 ? (
          <div className="card py-20 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#edf3eb] text-[#819085]"><Trophy className="h-7 w-7" /></span>
            <h2 className="mt-5 font-bold">The field is wide open</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">No battles yet. Be the first to play.</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0 sm:p-0">
            <div className="grid grid-cols-[1fr_auto] border-b border-[#e1e8e1] bg-[#f3f6f1] px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#7d8980] sm:px-5"><span>Player</span><span>Score</span></div>
            {entries.map((entry, i) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 border-b border-[#e7ece7] p-4 transition-all last:border-0 sm:gap-4 sm:px-5 ${
                  entry.user_id === userId
                    ? "bg-[#edf6eb]"
                    : i < 3
                    ? "bg-white"
                    : "bg-white hover:bg-[#f8faf7]"
                }`}
              >
                {getRankIcon(i)}
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1c6740] font-bold text-white">
                  {(entry.profiles?.full_name || entry.profiles?.username || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {entry.profiles?.full_name || entry.profiles?.username || "Player"}
                    {entry.user_id === userId && <span className="text-xs text-[var(--primary)] ml-1">(You)</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {entry.games_played} games · {entry.wins} wins
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-[var(--primary)]">{entry.total_score}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
