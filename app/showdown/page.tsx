"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, Plus, LogIn, Loader2, Users, Radio, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/frontend/components/layout/Navbar";
import PageHeader from "@/frontend/components/layout/PageHeader";
import { createClient } from "@/frontend/lib/supabase";
import { generateRoomCode } from "@/shared/utils";

export default function ShowdownLobby() {
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreateRoom = async () => {
    setCreating(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const message = "Please sign in before creating a battle room.";
      setError(message);
      toast.warning("Sign in required", { description: message });
      setCreating(false);
      return;
    }

    const roomCode = generateRoomCode();
    const { data, error: err } = await supabase.from("quiz_rooms").insert({
      room_code: roomCode,
      host_id: user.id,
      status: "waiting",
      round: 0,
    }).select().single();

    if (err) {
      setError(err.message);
      toast.error("Couldn’t create the room", { description: err.message });
      setCreating(false);
      return;
    }

    await supabase.from("quiz_participants").insert({
      room_id: data.id,
      user_id: user.id,
      score: 0,
    });

    router.push(`/showdown/${data.id}?code=${roomCode}`);
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const message = "Please sign in before joining a battle room.";
      setError(message);
      toast.warning("Sign in required", { description: message });
      setJoining(false);
      return;
    }

    const { data: room } = await supabase
      .from("quiz_rooms")
      .select("*")
      .eq("room_code", joinCode.toUpperCase())
      .eq("status", "waiting")
      .single();

    if (!room) {
      const message = "Room not found, or the battle has already started.";
      setError(message);
      toast.error("Couldn’t join that room", { description: message });
      setJoining(false);
      return;
    }

    await supabase.from("quiz_participants").upsert({
      room_id: room.id,
      user_id: user.id,
      score: 0,
    });

    router.push(`/showdown/${room.id}?code=${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container-narrow">
        <PageHeader eyebrow="Live challenge" title="Group showdown" description="Bring your coursemates into one room, answer against the clock, and find out who really knows the material." icon={Swords} meta="10 QUESTIONS  •  15 SECONDS EACH  •  LIVE SCORING">
          <span className="hidden items-center gap-2 rounded-full bg-[#e6f2e5] px-3 py-2 text-xs font-bold text-green-700 sm:flex"><Radio className="h-3.5 w-3.5 animate-pulse" /> Real-time</span>
        </PageHeader>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="card flex flex-col">
            <span className="icon-tile"><Plus className="h-5 w-5" /></span>
            <h2 className="mt-6 text-xl font-bold tracking-tight">Create a room</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Start a fresh battle and share the generated six-character code with your group.</p>
            <div className="my-6 space-y-2">
              {["AI-generated question set", "Live participant scores", "Instant final ranking"].map((item) => <p key={item} className="flex items-center gap-2 text-xs font-medium text-[#607166]"><CheckCircle2 className="h-3.5 w-3.5 text-green-700" />{item}</p>)}
            </div>
            <button onClick={handleCreateRoom} disabled={creating} className="btn-primary mt-auto w-full">
              {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Users className="h-5 w-5" />}
              {creating ? "Creating room..." : "Create room"}
            </button>
          </section>

          <section className="card flex flex-col">
            <span className="icon-tile"><LogIn className="h-5 w-5" /></span>
            <h2 className="mt-6 text-xl font-bold tracking-tight">Join a room</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Already have an invite? Enter the code exactly as it appears and jump into the waiting room.</p>
            <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[#68776d]" htmlFor="room-code">Room code</label>
            <input id="room-code" type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="input-field mt-2 font-mono text-center text-lg font-bold uppercase tracking-[0.3em]" placeholder="ABC123" maxLength={6} />
            <button onClick={handleJoinRoom} disabled={joining || !joinCode.trim()} className="btn-secondary mt-4 w-full">
              {joining ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
              {joining ? "Joining..." : "Join room"}
            </button>
          </section>
        </div>

        {error && <div role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm text-[var(--destructive)]">{error}</div>}
      </main>
    </div>
  );
}
