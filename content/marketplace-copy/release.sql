begin;
create temp table a5_copy_rules (seq int generated always as identity, old_text text, new_text text) on commit drop;
insert into a5_copy_rules(old_text,new_text) values
('A5 is a home services network. We review your request and look for an independent professional whose services and coverage match your project. When a suitable connection is available, we forward your request. You discuss the scope, price and schedule directly with that professional. Sending a request does not book work or guarantee a response or availability.','A5 is a local home services marketplace. Tell us what you need, and we’ll help find a pro for the job. You agree on pricing and scheduling directly with the pro. A match or appointment is not guaranteed.'),
('Describe the work and share your ZIP code. The A5 home services network helps connect you with an independent local professional. After an introduction is accepted, you discuss scope, price and timing directly.','Tell us what you need, and we’ll help find a local pro for the job. Free to request. No obligation to hire.'),
('Describe what needs attention. A5 will review your request and look for a suitable independent professional. If a connection is available, you''ll discuss the work, price and timing directly with that professional.','Tell us what you need, and we’ll help find a local pro for the job.'),
('A5 is a home services network. We review your project and location and offer the opportunity to a relevant independent provider. After the introduction is accepted, the provider can review your request and contact you.','Tell us about your project. We’ll look for a local pro who handles that type of work.'),
('We review the location and scope, then offer the opportunity to a relevant professional in the network.','We look for a local pro for your job.'),
('A5 reviews the location and project scope, then offers an introduction to a relevant professional in the network.','A5 helps you find a local pro for the job.'),
('No. The directory lets you identify your municipality and request a review. A5 reviews the location and work before offering an introduction. You agree availability and timing directly with the professional. Scheduled repairs and improvements are the focus; A5 is not an emergency dispatch service.','No. Find your town and tell us what you need. You agree on pricing and scheduling directly with the pro. A5 is not an emergency dispatch service.'),
('Send A5 one request for an introduction through our local home services network.','Find a local pro for your project. Free to request.'),
('Requesting an introduction through A5 is free for homeowners. Your independent professional confirms scope, price and scheduling.','Free to request. No obligation to hire. Discuss pricing and scheduling directly with the pro.'),
('Tell A5 what needs attention and connect with an independent local professional.','Tell us what you need, and we’ll help find a local pro.'),
('Request an introduction through the A5 network for:','Find a local pro for:'),
('Your introduction through A5','Find a local pro'),
('home services network','home services marketplace'),
('in the A5 network','through A5'),
('through the A5 network','through A5'),
('through the network','through A5'),
('Request free plumbing introductions in Northern NJ.','Find a local plumber in Northern NJ. Free to request.'),
('How a free A5 introduction works','How A5 works'),
('How A5 introductions work','How A5 works'),
('A5 introductions are free for homeowners','A5 is free for homeowners'),
('A5 provides introductions to independent professionals.','A5 helps you find a local pro.'),
('offer an introduction to a relevant local professional','help find a local pro'),
('offer an introduction to an independent local professional','help find a local pro'),
('offer an introduction to a local masonry professional','help find a local mason'),
('offers an introduction','helps you find a pro'),
('offers a local introduction','helps you find a local pro'),
('offer a local introduction','help find a local pro'),
('offers a relevant introduction','helps you find a local pro'),
('A5 offers introductions for planned work','A5 helps you find pros for planned work'),
('A5 reviews planned plumbing requests and offers introductions through A5.','A5 helps you find a local plumber for planned work.'),
('waiting for a network introduction','waiting for an A5 response'),
('Request service','Find a home pro');
create temp table a5_copy_work on commit drop as select id,updated_at,jsonb_build_object('title',title,'h1',h1,'meta_description',meta_description,'direct_answer',direct_answer,'sections',sections) as original from content_pages where status='PUBLISHED';
alter table a5_copy_work add column revised jsonb;
update a5_copy_work set revised=original;
do $$ declare rule record; changed int; begin
 for rule in select * from a5_copy_rules order by seq loop
  update a5_copy_work set revised=replace(revised::text,rule.old_text,rule.new_text)::jsonb;
 end loop;
 select count(*) into changed from a5_copy_work where revised<>original;
 if changed<>326 then raise exception 'Unexpected copy scope: %',changed; end if;
end $$;
with changed as (
 update content_pages p set title=w.revised->>'title',h1=w.revised->>'h1',meta_description=w.revised->>'meta_description',direct_answer=w.revised->>'direct_answer',sections=w.revised->'sections',updated_at=now()
 from a5_copy_work w where p.id=w.id and p.updated_at=w.updated_at and p.status='PUBLISHED' and w.revised<>w.original
 returning p.id
) select count(*) as updated_pages from changed;
do $$ begin
 if exists(select 1 from a5_copy_work w join content_pages p using(id) where w.revised<>w.original and jsonb_build_object('title',p.title,'h1',p.h1,'meta_description',p.meta_description,'direct_answer',p.direct_answer,'sections',p.sections)<>w.revised) then raise exception 'Concurrent change or readback mismatch'; end if;
end $$;
commit;
