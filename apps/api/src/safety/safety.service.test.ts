import assert from "node:assert/strict";
import test from "node:test";
import { ModerationAction, ModerationRiskLevel } from "@prisma/client";
import { SafetyService } from "./safety.service";

const safetyService = new SafetyService({} as ConstructorParameters<typeof SafetyService>[0]);

test("SafetyService allows normal campus study content", () => {
  const result = safetyService.checkText("想找周末一起复习高数的同学，地点在学校图书馆。");

  assert.equal(result.riskLevel, ModerationRiskLevel.LOW);
  assert.equal(result.action, ModerationAction.ALLOW);
  assert.deepEqual(result.categories, []);
});

test("SafetyService sends contact leakage to review", () => {
  const result = safetyService.checkText("可以加我微信聊一下课程安排吗？");

  assert.equal(result.riskLevel, ModerationRiskLevel.MEDIUM);
  assert.equal(result.action, ModerationAction.REVIEW);
  assert.deepEqual(result.categories, ["personal_contact_leakage"]);
  assert.equal(safetyService.hasContactLeakage("手机号 13800138000"), true);
});

test("SafetyService blocks high-risk illegal transaction content", () => {
  const result = safetyService.checkText("我可以代写作业，也能帮你买答案。");

  assert.equal(result.riskLevel, ModerationRiskLevel.HIGH);
  assert.equal(result.action, ModerationAction.BLOCK);
  assert.ok(result.categories.includes("illegal_transaction"));
});
