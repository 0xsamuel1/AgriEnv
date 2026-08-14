"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Swords, Users, Clock, Trophy, Copy, Check, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/frontend/components/layout/Navbar";
import { createClient } from "@/frontend/lib/supabase";
import PageHeader from "@/frontend/components/layout/PageHeader";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

interface Participant {
  user_id: string;
  score: number;
  profiles?: { username: string; full_name: string };
}

interface ParticipantRow {
  user_id: string;
  score: number;
}

interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
}

export default function BattleRoom() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("code") || "";
  const [status, setStatus] = useState<"waiting" | "playing" | "finished">("waiting");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [myScore, setMyScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [battleError, setBattleError] = useState("");
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, [supabase.auth]);

  const fetchParticipants = useCallback(async () => {
    const { data: participantData, error: participantError } = await supabase
      .from("quiz_participants")
      .select("user_id, score")
      .eq("room_id", roomId);

    if (participantError) {
      console.error("Unable to load quiz participants", participantError);
      setBattleError("The player list could not be loaded. Please refresh the room.");
      return;
    }

    const participantRows = (participantData || []) as ParticipantRow[];
    const userIds = Array.from(new Set(participantRows.map((row) => row.user_id)));
    let profilesById = new Map<string, { username: string; full_name: string }>();

    if (userIds.length > 0) {
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);

      if (profileError) {
        console.error("Unable to load participant profiles", profileError);
      } else {
        profilesById = new Map(
          ((profileRows || []) as ProfileRow[]).map((profile) => [
            profile.id,
            { username: profile.username || "", full_name: profile.full_name || "" },
          ])
        );
      }
    }

    setParticipants(
      participantRows.map((participant) => ({
        ...participant,
        profiles: profilesById.get(participant.user_id),
      }))
    );
  }, [supabase, roomId]);

  useEffect(() => {
    fetchParticipants();
    const channel = supabase
      .channel(`room-${roomId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("broadcast", { event: "game-start" }, (payload: any) => {
        const incomingQuestions = payload?.payload?.questions;
        if (!Array.isArray(incomingQuestions) || incomingQuestions.length === 0) {
          setBattleError("The battle could not start because no valid questions were received.");
          setStatus("waiting");
          return;
        }
        setBattleError("");
        setQuestions(incomingQuestions);
        setStatus("playing");
        setCurrentQ(0);
        setTimeLeft(15);
      })
      .on("broadcast", { event: "score-update" }, () => {
        fetchParticipants();
      })
      .on("broadcast", { event: "game-end" }, () => {
        setStatus("finished");
        fetchParticipants();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, roomId, fetchParticipants]);

  useEffect(() => {
    if (status !== "playing" || showResult || !questions[currentQ]) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, status, showResult, questions, currentQ]);

  const handleStartGame = async () => {
    setLoading(true);
    setBattleError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10, difficulty: "mixed" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error([data.error, data.action].filter(Boolean).join(" ") || "The quiz could not be generated.");
      }

      const qs = Array.isArray(data.questions) ? data.questions : [];
      if (qs.length === 0) {
        throw new Error("The quiz service returned no valid questions. Please try again.");
      }

      const { error: roomUpdateError } = await supabase.from("quiz_rooms").update({ status: "playing" }).eq("id", roomId);
      if (roomUpdateError) throw new Error(roomUpdateError.message);

      await supabase.channel(`room-${roomId}`).send({
        type: "broadcast",
        event: "game-start",
        payload: { questions: qs },
      });

      setQuestions(qs);
      setStatus("playing");
      setTimeLeft(15);
      toast.success("Battle started", {
        description: `${qs.length} questions are ready. Good luck!`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "The battle could not be started.";
      setBattleError(message);
      toast.error("Couldn’t start the battle", { description: message });
      setQuestions([]);
      setStatus("waiting");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerIdx: number) => {
    const q = questions[currentQ];
    if (!q || showResult) {
      if (!q) {
        setBattleError("The current question is unavailable. Please return to the lobby and try again.");
        setStatus("waiting");
      }
      return;
    }

    setSelectedAnswer(answerIdx);
    setShowResult(true);
    const isCorrect = answerIdx === q.correctIndex;
    const points = isCorrect ? q.points * Math.max(1, Math.ceil(timeLeft / 3)) : 0;

    if (isCorrect) {
      const newScore = myScore + points;
      setMyScore(newScore);
      await supabase.from("quiz_participants")
        .update({ score: newScore })
        .eq("room_id", roomId)
        .eq("user_id", userId);
      await supabase.channel(`room-${roomId}`).send({
        type: "broadcast",
        event: "score-update",
        payload: { userId, score: newScore },
      });
    }

    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setStatus("finished");
        supabase.from("quiz_rooms").update({ status: "finished" }).eq("id", roomId);
        supabase.channel(`room-${roomId}`).send({
          type: "broadcast", event: "game-end", payload: {},
        });
        fetchParticipants();
      } else {
        setCurrentQ((c) => c + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(15);
      }
    }, 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success("Room code copied", {
        description: "Send it to your coursemates so they can join.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn’t copy the room code", {
        description: "Select the code and copy it manually.",
      });
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  if (status === "waiting") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="page-container-narrow max-w-3xl">
          <PageHeader eyebrow="Live challenge" title="Waiting room" description="Share the code, wait for your coursemates to join, then launch the battle when everyone is ready." icon={Swords} meta="ROOM READY  •  WAITING FOR PLAYERS" />

          <div className="card mb-6">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Invite code</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="break-all font-mono text-3xl font-bold tracking-[0.2em] text-[var(--primary)] sm:text-4xl sm:tracking-[0.3em]">{roomCode}</span>
              <button onClick={handleCopy} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--muted)] hover:bg-[#e4ebe3]" aria-label="Copy room code">
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="font-bold">Players ({participants.length})</h2>
            </div>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--muted)]">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white">
                    {(p.profiles?.full_name || p.profiles?.username || "?")[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">
                    {p.profiles?.full_name || p.profiles?.username || "Player"}
                  </span>
                  {p.user_id === userId && <span className="text-xs text-[var(--primary)] ml-auto">(You)</span>}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleStartGame} disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
            {loading ? "Generating Questions..." : "Start Battle!"}
          </button>

          {battleError && (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-left text-sm leading-6 text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{battleError}</span>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (status === "finished") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="page-container-narrow max-w-3xl text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#eef1dc] text-[#818c31]"><Trophy className="h-7 w-7" /></span>
          <p className="page-kicker mt-5">Session complete</p>
          <h1 className="page-title">Battle over</h1>
          <p className="mb-7 mt-3 text-sm text-[var(--muted-foreground)]">You finished with <strong className="text-green-700">{myScore} points</strong>.</p>

          <div className="card mb-6">
            <h2 className="font-bold text-lg mb-4">Final Rankings</h2>
            <div className="space-y-3">
              {sortedParticipants.map((p, i) => (
                <div key={p.user_id} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-[#f5f4df] border border-[#d9d58b]" : "bg-[var(--muted)]"}`}>
                  <span className={`text-xl font-bold w-8 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : ""}`}>
                    #{i + 1}
                  </span>
                  <span className="font-medium flex-1 text-left">
                    {p.profiles?.full_name || p.profiles?.username || "Player"}
                    {p.user_id === userId && <span className="text-xs text-[var(--primary)] ml-1">(You)</span>}
                  </span>
                  <span className="font-bold font-mono text-[var(--primary)]">{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          <a href="/showdown" className="btn-primary inline-flex items-center gap-2">
            Play Again <ArrowRight className="w-4 h-4" />
          </a>
        </main>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container-narrow max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-2 rounded-2xl border border-[#dce5dd] bg-white p-3 sm:p-4">
          <span className="text-xs font-bold text-[#647269] sm:text-sm">
            Question {currentQ + 1}/{questions.length}
          </span>
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${timeLeft <= 5 ? "text-[var(--destructive)] animate-pulse" : "text-[var(--muted-foreground)]"}`} />
            <span className={`font-mono font-bold text-lg ${timeLeft <= 5 ? "text-[var(--destructive)]" : ""}`}>
              {timeLeft}s
            </span>
          </div>
          <span className="whitespace-nowrap rounded-lg bg-[#edf5eb] px-2.5 py-1.5 font-mono text-xs font-bold text-[var(--primary)] sm:text-sm">{myScore} pts</span>
        </div>

        <div className="w-full h-1.5 bg-[var(--muted)] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="card mb-6">
          <p className="text-lg font-medium">{q.question}</p>
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{q.points} points</div>
        </div>

        <div className="space-y-3">
          {q.options.map((opt, oi) => {
            let btnClass = "bg-[var(--muted)] hover:bg-[var(--border)] border-transparent";
            if (showResult) {
              if (oi === q.correctIndex) {
                btnClass = "bg-green-100 border-green-500";
              } else if (oi === selectedAnswer) {
                btnClass = "bg-red-100 border-red-500";
              }
            } else if (oi === selectedAnswer) {
              btnClass = "bg-green-100 border-[var(--primary)]";
            }
            return (
              <button
                key={oi}
                onClick={() => !showResult && handleAnswer(oi)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-xl text-sm font-medium border-2 transition-all ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="card mt-4 bg-[var(--muted)]">
            <p className="text-sm">{q.explanation}</p>
          </div>
        )}
      </main>
    </div>
  );
}
