-- Run once in Supabase SQL Editor. All public writes go through the server.
create extension if not exists pgcrypto;
create table public.profiles(id uuid primary key references auth.users on delete cascade, role text not null default 'student' check(role in ('admin','student')), created_at timestamptz not null default now());
create table public.courses(id uuid primary key default gen_random_uuid(),slug text unique not null,name text not null,description text not null,created_at timestamptz not null default now());
create table public.cohorts(id uuid primary key default gen_random_uuid(),course_id uuid not null references public.courses, start_date date,end_date date,days text not null default '',time text not null default '',timezone text not null default 'Asia/Hebron',sessions int check(sessions>0),session_minutes int check(session_minutes>0),capacity int check(capacity>0),deadline timestamptz,price numeric(10,2) check(price>=0),currency text not null default 'ILS',state text not null default 'upcoming' check(state in ('open','limited','closed','waitlist','upcoming')),registration_enabled boolean not null default false,waitlist_enabled boolean not null default false,support_enabled boolean not null default false,meeting_url text not null default '',payment_instructions text not null default '',created_at timestamptz not null default now(),check(end_date is null or start_date is null or end_date>=start_date));
create table public.registrations(id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),full_name text not null,email text not null,phone text not null,university text not null,major text not null,year text not null,city text,age int check(age between 13 and 100),ai_level text not null,interests text[] not null default '{}',motivation text,support_requested boolean not null default false,course_id uuid not null references public.courses,cohort_id uuid not null references public.cohorts,registration_status text not null default 'pending' check(registration_status in ('pending','approved','waitlisted','rejected','cancelled')),payment_status text not null default 'pending' check(payment_status in ('pending','received','scholarship','free')),consent_at timestamptz not null default now(),policy_version text not null default '2026-09-11',unique(cohort_id,email));
create table public.contact_messages(id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),name text not null,email text not null,subject text not null,message text not null);
create table public.admin_notes(id uuid primary key default gen_random_uuid(),registration_id uuid not null references public.registrations on delete cascade,admin_id uuid not null references auth.users,body text not null,created_at timestamptz not null default now());
create table public.email_outbox(id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),recipient text not null,template text not null,payload jsonb not null,status text not null default 'pending',attempts int not null default 0,locked_at timestamptz,sent_at timestamptz,last_error text);
create table public.rate_limits(key text primary key,hits int not null default 1,expires_at timestamptz not null);
create index on public.registrations(created_at desc);
create index on public.registrations(cohort_id,registration_status);
create index on public.email_outbox(status,created_at);
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.cohorts enable row level security;
alter table public.registrations enable row level security;
alter table public.contact_messages enable row level security;
alter table public.admin_notes enable row level security;
alter table public.email_outbox enable row level security;
alter table public.rate_limits enable row level security;
-- No browser access to admissions, billing, meetings, or PII.
revoke all on all tables in schema public from anon,authenticated;
grant select on public.profiles to authenticated;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());

create or replace function public.consume_rate(p_key text,p_limit int,p_seconds int) returns boolean language plpgsql security definer set search_path=public as $$
declare n int;
begin
 insert into rate_limits(key,hits,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds)) on conflict(key) do update set hits=case when rate_limits.expires_at<now() then 1 else rate_limits.hits+1 end,expires_at=case when rate_limits.expires_at<now() then now()+make_interval(secs=>p_seconds) else rate_limits.expires_at end returning hits into n;
 delete from rate_limits where expires_at<now()-interval '1 day';
 return n<=p_limit;
end $$;

create or replace function public.submit_registration(p_data jsonb,p_admin_email text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare c cohorts; rid uuid; chosen_status text; occupied int; course_name text;
begin
 select * into c from cohorts where id=(p_data->>'cohort_id')::uuid for update;
 if not found then raise exception 'CLOSED'; end if;
 if c.deadline is not null and c.deadline<now() then raise exception 'CLOSED'; end if;
 if c.state in ('closed','upcoming') then raise exception 'CLOSED'; end if;
 select count(*) into occupied from registrations where cohort_id=c.id and registration_status in ('approved','pending');
 if c.state='waitlist' or (c.capacity is not null and occupied>=c.capacity) then
  if not c.waitlist_enabled then raise exception 'FULL'; end if;
  chosen_status:='waitlisted';
 else
  if not c.registration_enabled then raise exception 'CLOSED'; end if;
  chosen_status:='pending';
 end if;
 insert into registrations(full_name,email,phone,university,major,year,city,age,ai_level,interests,motivation,support_requested,course_id,cohort_id,registration_status)
 values(p_data->>'full_name',lower(p_data->>'email'),p_data->>'phone',p_data->>'university',p_data->>'major',p_data->>'year',p_data->>'city',nullif(p_data->>'age','')::int,p_data->>'ai_level',array(select jsonb_array_elements_text(p_data->'interests')),p_data->>'motivation',c.support_enabled and coalesce((p_data->>'support_requested')::boolean,false),c.course_id,c.id,chosen_status) returning id into rid;
 select name into course_name from courses where id=c.course_id;
 insert into email_outbox(recipient,template,payload) values(lower(p_data->>'email'),'received',jsonb_build_object('name',p_data->>'full_name','course_name',course_name,'registration_id',rid,'status',chosen_status));
 if p_admin_email is not null and p_admin_email<>'' then insert into email_outbox(recipient,template,payload) values(p_admin_email,'admin',jsonb_build_object('registration_id',rid,'course_name',course_name)); end if;
 return rid;
end $$;

create or replace function public.update_registration(p_id uuid,p_status text,p_payment text,p_admin uuid,p_note text default '') returns void language plpgsql security definer set search_path=public as $$
declare r registrations;c cohorts;n int;course_name text;
begin
 if not exists(select 1 from profiles where id=p_admin and role='admin') then raise exception 'FORBIDDEN'; end if;
 select * into r from registrations where id=p_id;
 if not found then raise exception 'NOT_FOUND'; end if;
 select * into c from cohorts where id=r.cohort_id for update;
 select * into r from registrations where id=p_id for update;
 if p_status in ('pending','approved') and r.registration_status not in ('pending','approved') then
 select count(*) into n from registrations where cohort_id=c.id and registration_status in ('pending','approved');
 if c.capacity is not null and n>=c.capacity then raise exception 'FULL'; end if;
 end if;
 update registrations set registration_status=p_status,payment_status=p_payment where id=p_id;
 if p_note<>'' then insert into admin_notes(registration_id,admin_id,body) values(p_id,p_admin,p_note); end if;
 if p_status<>r.registration_status and p_status in ('approved','waitlisted') then
 select name into course_name from courses where id=c.course_id;
 insert into email_outbox(recipient,template,payload) values(r.email,p_status,jsonb_build_object('name',r.full_name,'course_name',course_name,'registration_id',r.id,'instructions',case when p_status='approved' then c.payment_instructions else '' end));
 end if;
end $$;

create or replace function public.claim_emails() returns setof email_outbox language sql security definer set search_path=public as $$
 update email_outbox set status='failed',last_error='delivery_interrupted',locked_at=null where status='processing' and locked_at<now()-interval '10 minutes' and attempts>=5;
 update email_outbox set status='processing',locked_at=now(),attempts=attempts+1 where id in(select id from email_outbox where (status='pending' or (status='processing' and locked_at<now()-interval '10 minutes')) and attempts<5 order by created_at for update skip locked limit 20) returning *;
$$;
revoke execute on function public.consume_rate(text,int,int),public.submit_registration(jsonb,text),public.update_registration(uuid,text,text,uuid,text),public.claim_emails() from public,anon,authenticated;
grant execute on function public.consume_rate(text,int,int),public.submit_registration(jsonb,text),public.update_registration(uuid,text,text,uuid,text),public.claim_emails() to service_role;
insert into public.courses(id,slug,name,description) values('11111111-1111-4111-8111-111111111111','ai-for-university','الذكاء الاصطناعي لطلاب الجامعة','برنامج عربي يبدأ من الأساسيات، ويصل بك إلى استخدام الذكاء الاصطناعي بوعي في الدراسة والبحث والبرمجة وبناء المشاريع.');
insert into public.cohorts(id,course_id) values('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111');
