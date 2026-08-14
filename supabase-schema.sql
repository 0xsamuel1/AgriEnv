-- AgriSim Database Schema
-- Run this in your Supabase SQL editor

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  total_score integer default 0,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Questions table
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  course_code text,
  course_title text,
  year text,
  semester text,
  question_text text not null,
  topic text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamptz default now()
);

alter table public.questions enable row level security;

create policy "Users can view all questions"
  on public.questions for select using (true);

create policy "Users can insert questions"
  on public.questions for insert with check (auth.uid() = user_id);

-- Quiz Rooms
create table if not exists public.quiz_rooms (
  id uuid default gen_random_uuid() primary key,
  room_code text unique not null,
  host_id uuid references auth.users on delete cascade,
  status text default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  round integer default 0,
  created_at timestamptz default now()
);

alter table public.quiz_rooms enable row level security;

create policy "Anyone can view rooms"
  on public.quiz_rooms for select using (true);

create policy "Authenticated users can create rooms"
  on public.quiz_rooms for insert with check (auth.uid() = host_id);

create policy "Host can update room"
  on public.quiz_rooms for update using (auth.uid() = host_id);

-- Quiz Participants
create table if not exists public.quiz_participants (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.quiz_rooms on delete cascade,
  user_id uuid references auth.users on delete cascade,
  score integer default 0,
  answers_json jsonb default '[]'::jsonb,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

alter table public.quiz_participants enable row level security;

create policy "Anyone can view participants"
  on public.quiz_participants for select using (true);

create policy "Authenticated users can join"
  on public.quiz_participants for insert with check (auth.uid() = user_id);

create policy "Users can update own score"
  on public.quiz_participants for update using (auth.uid() = user_id);

-- Leaderboard
create table if not exists public.leaderboard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  total_score integer default 0,
  games_played integer default 0,
  wins integer default 0,
  current_streak integer default 0,
  updated_at timestamptz default now()
);

alter table public.leaderboard enable row level security;

create policy "Anyone can view leaderboard"
  on public.leaderboard for select using (true);

create policy "Users can upsert own leaderboard"
  on public.leaderboard for insert with check (auth.uid() = user_id);

create policy "Users can update own leaderboard"
  on public.leaderboard for update using (auth.uid() = user_id);

-- Study Progress
create table if not exists public.study_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  topic text not null,
  questions_attempted integer default 0,
  questions_correct integer default 0,
  last_studied timestamptz default now(),
  unique(user_id, topic)
);

alter table public.study_progress enable row level security;

create policy "Users can view own progress"
  on public.study_progress for select using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.study_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.study_progress for update using (auth.uid() = user_id);

-- Enable realtime for quiz rooms and participants
alter publication supabase_realtime add table public.quiz_rooms;
alter publication supabase_realtime add table public.quiz_participants;
