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

// Danh sách model theo thứ tự ưu tiên
const DEFAULT_MODEL_PRIORITY = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "meta-llama/llama-4-maverick-17b-128e-instruct", // Ưu tiên 1
  "meta-llama/llama-4-scout-17b-16e-instruct", // Ưu tiên 2
  "llama-3.3-70b-versatile", // Ưu tiên 3
  "llama-3.1-8b-instant", // Ưu tiên 4
  "deepseek-r1-distill-llama-70b", // Ưu tiên 5
  "llama3-70b-8192", // Ưu tiên 6
  "llama3-8b-8192", // Ưu tiên 7
  "gemma2-9b-it", // Ưu tiên 8 (cuối)
];

// Lấy danh sách model từ môi trường hoặc sử dụng danh sách mặc định
const MODEL_PRIORITY = process.env.GROQ_MODEL_PRIORITY
  ? process.env.GROQ_MODEL_PRIORITY.split(",").map((model) => model.trim())
  : DEFAULT_MODEL_PRIORITY;

// Lưu trạng thái rate limit của các model
const modelRateLimits: Record<
  string,
  {
    limited: boolean;
    retryAt: number;
    retryCount: number;
  }
> = {};

// Khởi tạo trạng thái cho tất cả model
MODEL_PRIORITY.forEach((model) => {
  modelRateLimits[model] = { limited: false, retryAt: 0, retryCount: 0 };
});

// Các hằng số cấu hình
const RATE_LIMIT_RESET_TIME = 60 * 1000; // 1 phút
const MAX_RETRY_COUNT = 5; // Số lần thử tối đa trước khi ngừng tự động reset
const MAX_FALLBACK_RETRIES = 2; // Số lần thử tối đa cho model thay thế trước khi thử model tiếp theo

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

  // Trả về model thay thế theo thứ tự ưu tiên
  return getNextAvailableModel(currentModel);
}

/**
 * Lấy model tiếp theo có sẵn theo thứ tự ưu tiên
 */
function getNextAvailableModel(currentModel: string): string {
  // Tìm vị trí của model hiện tại trong danh sách ưu tiên
  const currentIndex = MODEL_PRIORITY.indexOf(currentModel);

  // Nếu không tìm thấy model hiện tại trong danh sách, trả về model đầu tiên
  if (currentIndex === -1) return MODEL_PRIORITY[0];

  // Tìm model tiếp theo chưa bị rate limit
  for (let i = 0; i < MODEL_PRIORITY.length; i++) {
    // Bắt đầu từ model sau model hiện tại, nếu đến cuối danh sách thì quay lại đầu
    const nextIndex = (currentIndex + i + 1) % MODEL_PRIORITY.length;
    const nextModel = MODEL_PRIORITY[nextIndex];

    // Nếu model tiếp theo không bị rate limit, sử dụng nó
    if (!modelRateLimits[nextModel]?.limited) {
      return nextModel;
    }
  }

  // Nếu tất cả model đều bị rate limit, trả về model có thời gian retry sớm nhất
  return MODEL_PRIORITY.reduce((earliest, model) => {
    if (
      !modelRateLimits[earliest] ||
      (modelRateLimits[model] &&
        modelRateLimits[model].retryAt < modelRateLimits[earliest].retryAt)
    ) {
      return model;
    }
    return earliest;
  }, MODEL_PRIORITY[0]);
}

/**
 * Lấy model phù hợp nhất để sử dụng tại thời điểm hiện tại
 * Ưu tiên theo thứ tự trong MODEL_PRIORITY
 */
export function getGroqModel(): string {
  // Dọn dẹp trạng thái rate limit nếu đã hết thời gian
  Object.keys(modelRateLimits).forEach((model) => {
    if (
      modelRateLimits[model]?.limited &&
      Date.now() >= modelRateLimits[model].retryAt
    ) {
      modelRateLimits[model].limited = false;
      console.log(
        `[AI-MODEL] 🟢 Tự động reset rate limit cho model ${model} do hết thời gian chờ.`
      );
    }
  });

  // Tìm model đầu tiên trong danh sách ưu tiên mà không bị rate limit
  for (const model of MODEL_PRIORITY) {
    if (!modelRateLimits[model]?.limited) {
      return model;
    }
  }

  // Nếu tất cả model đều bị rate limit, trả về model có thời gian retry sớm nhất
  return MODEL_PRIORITY.reduce((earliest, model) => {
    if (
      !modelRateLimits[earliest] ||
      (modelRateLimits[model] &&
        modelRateLimits[model].retryAt < modelRateLimits[earliest].retryAt)
    ) {
      return model;
    }
    return earliest;
  }, MODEL_PRIORITY[0]);
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
          let alternativeModel = model;
          const triedModels = new Set([model]); // Lưu lại các model đã thử để tránh lặp vô hạn

          // Thử từng model theo thứ tự ưu tiên cho đến khi tìm được model hoạt động
          for (
            let attempt = 0;
            attempt < MODEL_PRIORITY.length - 1;
            attempt++
          ) {
            // Lấy model thay thế tiếp theo
            alternativeModel = handleModelRateLimit(alternativeModel);

            // Nếu đã thử model này rồi, bỏ qua để tránh lặp vô hạn
            if (triedModels.has(alternativeModel)) continue;
            triedModels.add(alternativeModel);

            console.log(
              `[AI-MODEL] 🔀 Switching to alternative model: ${alternativeModel}`
            );

            // Bắt đầu thời gian request thay thế
            const altStartTime = Date.now();

            // Thử với model thay thế
            try {
              const alternativeResponse = await fetch(
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

              if (alternativeResponse.ok) {
                console.log(
                  `[AI-MODEL] ✅ Request với model thay thế ${alternativeModel} thành công sau ${altRequestTime}ms`
                );
                return alternativeResponse;
              } else {
                const altErrorText = await alternativeResponse.text();
                console.error(
                  `[AI-MODEL] ❌ Request với model thay thế ${alternativeModel} thất bại sau ${altRequestTime}ms: ${altErrorText}`
                );

                // Kiểm tra nếu lỗi là do rate limit, đánh dấu model này cũng bị rate limit
                if (
                  alternativeResponse.status === 429 ||
                  altErrorText.includes("rate_limit_exceeded")
                ) {
                  handleModelRateLimit(alternativeModel);
                }
              }
            } catch (attemptError) {
              console.error(
                `[AI-MODEL] ❌ Lỗi kết nối khi thử model ${alternativeModel}:`,
                attemptError
              );
            }
          }

          // Nếu đã thử tất cả model và không có model nào hoạt động
          console.error(
            `[AI-MODEL] ❌ Đã thử tất cả ${triedModels.size} model nhưng không có model nào khả dụng.`
          );

          // Trả về response lỗi có thể xử lý
          return new Response(
            JSON.stringify({
              error: "Tất cả model đều không khả dụng, vui lòng thử lại sau.",
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
