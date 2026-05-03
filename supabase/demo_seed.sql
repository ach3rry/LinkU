-- LinkU Supabase-only MVP demo data.
-- Run after Zone rows exist and RLS policies are in place.

insert into "Zone" ("code", "name", "description", "enabled")
values
  ('TUTORING', '家教专区', '找家教、当家教，按科目、价格、时间、学校和认证状态匹配。', true),
  ('BUDDY', '搭子专区', '饭搭子、自习搭子、运动搭子、黑客松队友和英语口语搭子。', true),
  ('PREMIUM', '学长学姐专区', '保研考研经验、简历修改、项目修改、项目陪跑等高价值资源。', true)
on conflict ("code") do update
set
  "name" = excluded."name",
  "description" = excluded."description",
  "enabled" = excluded."enabled";

insert into "User" ("id", "email", "nickname", "role", "status", "createdAt", "updatedAt")
values
  ('demo-tutor-00000000-0000-0000-0000-000000000001', 'tutor@linku.demo', '小林学姐', 'USER', 'ACTIVE', now(), now()),
  ('demo-seeker-00000000-0000-0000-0000-000000000002', 'student@linku.demo', '想补高数的阿泽', 'USER', 'ACTIVE', now(), now()),
  ('demo-buddy-00000000-0000-0000-0000-000000000003', 'buddy@linku.demo', '晚饭搭子小周', 'USER', 'ACTIVE', now(), now()),
  ('demo-senior-00000000-0000-0000-0000-000000000004', 'senior@linku.demo', '简历修改学长', 'USER', 'ACTIVE', now(), now())
on conflict ("id") do update
set
  "nickname" = excluded."nickname",
  "status" = excluded."status",
  "updatedAt" = now();

insert into "Profile" ("id", "userId", "school", "city", "grade", "major", "bio", "verifiedStatus", "relationshipBoundary", "createdAt", "updatedAt")
values
  ('demo-profile-00000001', 'demo-tutor-00000000-0000-0000-0000-000000000001', '复旦大学', '上海', '大三', '数学与应用数学', '擅长高数和线代，讲题风格比较耐心。', 'PROVIDER_VERIFIED', 'STUDY_ONLY', now(), now()),
  ('demo-profile-00000002', 'demo-seeker-00000000-0000-0000-0000-000000000002', '同济大学', '上海', '大一', '计算机科学与技术', '高数基础一般，希望周末有人带着复习。', 'STUDENT_VERIFIED', 'STUDY_ONLY', now(), now()),
  ('demo-profile-00000003', 'demo-buddy-00000000-0000-0000-0000-000000000003', '上海交通大学', '上海', '研一', '软件工程', '想找固定自习和晚饭搭子，边界清楚，轻松一点就好。', 'STUDENT_VERIFIED', 'ACTIVITY_PARTNER', now(), now()),
  ('demo-profile-00000004', 'demo-senior-00000000-0000-0000-0000-000000000004', '浙江大学', '杭州', '研二', '人工智能', '可以帮忙看 AI / 后端方向简历和项目表达。', 'PROVIDER_VERIFIED', 'STUDY_ONLY', now(), now())
on conflict ("id") do update
set
  "school" = excluded."school",
  "city" = excluded."city",
  "updatedAt" = now();

insert into "Card" ("id", "userId", "zoneId", "type", "title", "subtitle", "description", "tags", "priceMin", "priceMax", "schedule", "location", "onlineMode", "status", "aiGenerated", "createdAt", "updatedAt")
select 'demo-card-tutor-001', 'demo-tutor-00000000-0000-0000-0000-000000000001', z."id",
  'provide_tutoring', '高数 / 线代耐心辅导', '复旦数学大三，周末可线下或线上',
  '适合想补基础、梳理题型和考前冲刺的同学。第一次会先了解你的课程进度。',
  '["高等数学", "线性代数", "周末", "线下可约"]',
  80, 120, '{"text": "周六下午、周日上午"}', '上海', 'HYBRID', 'ACTIVE', false, now(), now()
from "Zone" z where z."code" = 'TUTORING'
on conflict ("id") do update set "title" = excluded."title", "status" = excluded."status", "updatedAt" = now();

insert into "Card" ("id", "userId", "zoneId", "type", "title", "subtitle", "description", "tags", "priceMin", "priceMax", "schedule", "location", "onlineMode", "status", "aiGenerated", "createdAt", "updatedAt")
select 'demo-card-seeker-001', 'demo-seeker-00000000-0000-0000-0000-000000000002', z."id",
  'need_tutoring', '想找高数家教带复习', '大一计算机，预算 100/h 左右，周末优先',
  '希望老师能帮我补高数基础，重点是极限、导数和积分题型。',
  '["高等数学", "大一", "周末", "预算100/h"]',
  80, 120, '{"text": "周末白天"}', '上海', 'HYBRID', 'ACTIVE', false, now(), now()
from "Zone" z where z."code" = 'TUTORING'
on conflict ("id") do update set "title" = excluded."title", "status" = excluded."status", "updatedAt" = now();

insert into "Card" ("id", "userId", "zoneId", "type", "title", "subtitle", "description", "tags", "schedule", "location", "onlineMode", "status", "aiGenerated", "createdAt", "updatedAt")
select 'demo-card-buddy-001', 'demo-buddy-00000000-0000-0000-0000-000000000003', z."id",
  'buddy_request', '找固定自习 + 晚饭搭子', '一周 2-3 次，边界清楚，互相督促',
  '主要想找一起自习和吃晚饭的同学，不尬聊、不越界，效率优先。',
  '["自习", "晚饭", "轻社交", "边界清楚"]',
  '{"text": "工作日晚上"}', '上海', 'OFFLINE', 'ACTIVE', false, now(), now()
from "Zone" z where z."code" = 'BUDDY'
on conflict ("id") do update set "title" = excluded."title", "status" = excluded."status", "updatedAt" = now();

insert into "Card" ("id", "userId", "zoneId", "type", "title", "subtitle", "description", "tags", "priceMin", "priceMax", "schedule", "location", "onlineMode", "status", "aiGenerated", "createdAt", "updatedAt")
select 'demo-card-premium-001', 'demo-senior-00000000-0000-0000-0000-000000000004', z."id",
  'premium_consultation', 'AI / 后端方向简历修改', '浙大人工智能研二，帮你梳理项目亮点',
  '可以帮你梳理项目亮点、技术表达和面试追问点。',
  '["简历修改", "AI Coding", "项目表达"]',
  99, 199, '{"text": "预约制"}', '线上', 'ONLINE', 'ACTIVE', false, now(), now()
from "Zone" z where z."code" = 'PREMIUM'
on conflict ("id") do update set "title" = excluded."title", "status" = excluded."status", "updatedAt" = now();
