# Multiplayer for Tafl

## Modes (all three from your answer)
- **Pass-and-play** — two players on one device, no backend. Works for every variant immediately.
- **Online live** — both players in the same room, moves stream in real time.
- **Async / correspondence** — same room, but moves can be made hours/days apart; the inactive player gets a "your turn" notification when they reopen the app.

A room is the same database object in both online cases — the only difference is whether both players are connected at once.

## Identity (your "guest + claim on signup" choice)
- Visiting the app silently creates an **anonymous Lovable Cloud user** the first time you do anything multiplayer. You play with a generated name like "Raven 482".
- That anonymous account already owns your games, friends, and history server-side.
- "Sign in" / "Sign up" (email+password or Google) **upgrades the same account in place**, so every guest game you played, every move, every friend you added is automatically kept — nothing to migrate, nothing to claim manually.
- Auth methods at launch: email + password and Google sign-in (Lovable Cloud defaults).

## Joining a game (all three from your answer)
- **Share link** — host clicks "Invite", gets a URL like `/play/HRAVEN-42`. Anyone with the link can join as guest or signed-in.
- **6-char room code** — same room exposes a typeable code (`HRAVEN42`) on the host screen and a "Join by code" input on the home screen.
- **Friends list** — signed-in users see online friends, can send a direct game invite that lands as a notification in their app and (optionally later) email.

## Variants
All 6 Tafl variants and all 8 Lost-World variants are multiplayer-enabled. The existing engines already produce a serialisable `GameState`, so the multiplayer layer is variant-agnostic: it just syncs `state + lastMove` per room.

## Data model (Lovable Cloud / Postgres)
- `profiles` — `id` (= auth user id), `display_name`, `avatar_url`, `is_anonymous`, `created_at`. Auto-created by trigger on signup.
- `rooms` — `id`, `code` (6-char unique), `variant_id`, `rules` JSONB, `host_id` (profile), `guest_id` (profile, nullable until joined), `host_side` (`attacker`|`defender`), `status` (`waiting`|`active`|`finished`|`abandoned`), `state` JSONB (current game state), `current_player`, `winner` (nullable), `created_at`, `updated_at`, `last_move_at`.
- `room_moves` — append-only log: `room_id`, `idx`, `by_player`, `move` JSONB, `state_after` JSONB, `created_at`. Used for replays + animation reconstruction on reconnect.
- `friendships` — `user_id`, `friend_id`, `status` (`pending`|`accepted`), `created_at`. Unique on the unordered pair.
- `game_invites` — `room_id`, `from_id`, `to_id`, `status` (`pending`|`accepted`|`declined`), `created_at`.
- `user_roles` + `has_role()` helper (per project convention) — not strictly needed yet, scaffolded for future admin tools.

RLS policies: a profile is readable by anyone signed-in (for friend lookup by display name), writable only by its owner. A room is readable by its host, its guest, or anyone holding the URL code (validated via a `SECURITY DEFINER` `join_room(code)` function so we don't leak the rooms table publicly). Moves are insertable only by the room's current player.

## Realtime sync
- Subscribe to `room_moves` inserts for the active room via Lovable Cloud Realtime.
- Each insert carries `state_after`, so the client applies it directly — no need to re-run engine logic on the receiver and no risk of divergence.
- Optimistic local apply on the mover's side, rollback on insert rejection (RLS).

## UI changes
- New **"Multiplayer"** entry on the home screen alongside the existing setup, with three buttons: *Pass & Play*, *Create Online Room*, *Join by code/link*.
- New **`/play/:code`** route — auto-creates an anonymous session if needed, then drops you into the existing 3D scene with a small "opponent" HUD chip (avatar, name, online/offline dot, "their turn / your turn" indicator).
- New **Friends panel** (signed-in only) — search by display name, send/accept friend requests, see online status, "Invite to game" button per friend.
- New **Profile chip** in the header — shows guest name + "Sign in to save & invite friends" CTA, or avatar + name once signed in.
- Existing single-player setup is unchanged; everything multiplayer is additive.

## Build order
1. Enable Lovable Cloud + migrations for `profiles`, `rooms`, `room_moves`, `friendships`, `game_invites`, `has_role`, RLS, `join_room` RPC.
2. Auth wiring: anonymous-by-default, `signInWithPassword` / `signInWithOAuth('google')`, in-place upgrade. Profile chip in header.
3. Pass-and-play mode (no backend) — quickest win, gets the local 2-player loop working.
4. Online rooms: create / join-by-code / share-link route, realtime move sync, reconnect-from-log.
5. Friends list + direct game invites.
6. Async polish: "your turn" toast on app open, per-room unread badge.

## Technical notes
- Moves are validated client-side by the engine before insert; the DB stores `state_after` rather than re-validating server-side (no Deno port of every engine needed). RLS still enforces "only the current player can write the next move," which prevents the obvious cheat.
- Anonymous users count against Lovable Cloud's monthly active users; we'll show a subtle prompt to sign up after their second finished game.
- 6-char codes use a Crockford alphabet (no `O/0/I/1`) to avoid typos.
- All multiplayer code is gated behind a feature check so single-player keeps working if Cloud is ever unreachable.

If this looks right, I'll start with step 1 (enable Cloud + migrations) once you approve.