begin;
create temp table a5_copy_rules (seq int generated always as identity, old_text text, new_text text) on commit drop;
insert into a5_copy_rules(old_text,new_text) values
('A5 makes the introduction; the provider confirms','A5 helps you find a local pro, who confirms'),
('introductions for both trades','help with both trades'),
('An introduction is not an emergency appointment.','An A5 request does not book an emergency appointment.'),
('do not treat an A5 introduction as verification','A5 does not verify these credentials'),
('A5 helps you find a suitable connection; you agree on the work and price directly with the independent professional.','A5 helps you find a local pro. You agree on the work and price directly with them.'),
('when requesting an introduction through A5','when requesting help through A5'),
('agrees the schedule after the introduction','agrees on the schedule with you'),
('A5 makes introductions; your agreement and price are with the independent professional. You do not have to accept a proposal simply because you requested an introduction.','A5 helps you find a local pro. You agree on the work and price directly with them. There is no obligation to hire.'),
('A5 makes the introduction; the masonry provider assesses','The masonry pro assesses'),
('A5 makes an introduction; the provider confirms scope, price and timing.','The pro confirms the scope, price and timing with you.'),
('Confirm scheduling with the provider after the introduction.','Confirm scheduling directly with the pro.'),
('A5 makes the introduction; the provider assesses','The pro assesses');
create temp table a5_copy_work on commit drop as select id,updated_at,jsonb_build_object('title',title,'h1',h1,'meta_description',meta_description,'primary_question',primary_question,'direct_answer',direct_answer,'sections',sections) as original from content_pages where status='PUBLISHED';
alter table a5_copy_work add column revised jsonb;
update a5_copy_work set revised=original;
do $$ declare rule record; changed int; begin
 for rule in select * from a5_copy_rules order by seq loop
  update a5_copy_work set revised=replace(revised::text,rule.old_text,rule.new_text)::jsonb;
 end loop;
 select count(*) into changed from a5_copy_work where revised<>original;
 if changed<>13 then raise exception 'Unexpected copy scope: %',changed; end if;
end $$;
with changed as (
 update content_pages p set title=w.revised->>'title',h1=w.revised->>'h1',meta_description=w.revised->>'meta_description',primary_question=w.revised->>'primary_question',direct_answer=w.revised->>'direct_answer',sections=w.revised->'sections',updated_at=now()
 from a5_copy_work w where p.id=w.id and p.updated_at=w.updated_at and p.status='PUBLISHED' and w.revised<>w.original
 returning p.id
) select count(*) as updated_pages from changed;
do $$ begin
 if exists(select 1 from a5_copy_work w join content_pages p using(id) where w.revised<>w.original and jsonb_build_object('title',p.title,'h1',p.h1,'meta_description',p.meta_description,'primary_question',p.primary_question,'direct_answer',p.direct_answer,'sections',p.sections)<>w.revised) then raise exception 'Concurrent change or readback mismatch'; end if;
end $$;
commit;
