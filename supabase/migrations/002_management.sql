create or replace function public.save_program(p_cohort uuid,p_data jsonb,p_admin uuid) returns void language plpgsql security definer set search_path=public as $$
declare c cohorts;n int;cap int;
begin
 if not exists(select 1 from profiles where id=p_admin and role='admin') then raise exception 'FORBIDDEN'; end if;
 select * into c from cohorts where id=p_cohort for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 cap:=(p_data->>'capacity')::int;
 select count(*) into n from registrations where cohort_id=c.id and registration_status in ('pending','approved');
 if cap is not null and cap<n then raise exception 'CAPACITY'; end if;
 update courses set name=p_data->>'name',description=p_data->>'description' where id=c.course_id;
 update cohorts set start_date=(p_data->>'start_date')::date,end_date=(p_data->>'end_date')::date,days=p_data->>'days',time=p_data->>'time',timezone=p_data->>'timezone',sessions=(p_data->>'sessions')::int,session_minutes=(p_data->>'session_minutes')::int,capacity=cap,deadline=(p_data->>'deadline')::timestamptz,price=(p_data->>'price')::numeric,currency=p_data->>'currency',state=p_data->>'state',registration_enabled=(p_data->>'registration_enabled')::boolean,waitlist_enabled=(p_data->>'waitlist_enabled')::boolean,support_enabled=(p_data->>'support_enabled')::boolean,meeting_url=p_data->>'meeting_url',payment_instructions=p_data->>'payment_instructions' where id=c.id;
end $$;
revoke execute on function public.save_program(uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.save_program(uuid,jsonb,uuid) to service_role;
