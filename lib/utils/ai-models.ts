/**
 * AI model utility để quản lý việc chuyển đổi giữa các model khi gặp rate limit
 *
 * Cách sử dụng:
 * ```
 * import { getGroqModel, handleModelRateLimit } from '@/lib/utils/ai-models';
 *
 * // Lấy model hiện tại để sử dụng
 * const model = getGroqModel();
 *
 * try {
 *   // Gọi API với model này
 *   const response = await callGroqAPI(model, ...);
 * } catch (error) {
 *   // Xử lý rate limit và lấy model thay thế nếu cần
 *   if (isRateLimitError(error)) {
 *     const alternativeModel = handleModelRateLimit(model);
 *     // Thử lại với model thay thế
 *     const response = await callGroqAPI(alternativeModel, ...);
 *   }
 * }
 * ```
 */

// Danh sách model được hỗ trợ
const MODELS = {
  PRIMARY:
    process.env.GROQ_PRIMARY_MODEL ||
    "meta-llama/llama-4-maverick-17b-128e-instruct",
  FALLBACK: process.env.GROQ_FALLBACK_MODEL || "llama-3.3-70b-versatile",
};

// Lưu trạng thái rate limit của các model
const modelRateLimits: Record<
  string,
  {
    limited: boolean;
    retryAt: number;
    retryCount: number;
  }
> = {
  [MODELS.PRIMARY]: { limited: false, retryAt: 0, retryCount: 0 },
  [MODELS.FALLBACK]: { limited: false, retryAt: 0, retryCount: 0 },
};

// Các hằng số cấu hình
const RATE_LIMIT_RESET_TIME = 60 * 1000; // 1 phút
const MAX_RETRY_COUNT = 5; // Số lần thử tối đa trước khi ngừng tự động reset
const MAX_FALLBACK_RETRIES = 2; // Số lần thử tối đa cho model thay thế trước khi bỏ cuộc

/**
 * Kiểm tra xem lỗi có phải là do rate limit không
 */
export function isRateLimitError(error: any): boolean {
  // Kiểm tra thông báo lỗi của Groq API cho rate limit
  if (typeof error === "string") {
    return error.includes("rate_limit_exceeded");
  }

  // Kiểm tra đối tượng lỗi
  if (
    error?.error?.code === "rate_limit_exceeded" ||
    (error?.message && error.message.includes("rate_limit_exceeded"))
  ) {
    return true;
  }

  // Kiểm tra response từ fetch API
  if (error?.status === 429) {
    return true;
  }

  return false;
}

/**
 * Đánh dấu model đã gặp rate limit và lấy model thay thế
 */
export function handleModelRateLimit(currentModel: string): string {
  // Đánh dấu model hiện tại là bị rate limit
  if (modelRateLimits[currentModel]) {
    modelRateLimits[currentModel].limited = true;
    modelRateLimits[currentModel].retryAt = Date.now() + RATE_LIMIT_RESET_TIME;
    modelRateLimits[currentModel].retryCount += 1;

    console.log(
      `[AI-MODEL] 🔴 Model ${currentModel} bị rate limit. Chuyển sang model thay thế.`
    );
  }

  // Tự động reset rate limit sau một thời gian nếu số lần thử chưa vượt quá ngưỡng
  if (modelRateLimits[currentModel]?.retryCount <= MAX_RETRY_COUNT) {
    setTimeout(() => {
      if (modelRateLimits[currentModel]) {
        modelRateLimits[currentModel].limited = false;
        console.log(
          `[AI-MODEL] 🟢 Reset rate limit cho model ${currentModel}.`
        );
      }
    }, RATE_LIMIT_RESET_TIME);
  }

  // Trả về model thay thế
  return getAlternativeModel(currentModel);
}

/**
 * Lấy model thay thế cho model hiện tại
 */
function getAlternativeModel(currentModel: string): string {
  // Nếu model hiện tại là model chính, trả về model dự phòng
  if (currentModel === MODELS.PRIMARY) {
    return MODELS.FALLBACK;
  }
  // Ngược lại, trả về model chính
  return MODELS.PRIMARY;
}

/**
 * Lấy model phù hợp nhất để sử dụng tại thời điểm hiện tại
 * Ưu tiên model PRIMARY nếu không bị rate limit
 */
export function getGroqModel(): string {
  // Dọn dẹp trạng thái rate limit nếu đã hết thời gian
  Object.keys(modelRateLimits).forEach((model) => {
    if (
      modelRateLimits[model].limited &&
      Date.now() >= modelRateLimits[model].retryAt
    ) {
      modelRateLimits[model].limited = false;
      console.log(
        `[AI-MODEL] 🟢 Tự động reset rate limit cho model ${model} do hết thời gian chờ.`
      );
    }
  });

  // Ưu tiên model chính nếu không bị rate limit
  if (!modelRateLimits[MODELS.PRIMARY].limited) {
    return MODELS.PRIMARY;
  }

  // Nếu model chính bị rate limit, kiểm tra model dự phòng
  if (!modelRateLimits[MODELS.FALLBACK].limited) {
    return MODELS.FALLBACK;
  }

  // Nếu cả hai model đều bị rate limit, trả về model có thời gian retry sớm hơn
  if (
    modelRateLimits[MODELS.PRIMARY].retryAt <=
    modelRateLimits[MODELS.FALLBACK].retryAt
  ) {
    return MODELS.PRIMARY;
  } else {
    return MODELS.FALLBACK;
  }
}

/**
 * Hàm tiện ích để gọi Groq API với xử lý rate limit
 */
export async function callGroqAPI(
  messages: any[],
  options: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}
): Promise<Response> {
  // Lấy model phù hợp nhất hiện tại
  let model = getGroqModel();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined");
  }

  // Log model được sử dụng
  console.log(`[AI-MODEL] 🤖 Đang sử dụng model: ${model}`);

  try {
    // Bắt đầu thời gian request
    const startTime = Date.now();

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: options.stream ?? true,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1024,
        }),
      }
    );

    // Thời gian hoàn thành request
    const requestTime = Date.now() - startTime;

    // Nếu API trả về lỗi
    if (!response.ok) {
      try {
        // Clone response trước khi đọc body để có thể tái sử dụng
        const clonedResponse = response.clone();
        const responseText = await clonedResponse.text();
        let responseBody;

        try {
          responseBody = JSON.parse(responseText);
        } catch (e) {
          responseBody = { error: { message: responseText } };
        }

        // Kiểm tra xem có phải lỗi rate limit không
        if (
          response.status === 429 ||
          (responseBody?.error?.message &&
            responseBody.error.message.includes("rate_limit_exceeded"))
        ) {
          console.error(
            `[AI-MODEL] ⚠️ Rate limit reached for model: ${model}. Response: ${responseText}`
          );

          // Xử lý rate limit và lấy model thay thế
          const alternativeModel = handleModelRateLimit(model);
          console.log(
            `[AI-MODEL] 🔀 Switching to alternative model: ${alternativeModel}`
          );

          // Bắt đầu thời gian request thay thế
          const altStartTime = Date.now();

          // Thử lại với model thay thế
          let retryCount = 0;
          let altResponse = null;

          while (retryCount < MAX_FALLBACK_RETRIES && !altResponse) {
            try {
              const attemptResponse = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    model: alternativeModel,
                    messages,
                    stream: options.stream ?? true,
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.max_tokens ?? 1024,
                  }),
                }
              );

              // Thời gian hoàn thành request thay thế
              const altRequestTime = Date.now() - altStartTime;

              if (attemptResponse.ok) {
                console.log(
                  `[AI-MODEL] ✅ Request với model thay thế ${alternativeModel} thành công sau ${altRequestTime}ms`
                );
                altResponse = attemptResponse;
                break;
              } else {
                console.error(
                  `[AI-MODEL] ⚠️ Lần thử ${
                    retryCount + 1
                  }: Request với model thay thế ${alternativeModel} thất bại sau ${altRequestTime}ms`
                );

                // Đọc nội dung lỗi từ phản hồi model thay thế
                const altErrorText = await attemptResponse.text();
                console.error(
                  `[AI-MODEL] Lỗi khi dùng model thay thế: ${altErrorText}`
                );

                // Tăng số lần thử và chờ một chút trước khi thử lại
                retryCount++;
                if (retryCount < MAX_FALLBACK_RETRIES) {
                  console.log(
                    `[AI-MODEL] 🔄 Đợi 1 giây và thử lại với model thay thế...`
                  );
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }
              }
            } catch (attemptError) {
              console.error(
                `[AI-MODEL] ❌ Lỗi kết nối khi thử model thay thế lần ${
                  retryCount + 1
                }:`,
                attemptError
              );
              retryCount++;
              if (retryCount < MAX_FALLBACK_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }

          if (altResponse) {
            return altResponse;
          } else {
            // Nếu cả hai model đều lỗi, trả về thông báo lỗi
            console.error(
              `[AI-MODEL] ❌ Đã thử ${MAX_FALLBACK_RETRIES} lần, không thể sử dụng model thay thế.`
            );

            // Trả về response lỗi có thể xử lý
            return new Response(
              JSON.stringify({
                error: "Cả hai model đều không khả dụng, vui lòng thử lại sau.",
                suggestions: [],
              }),
              {
                status: 503,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }

        // Nếu không phải lỗi rate limit, throw lỗi
        console.error(
          `[AI-MODEL] ❌ Error from Groq API (model: ${model}): ${responseText}`
        );
        throw new Error(`Error from Groq API: ${responseText}`);
      } catch (parseError) {
        console.error(
          `[AI-MODEL] ❌ Error parsing API response: ${parseError}`
        );
        throw parseError;
      }
    }

    console.log(
      `[AI-MODEL] ✅ Request thành công với model ${model} sau ${requestTime}ms`
    );
    return response;
  } catch (error) {
    console.error(
      `[AI-MODEL] ❌ Error calling Groq API (model: ${model}):`,
      error
    );
    throw error;
  }
}
