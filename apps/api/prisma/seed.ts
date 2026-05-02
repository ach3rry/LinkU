import {
  CardStatus,
  ContactRequestStatus,
  ModerationAction,
  ModerationRiskLevel,
  OnlineMode,
  PrismaClient,
  RelationshipBoundary,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
  VerifiedStatus,
  ZoneCode,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.adminAction.deleteMany();
  await prisma.moderationResult.deleteMany();
  await prisma.aiLog.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.card.deleteMany();
  await prisma.userTag.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.user.deleteMany();

  const [tutoringZone, buddyZone, premiumZone] = await Promise.all([
    prisma.zone.create({
      data: {
        code: ZoneCode.TUTORING,
        name: "家教专区",
        description: "找家教、当家教，按科目、学校、价格、时间和线上/线下偏好匹配。",
      },
    }),
    prisma.zone.create({
      data: {
        code: ZoneCode.BUDDY,
        name: "搭子专区",
        description: "饭搭子、自习搭子、运动搭子、黑客松队友和英语口语搭子。",
      },
    }),
    prisma.zone.create({
      data: {
        code: ZoneCode.PREMIUM,
        name: "学长学姐专区",
        description: "保研考研经验、简历修改、项目修改和 AI coding 陪跑等高价值资源。",
      },
    }),
  ]);

  await prisma.skill.createMany({
    data: [
      { name: "高等数学", normalizedName: "higher_math", category: "subject" },
      { name: "C 语言", normalizedName: "c_language", category: "programming" },
      { name: "英语口语", normalizedName: "spoken_english", category: "language" },
      { name: "简历修改", normalizedName: "resume_review", category: "premium" },
      { name: "AI Coding", normalizedName: "ai_coding", category: "premium" },
    ],
    skipDuplicates: true,
  });

  await prisma.interest.createMany({
    data: [
      { name: "自习", category: "study" },
      { name: "羽毛球", category: "sport" },
      { name: "台球", category: "sport" },
      { name: "电影", category: "life" },
      { name: "黑客松", category: "competition" },
    ],
    skipDuplicates: true,
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@linku.local",
      nickname: "LinkU 管理员",
      role: UserRole.ADMIN,
      status: "ACTIVE",
      profile: {
        create: {
          school: "LinkU University",
          city: "上海",
          verifiedStatus: VerifiedStatus.PROVIDER_VERIFIED,
          relationshipBoundary: RelationshipBoundary.STUDY_ONLY,
        },
      },
    },
  });

  const tutor = await prisma.user.create({
    data: {
      email: "tutor@linku.local",
      nickname: "小林学姐",
      lastActiveAt: new Date(),
      profile: {
        create: {
          school: "复旦大学",
          city: "上海",
          grade: "大三",
          major: "数学与应用数学",
          bio: "擅长高数和线代，讲题风格比较耐心。",
          verifiedStatus: VerifiedStatus.PROVIDER_VERIFIED,
          relationshipBoundary: RelationshipBoundary.STUDY_ONLY,
        },
      },
      userTags: {
        createMany: {
          data: [
            { tagType: "skill", tagValue: "高等数学", weight: 5 },
            { tagType: "skill", tagValue: "线性代数", weight: 4 },
            { tagType: "mode", tagValue: "线下", weight: 3 },
          ],
        },
      },
    },
  });

  const seeker = await prisma.user.create({
    data: {
      email: "student@linku.local",
      nickname: "想补高数的阿泽",
      lastActiveAt: new Date(),
      profile: {
        create: {
          school: "同济大学",
          city: "上海",
          grade: "大一",
          major: "计算机科学与技术",
          bio: "高数基础一般，希望周末有人带着复习。",
          verifiedStatus: VerifiedStatus.STUDENT_VERIFIED,
          relationshipBoundary: RelationshipBoundary.STUDY_ONLY,
        },
      },
      userTags: {
        createMany: {
          data: [
            { tagType: "need", tagValue: "高等数学", weight: 5 },
            { tagType: "schedule", tagValue: "周末", weight: 3 },
          ],
        },
      },
    },
  });

  const buddy = await prisma.user.create({
    data: {
      email: "buddy@linku.local",
      nickname: "晚饭搭子小周",
      lastActiveAt: new Date(),
      profile: {
        create: {
          school: "上海交通大学",
          city: "上海",
          grade: "研一",
          major: "软件工程",
          bio: "想找固定自习和晚饭搭子，边界清楚，轻松一点就好。",
          verifiedStatus: VerifiedStatus.STUDENT_VERIFIED,
          relationshipBoundary: RelationshipBoundary.ACTIVITY_PARTNER,
        },
      },
      userTags: {
        createMany: {
          data: [
            { tagType: "interest", tagValue: "自习", weight: 5 },
            { tagType: "interest", tagValue: "晚饭", weight: 4 },
            { tagType: "boundary", tagValue: "活动搭子", weight: 5 },
          ],
        },
      },
    },
  });

  const senior = await prisma.user.create({
    data: {
      email: "senior@linku.local",
      nickname: "简历修改学长",
      lastActiveAt: new Date(),
      profile: {
        create: {
          school: "浙江大学",
          city: "杭州",
          grade: "研二",
          major: "人工智能",
          bio: "可以帮忙看 AI / 后端方向简历和项目表达。",
          verifiedStatus: VerifiedStatus.PROVIDER_VERIFIED,
          relationshipBoundary: RelationshipBoundary.STUDY_ONLY,
        },
      },
    },
  });

  const tutorCard = await prisma.card.create({
    data: {
      userId: tutor.id,
      zoneId: tutoringZone.id,
      type: "provide_tutoring",
      title: "高数 / 线代耐心辅导",
      subtitle: "复旦数学大三，周末可线下或线上",
      description: "适合想补基础、梳理题型和考前冲刺的同学。第一次会先了解你的课程进度。",
      tags: ["高等数学", "线性代数", "周末", "线下可约"],
      priceMin: 80,
      priceMax: 120,
      schedule: { text: "周六下午、周日上午" },
      location: "上海",
      onlineMode: OnlineMode.HYBRID,
      status: CardStatus.ACTIVE,
      aiGenerated: true,
    },
  });

  const seekerCard = await prisma.card.create({
    data: {
      userId: seeker.id,
      zoneId: tutoringZone.id,
      type: "need_tutoring",
      title: "想找高数家教带复习",
      subtitle: "大一计算机，预算 100/h 左右，周末优先",
      description: "希望老师能帮我补高数基础，重点是极限、导数和积分题型。",
      tags: ["高等数学", "大一", "周末", "预算100/h"],
      priceMin: 80,
      priceMax: 120,
      schedule: { text: "周末白天" },
      location: "上海",
      onlineMode: OnlineMode.HYBRID,
      status: CardStatus.ACTIVE,
      aiGenerated: true,
    },
  });

  const buddyCard = await prisma.card.create({
    data: {
      userId: buddy.id,
      zoneId: buddyZone.id,
      type: "study_buddy",
      title: "找固定自习 + 晚饭搭子",
      subtitle: "一周 2-3 次，边界清楚，互相督促",
      description: "主要想找一起自习和吃晚饭的同学，不尬聊、不越界，效率优先。",
      tags: ["自习", "晚饭", "轻社交", "边界清楚"],
      schedule: { text: "工作日晚上" },
      location: "上海",
      onlineMode: OnlineMode.OFFLINE,
      status: CardStatus.ACTIVE,
      aiGenerated: true,
    },
  });

  await prisma.card.create({
    data: {
      userId: senior.id,
      zoneId: premiumZone.id,
      type: "resume_review",
      title: "AI / 后端方向简历修改",
      subtitle: "Premium Match mock，暂不接真实支付",
      description: "可以帮你梳理项目亮点、技术表达和面试追问点。MVP 阶段仅展示，不做真实交易。",
      tags: ["简历修改", "AI Coding", "项目表达", "Premium"],
      priceMin: 99,
      priceMax: 199,
      schedule: { text: "预约制" },
      location: "线上",
      onlineMode: OnlineMode.ONLINE,
      status: CardStatus.ACTIVE,
      aiGenerated: true,
      scoreBoost: 5,
    },
  });

  await prisma.swipe.createMany({
    data: [
      {
        swiperId: seeker.id,
        targetCardId: tutorCard.id,
        zoneId: tutoringZone.id,
        direction: "RIGHT",
      },
      {
        swiperId: tutor.id,
        targetCardId: seekerCard.id,
        zoneId: tutoringZone.id,
        direction: "RIGHT",
      },
    ],
  });

  const match = await prisma.match.create({
    data: {
      userAId: seeker.id,
      userBId: tutor.id,
      cardAId: seekerCard.id,
      cardBId: tutorCard.id,
      zoneId: tutoringZone.id,
      matchScore: 88,
      matchReason: "TA 擅长高数和线代，周末时间与你匹配，价格也在你的预算范围内。",
    },
  });

  await prisma.contactRequest.create({
    data: {
      matchId: match.id,
      senderId: seeker.id,
      message: "你好！我想这周末先试一次高数基础梳理，可以先聊一下我的课程进度吗？",
      status: ContactRequestStatus.PENDING,
    },
  });

  await prisma.report.create({
    data: {
      reporterId: buddy.id,
      targetCardId: buddyCard.id,
      reason: "seed_demo",
      detail: "这是用于管理后台演示的种子举报，非真实风险。",
      status: "PENDING",
    },
  });

  await prisma.moderationResult.create({
    data: {
      targetType: "card",
      targetId: buddyCard.id,
      riskLevel: ModerationRiskLevel.LOW,
      categories: [],
      action: ModerationAction.ALLOW,
      rawResult: {
        reason: "内容为正常校园搭子需求，边界清楚。",
      },
    },
  });

  await prisma.subscription.createMany({
    data: [
      {
        userId: seeker.id,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        source: "mock",
      },
      {
        userId: senior.id,
        plan: SubscriptionPlan.PREMIUM_MOCK,
        status: SubscriptionStatus.ACTIVE,
        source: "mock",
      },
    ],
  });

  await prisma.adminAction.create({
    data: {
      adminId: admin.id,
      action: "seed_initialized",
      targetType: "project",
      targetId: "linku-mvp",
      note: "初始化 LinkU MVP 种子数据。",
    },
  });

  console.log("LinkU seed data created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
