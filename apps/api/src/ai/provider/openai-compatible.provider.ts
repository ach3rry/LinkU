import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ZodSchema } from "zod";

type GenerateJsonInput<T> = {
  system: string;
  user: string;
  schema: ZodSchema<T>;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

@Injectable()
export class OpenAICompatibleProvider {
  constructor(private readonly configService: ConfigService) {}

  isConfigured() {
    return Boolean(
      this.configService.get<string>("OPENAI_COMPATIBLE_BASE_URL") &&
      this.configService.get<string>("OPENAI_COMPATIBLE_API_KEY") &&
      this.configService.get<string>("OPENAI_COMPATIBLE_MODEL"),
    );
  }

  async generateJson<T>(input: GenerateJsonInput<T>): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error("AI Provider 未配置");
    }

    const baseUrl = this.configService.getOrThrow<string>("OPENAI_COMPATIBLE_BASE_URL");
    const apiKey = this.configService.getOrThrow<string>("OPENAI_COMPATIBLE_API_KEY");
    const model = this.configService.getOrThrow<string>("OPENAI_COMPATIBLE_MODEL");

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Provider 请求失败：${response.status}`);
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI Provider 返回为空");
    }

    const parsedJson = JSON.parse(content) as unknown;
    return input.schema.parse(parsedJson);
  }
}
