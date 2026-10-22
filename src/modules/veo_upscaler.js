/**
 * VeoAiUpscaler - Module độc quyền cho AIForge_Veo3_Studio
 * Quản lý tính năng tự động nâng cấp độ nét video từ 720p lên 1080p Full HD
 * bằng mô hình AI Upscaler gốc của Google Veo 3.1
 */

const https = require('https');

class VeoAiUpscaler {
  constructor(options = {}) {
    this.apiBase = options.apiBase || 'https://aisandbox-pa.googleapis.com/v1';
    this.maxPollDurationMs = options.maxPollDurationMs || 300000; // 5 phút
    this.pollIntervalMs = options.pollIntervalMs || 4000;
  }

  /**
   * Xác định độ phân giải mục tiêu
   * @param {string} sourceResolution
   * @returns {string|null}
   */
  getTargetResolution(sourceResolution) {
    const norm = String(sourceResolution || '').trim().toUpperCase();
    if (norm === '720P' || norm === 'VIDEO_RESOLUTION_720P') return '1080p';
    if (norm === '360P' || norm === 'VIDEO_RESOLUTION_360P') return '720p';
    return null;
  }

  /**
   * Lấy model key cho upsample
   * @param {string} targetRes
   */
  getModelKey(targetRes) {
    return targetRes === '720p' ? 'omni_upsampler_360p' : 'veo_3_1_upsampler_1080p';
  }

  /**
   * Tạo payload gửi lên Google Flow API
   */
  buildUpsamplePayload({
    projectId,
    mediaId,
    targetResolution,
    aspectRatio = 'VIDEO_ASPECT_RATIO_LANDSCAPE',
    userPaygateTier = 'PAYGATE_TIER_TWO',
    recaptchaToken,
    workflowId
  }) {
    const targetResKey = targetResolution === '720p' ? 'VIDEO_RESOLUTION_720P' : 'VIDEO_RESOLUTION_1080P';
    const modelKey = this.getModelKey(targetResolution);
    const sessionId = `;${Date.now()}`;
    const batchId = `upscale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      mediaGenerationContext: {
        batchId,
        audioFailurePreference: 'BLOCK_SILENCED_VIDEOS'
      },
      clientContext: {
        projectId,
        tool: 'PINHOLE',
        userPaygateTier: userPaygateTier || 'PAYGATE_TIER_TWO',
        sessionId,
        recaptchaContext: recaptchaToken ? {
          token: recaptchaToken,
          applicationType: 'RECAPTCHA_APPLICATION_TYPE_WEB'
        } : undefined
      },
      requests: [{
        resolution: targetResKey,
        aspectRatio,
        videoModelKey: modelKey,
        seed: Math.floor(Math.random() * 99999) + 1,
        metadata: workflowId ? { workflowId } : {},
        videoInput: { mediaId }
      }],
      useV2ModelConfig: true
    };
  }

  /**
   * Gửi request HTTP bằng fetch hoặc https
   */
  async request(endpoint, { method = 'POST', headers = {}, body, signal }) {
    const url = `${this.apiBase}${endpoint}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Google Flow Upscale request failed (${res.status}): ${errText.slice(0, 300)}`);
    }

    return await res.json();
  }

  /**
   * Thực hiện upscale video từ 720p lên 1080p
   */
  async upscaleVideo({
    accessToken,
    projectId,
    mediaId,
    aspectRatio,
    userPaygateTier,
    recaptchaToken,
    workflowId,
    fingerprint,
    onProgress,
    signal
  }) {
    const targetResolution = '1080p';
    if (onProgress) onProgress(89, 'Đang gửi yêu cầu Upscale 1080p lên Google Flow...');

    const payload = this.buildUpsamplePayload({
      projectId,
      mediaId,
      targetResolution,
      aspectRatio,
      userPaygateTier,
      recaptchaToken,
      workflowId
    });

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'x-client-data': fingerprint || ''
    };

    // 1. Submit Upsample Job
    const submitRes = await this.request('/video:batchAsyncGenerateVideoUpsampleVideo', {
      method: 'POST',
      headers,
      body: payload,
      signal
    });

    const operation = submitRes?.operations?.[0] || submitRes?.operation;
    const opName = operation?.name || operation?.operation?.name;
    if (!opName) {
      throw new Error('Google Flow không trả về mã tác vụ (operation id) cho việc Upscale');
    }

    const upsampledMediaName = `${mediaId}_1080p_upsampled`;

    // 2. Poll Status cho đến khi hoàn thành
    const startTime = Date.now();
    let pollCount = 0;
    let currentOp = operation;

    while (Date.now() - startTime < this.maxPollDurationMs) {
      if (signal?.aborted) throw new Error('Hủy tác vụ Upscale video');

      // Kiểm tra xem đã có video URL trong metadata chưa
      const directUrl = currentOp?.metadata?.video?.videoUrl || currentOp?.operation?.metadata?.video?.videoUrl;
      if (directUrl) {
        if (onProgress) onProgress(98, 'Đã hoàn tất Upscale 1080p!');
        return {
          success: true,
          url: directUrl,
          mediaName: upsampledMediaName,
          resolution: '1080p'
        };
      }

      // Check lỗi
      const opError = currentOp?.error || currentOp?.operation?.error;
      if (opError) {
        throw new Error(`Google Flow Upscale báo lỗi: ${opError.message || JSON.stringify(opError)}`);
      }

      pollCount++;
      const percent = Math.min(97, 89 + pollCount * 2);
      if (onProgress) onProgress(percent, `Đang xử lý nâng nét 1080p bằng AI (${pollCount})...`);

      await new Promise(r => setTimeout(r, this.pollIntervalMs));

      // Check operation status
      try {
        const checkRes = await this.request('/video:checkVideoStatus', {
          method: 'POST',
          headers,
          body: { operations: [currentOp] },
          signal
        });
        if (checkRes?.operations?.[0]) {
          currentOp = checkRes.operations[0];
        }
      } catch (err) {
        // Retry polling nếu chỉ là lỗi mạng tạm thời
        if (signal?.aborted) throw err;
      }
    }

    throw new Error('Quá thời gian chờ xử lý Upscale video 1080p từ Google Flow');
  }
}

module.exports = { VeoAiUpscaler };
