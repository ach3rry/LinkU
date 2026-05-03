import assert from "node:assert/strict";
import test from "node:test";
import { Test } from "@nestjs/testing";
import { AppModule } from "./app.module";

test("AppModule compiles with guarded controllers", async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  assert.ok(moduleRef);
  await moduleRef.close();
});
