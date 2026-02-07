-- Create notebooks table
create table if not exists notebooks (
    id uuid primary key default gen_random_uuid(),
    notebook_id text not null, -- external ID from NotebookLM
    title text not null,
    source_count int default 0,
    url text,
    ownership text,
    created_at timestamptz default now(),
    modified_at timestamptz
);

-- Enable RLS
alter table notebooks enable row level security;

-- Policy: Everyone can read (public/shared for this demo)
create policy "Public read access"
    on notebooks for select
    using (true);

-- Insert Data (Upsert based on notebook_id if possible, but simplest is just insert or truncate first)
truncate table notebooks; 

insert into notebooks (notebook_id, title, source_count, url, ownership, created_at, modified_at)
values
('87936c81-2433-401f-8c74-35c5862e0e54', '[업무.보고서]기아렌터카 차세대 관리', 67, 'https://notebooklm.google.com/notebook/87936c81-2433-401f-8c74-35c5862e0e54', 'owned', '2026-02-02T12:34:57Z', '2026-02-06T00:09:20Z'),
('108a7958-91eb-4037-9c06-c06c5cb852a3', 'NotebookLM 슬라이드/인포그래픽 18가지 스타일 프롬프트', 3, 'https://notebooklm.google.com/notebook/108a7958-91eb-4037-9c06-c06c5cb852a3', 'shared_with_me', '2026-01-31T07:59:52Z', '2026-02-04T04:21:47Z'),
('123f7be5-5aaa-4234-93de-f92f34c74b67', '[업무.제안]자동차 딜러/대리점 평가 시스템', 59, 'https://notebooklm.google.com/notebook/123f7be5-5aaa-4234-93de-f92f34c74b67', 'owned', '2026-02-03T07:26:16Z', '2026-02-04T02:31:18Z'),
('e09e1e1b-52b0-454e-902b-29459d2ebf20', '[개인.취미]Guns, Germs, and Steel: The Fates of Human Societies', 1, 'https://notebooklm.google.com/notebook/e09e1e1b-52b0-454e-902b-29459d2ebf20', 'owned', '2026-02-02T15:33:49Z', '2026-02-04T02:30:12Z'),
('af60b84a-139d-42f7-be1b-c4450792c4d3', '[가이드]💯컨설턴트 제안 PPT', 18, 'https://notebooklm.google.com/notebook/af60b84a-139d-42f7-be1b-c4450792c4d3', 'shared_with_me', '2026-01-04T00:35:02Z', '2026-02-04T02:23:25Z'),
('8a406eba-f347-4dc9-8249-9b68ecc992ea', 'Project P.A.N.D.O.R.A: The Singularity Protocol', 3, 'https://notebooklm.google.com/notebook/8a406eba-f347-4dc9-8249-9b68ecc992ea', 'shared_with_me', '2026-01-30T22:59:58Z', '2026-02-03T08:47:26Z'),
('56740446-cda3-4f09-986f-4c9b12cf08cd', '[업무.보고서]씨젠AIOCR보고서', 2, 'https://notebooklm.google.com/notebook/56740446-cda3-4f09-986f-4c9b12cf08cd', 'shared_with_me', '2025-09-11T10:18:32Z', '2026-02-03T06:09:25Z'),
('cc4b9d4d-1001-4198-8a78-deaeb12551ee', '[가이드.프롬프트]오빠두.2026년 "경제/산업 전망, AI 기술 트렌드, 소비자 트렌드" 분석', 50, 'https://notebooklm.google.com/notebook/cc4b9d4d-1001-4198-8a78-deaeb12551ee', 'shared_with_me', '2026-01-12T11:20:45Z', '2026-02-03T01:50:08Z'),
('0a139b84-d200-4548-ad2d-5cba13721b70', '[가이드]노트북LM사용법', 6, 'https://notebooklm.google.com/notebook/0a139b84-d200-4548-ad2d-5cba13721b70', 'shared_with_me', '2026-01-01T01:39:05Z', '2026-02-02T13:19:16Z'),
('da214b44-a464-435f-98da-26e06e5afb73', '[업무.보고서]중고차 매매 사업 현황 파악:현대자동차제안용', 113, 'https://notebooklm.google.com/notebook/da214b44-a464-435f-98da-26e06e5afb73', 'shared_with_me', '2026-01-26T05:36:49Z', '2026-02-02T04:16:43Z');
