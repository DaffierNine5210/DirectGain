-- ============================================================
-- DIRECT GAIN
-- Messaging / Offers / Deal Agreements
-- Migration 001
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- CONVERSATIONS
-- ============================================================

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),

  context_type text not null
    check (
      context_type in (
        'market',
        'job',
        'auction',
        'support',
        'general'
      )
    ),

  context_id text,

  title text,

  created_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================================
-- CONVERSATION PARTICIPANTS
-- ============================================================

create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid
    not null
    references public.conversations(id)
    on delete cascade,

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  role text
    check (
      role in (
        'buyer',
        'seller',
        'worker',
        'employer',
        'bidder',
        'auctioneer',
        'member',
        'support'
      )
    ),

  joined_at timestamptz
    not null
    default now(),

  last_read_at timestamptz,

  unique (
    conversation_id,
    user_id
  )
);


-- ============================================================
-- MESSAGES
-- ============================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid
    not null
    references public.conversations(id)
    on delete cascade,

  sender_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  message_type text
    not null
    default 'text'
    check (
      message_type in (
        'text',
        'image',
        'file',
        'location',
        'system'
      )
    ),

  body text,

  attachment_url text,

  metadata jsonb
    not null
    default '{}'::jsonb,

  created_at timestamptz
    not null
    default now(),

  edited_at timestamptz,

  deleted_at timestamptz
);


-- ============================================================
-- MARKET OFFERS
-- ============================================================

create table if not exists public.market_offers (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid
    not null
    references public.conversations(id)
    on delete cascade,

  listing_id text
    not null,

  buyer_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  seller_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  amount numeric(12, 2)
    not null
    check (amount > 0),

  currency text
    not null
    default 'AUD',

  status text
    not null
    default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'countered',
        'declined',
        'withdrawn',
        'expired'
      )
    ),

  created_by_role text
    not null
    check (
      created_by_role in (
        'buyer',
        'seller'
      )
    ),

  message text,

  parent_offer_id uuid
    references public.market_offers(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  responded_at timestamptz
);


-- ============================================================
-- DEAL AGREEMENTS
-- ============================================================

create table if not exists public.deal_agreements (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid
    not null
    references public.conversations(id)
    on delete cascade,

  listing_id text
    not null,

  accepted_offer_id uuid
    references public.market_offers(id)
    on delete set null,

  buyer_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  seller_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  agreed_price numeric(12, 2)
    not null
    check (agreed_price > 0),

  currency text
    not null
    default 'AUD',

  transaction_method text
    check (
      transaction_method in (
        'meetup',
        'pickup',
        'delivery',
        'other'
      )
    ),

  location_name text,

  scheduled_at text,

  notes text,

  status text
    not null
    default 'draft'
    check (
      status in (
        'draft',
        'pending',
        'confirmed',
        'cancelled'
      )
    ),

  buyer_confirmed boolean
    not null
    default false,

  buyer_confirmed_at timestamptz,

  seller_confirmed boolean
    not null
    default false,

  seller_confirmed_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists
  conversation_participants_user_id_idx
on public.conversation_participants(user_id);


create index if not exists
  conversation_participants_conversation_id_idx
on public.conversation_participants(conversation_id);


create index if not exists
  messages_conversation_created_idx
on public.messages(
  conversation_id,
  created_at
);


create index if not exists
  market_offers_conversation_created_idx
on public.market_offers(
  conversation_id,
  created_at
);


create index if not exists
  deal_agreements_conversation_idx
on public.deal_agreements(
  conversation_id
);


-- ============================================================
-- UPDATED_AT HELPER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists
  conversations_set_updated_at
on public.conversations;

create trigger
  conversations_set_updated_at
before update
on public.conversations
for each row
execute function public.set_updated_at();


drop trigger if exists
  market_offers_set_updated_at
on public.market_offers;

create trigger
  market_offers_set_updated_at
before update
on public.market_offers
for each row
execute function public.set_updated_at();


drop trigger if exists
  deal_agreements_set_updated_at
on public.deal_agreements;

create trigger
  deal_agreements_set_updated_at
before update
on public.deal_agreements
for each row
execute function public.set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.conversations
enable row level security;

alter table public.conversation_participants
enable row level security;

alter table public.messages
enable row level security;

alter table public.market_offers
enable row level security;

alter table public.deal_agreements
enable row level security;


-- ============================================================
-- SECURITY HELPERS
-- ============================================================

create or replace function public.is_conversation_participant(
  target_conversation_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id =
      target_conversation_id
      and user_id = auth.uid()
  );
$$;


create or replace function public.is_conversation_creator(
  target_conversation_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations
    where id =
      target_conversation_id
      and created_by =
        auth.uid()
  );
$$;


-- ============================================================
-- CONVERSATION POLICIES
-- ============================================================

drop policy if exists
  "Users can read their conversations"
on public.conversations;

create policy
  "Users can read their conversations"
on public.conversations
for select
to authenticated
using (
  public.is_conversation_participant(id)
  or
  created_by = auth.uid()
);


drop policy if exists
  "Authenticated users can create conversations"
on public.conversations;

create policy
  "Authenticated users can create conversations"
on public.conversations
for insert
to authenticated
with check (
  created_by = auth.uid()
);


drop policy if exists
  "Participants can update conversations"
on public.conversations;

create policy
  "Participants can update conversations"
on public.conversations
for update
to authenticated
using (
  public.is_conversation_participant(id)
)
with check (
  public.is_conversation_participant(id)
);


-- ============================================================
-- PARTICIPANT POLICIES
-- ============================================================

drop policy if exists
  "Participants can read conversation members"
on public.conversation_participants;

create policy
  "Participants can read conversation members"
on public.conversation_participants
for select
to authenticated
using (
  user_id = auth.uid()
  or
  public.is_conversation_participant(
    conversation_id
  )
  or
  public.is_conversation_creator(
    conversation_id
  )
);


drop policy if exists
  "Conversation members can add participants"
on public.conversation_participants;

create policy
  "Conversation members can add participants"
on public.conversation_participants
for insert
to authenticated
with check (
  public.is_conversation_participant(
    conversation_id
  )
  or
  public.is_conversation_creator(
    conversation_id
  )
);


drop policy if exists
  "Users can update their participant state"
on public.conversation_participants;

create policy
  "Users can update their participant state"
on public.conversation_participants
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);


-- ============================================================
-- MESSAGE POLICIES
-- ============================================================

drop policy if exists
  "Participants can read messages"
on public.messages;

create policy
  "Participants can read messages"
on public.messages
for select
to authenticated
using (
  public.is_conversation_participant(
    conversation_id
  )
);


drop policy if exists
  "Participants can send messages"
on public.messages;

create policy
  "Participants can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and
  public.is_conversation_participant(
    conversation_id
  )
);


drop policy if exists
  "Users can update their own messages"
on public.messages;

create policy
  "Users can update their own messages"
on public.messages
for update
to authenticated
using (
  sender_id = auth.uid()
)
with check (
  sender_id = auth.uid()
);


-- ============================================================
-- OFFER POLICIES
-- ============================================================

drop policy if exists
  "Deal participants can read offers"
on public.market_offers;

create policy
  "Deal participants can read offers"
on public.market_offers
for select
to authenticated
using (
  (
    auth.uid() = buyer_id
    or
    auth.uid() = seller_id
  )
  and
  public.is_conversation_participant(
    conversation_id
  )
);


drop policy if exists
  "Buyers and sellers can create offers"
on public.market_offers;

create policy
  "Buyers and sellers can create offers"
on public.market_offers
for insert
to authenticated
with check (
  (
    auth.uid() = buyer_id
    or
    auth.uid() = seller_id
  )
  and
  public.is_conversation_participant(
    conversation_id
  )
);


drop policy if exists
  "Deal participants can update offers"
on public.market_offers;

create policy
  "Deal participants can update offers"
on public.market_offers
for update
to authenticated
using (
  (
    auth.uid() = buyer_id
    or
    auth.uid() = seller_id
  )
  and
  public.is_conversation_participant(
    conversation_id
  )
)
with check (
  (
    auth.uid() = buyer_id
    or
    auth.uid() = seller_id
  )
  and
  public.is_conversation_participant(
    conversation_id
  )
);


-- ============================================================
-- DEAL AGREEMENT POLICIES
-- ============================================================

drop policy if exists
  "Deal participants can read agreements"
on public.deal_agreements;

create policy
  "Deal participants can read agreements"
on public.deal_agreements
for select
to authenticated
using (
  (
    auth.uid() = buyer_id
    or
    auth.uid() = seller_id
  )
  and
  public.is_conversation_participant(
    conversation_id
  )
);


drop policy if exists
  "Deal participants can create agreements"
on public.deal_agreements;

create policy
  "Deal participants can create agreements"
on public.deal_agreements
for insert
to authenticated
with check (
  (
    auth.uid() = buyer_id
    or
    auth.uid() = seller_id
  )
  and
  public.is_conversation_participant(
    conversation_id
  )
);


drop policy if exists
  "Deal participants can update agreements"
on public.deal_agreements;

create policy
  "Deal participants can update agreements"
on public.deal_agreements
for update
to authenticated
using (
  (
    auth.uid() = buyer_id
    or
    auth.uid() = seller_id
  )
  and
  public.is_conversation_participant(
    conversation_id
  )
)
with check (
  (
    auth.uid() = buyer_id
    or
    auth.uid() = seller_id
  )
  and
  public.is_conversation_participant(
    conversation_id
  )
);