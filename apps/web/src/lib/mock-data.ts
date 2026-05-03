import { type ZoneCode } from "@linku/shared";

export type MockRecommendation = {
  id: string;
  targetUserId?: string;
  zone: ZoneCode;
  name: string;
  school: string;
  role: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  matchScore: number;
  reason: string;
  price?: string;
  schedule: string;
  mode: string;
  verified: boolean;
};

export const mockRecommendations: MockRecommendation[] = [
  {
    id: "card-tutor-lin",
    targetUserId: "mock-user-tutor-lin",
    zone: "tutoring",
    name: "小林学姐",
    school: "复旦大学",
    role: "数学与应用数学 大三",
    title: "高数 / 线代耐心辅导",
    subtitle: "周末可线下，适合补基础和考前冲刺",
    description: "会先看你的课程进度，再把知识点拆成题型清单。讲题风格慢一点、稳一点。",
    tags: ["高等数学", "线性代数", "周末", "线下可约"],
    matchScore: 88,
    reason: "TA 擅长高数和线代，周末时间与你匹配，价格也在你的预算范围内。",
    price: "80-120 / h",
    schedule: "周六下午、周日上午",
    mode: "线上 / 线下",
    verified: true,
  },
  {
    id: "card-buddy-zhou",
    targetUserId: "mock-user-buddy-zhou",
    zone: "buddy",
    name: "晚饭搭子小周",
    school: "上海交通大学",
    role: "软件工程 研一",
    title: "固定自习 + 晚饭搭子",
    subtitle: "一周 2-3 次，边界清楚，互相督促",
    description: "主要想找一起自习和吃晚饭的同学，不尬聊、不越界，效率优先。",
    tags: ["自习", "晚饭", "轻社交", "边界清楚"],
    matchScore: 81,
    reason: "你们都想找稳定自习节奏，晚饭时间也接近，关系边界表达清楚。",
    schedule: "工作日晚上",
    mode: "线下",
    verified: true,
  },
  {
    id: "card-premium-senior",
    targetUserId: "mock-user-premium-senior",
    zone: "premium",
    name: "简历修改学长",
    school: "浙江大学",
    role: "人工智能 研二",
    title: "项目方向简历修改",
    subtitle: "预约制沟通，先确认范围和价格",
    description: "可以帮你梳理项目亮点、技术表达和面试追问点。联系前先说清楚交付范围。",
    tags: ["简历修改", "项目陪跑", "项目表达", "经验咨询"],
    matchScore: 76,
    reason: "TA 的项目经历与你的求职方向接近，适合进一步沟通。",
    price: "预约确认",
    schedule: "预约制",
    mode: "线上",
    verified: true,
  },
];

export const mockProfile = {
  nickname: "想补高数的阿泽",
  school: "同济大学",
  city: "上海",
  major: "计算机科学与技术",
  boundary: "只学习 / 活动搭子",
  membership: "Free Plan",
  cards: 2,
  matches: 1,
  rightSwipesLeft: 8,
};

export const mockReports = [
  {
    id: "report-001",
    target: "搭子卡片",
    reason: "联系方式疑似提前泄露",
    risk: "medium",
    status: "待审核",
  },
  {
    id: "report-002",
    target: "家教卡片",
    reason: "价格描述不清晰",
    risk: "low",
    status: "待审核",
  },
];
