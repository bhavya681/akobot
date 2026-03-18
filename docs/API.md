# AKOBOT API Reference

Base URL: `https://api.akobot.ai` (or your configured `NEXT_PUBLIC_API_URL`)

All apimodule endpoints are proxied via `/api/apimodule` in the Next.js app.

---

## Image Generation

### POST /apimodule/v1/image-gen

Generate image from text prompt and return base64 (no polling).

**Request**

| Method | Content-Type |
|--------|--------------|
| POST   | application/json |

**Request Body**

```json
{
  "prompt": "A futuristic city at sunset",
  "model_id": "flux-2-dev",
  "width": 512,
  "height": 512
}
```

| Field     | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| prompt    | string | Yes      | -       | Text prompt for image generation |
| model_id  | string | Yes      | -       | Model ID (e.g. flux-2-dev)     |
| width     | number | No       | 512     | Image width in pixels          |
| height    | number | No       | 512     | Image height in pixels         |

**Response**

| Code | Description        |
|------|--------------------|
| 201  | Success (base64 in response body) |
| 401  | Unauthorized       |
| 500  | Server error       |

---

## Fetch Image Result

### GET /apimodule/v1/fetch-image-result/{id}

Refetch image base64 by task ID.

**Request**

| Method | Path Parameter |
|--------|----------------|
| GET    | `id` (string) - Task/result ID |

**Response**

| Code | Description |
|------|-------------|
| 200  | Success (image data in response) |
| 401  | Unauthorized |
| 404  | Not found    |

---

## Image to Image

### POST /apimodule/v1/image-to-image

Transform an image using a prompt (flux-kontext-dev model).

**Request**

| Method | Content-Type           |
|--------|------------------------|
| POST   | multipart/form-data    |

**Request Body (Form Data)**

| Field      | Type   | Required | Description                              |
|------------|--------|----------|------------------------------------------|
| prompt     | string | Yes      | Prompt for image transformation          |
| model_id   | string | No       | Model ID to use                          |
| init_image | string | No*      | Initial image as Base64 string           |
| strength   | number | No       | Transformation strength (0.0 to 1.0)     |
| file       | file   | No*      | Image file upload                        |

*Either `init_image` or `file` must be provided.

**Response**

| Code | Description |
|------|-------------|
| 201  | Success     |
| 401  | Unauthorized |
| 500  | Server error |

---

## Video Generation

### POST /apimodule/v1/text-to-video

Generate video from text prompt.

**Request**

| Method | Content-Type |
|--------|--------------|
| POST   | application/json |

**Request Body**

```json
{
  "prompt": "A cat playing piano in a futuristic city",
  "model_id": "cogvideox",
  "num_frames": 25,
  "width": 512,
  "height": 512,
  "num_inference_steps": 20,
  "guidance_scale": 7,
  "fps": 16
}
```

| Field              | Type   | Required | Default   | Description           |
|--------------------|--------|----------|-----------|-----------------------|
| prompt             | string | Yes      | -         | Text prompt           |
| model_id           | string | No       | cogvideox | Video model ID        |
| num_frames         | number | No       | 25        | Number of frames      |
| width              | number | No       | 512       | Video width           |
| height             | number | No       | 512       | Video height          |
| num_inference_steps| number | No       | 20        | Inference steps       |
| guidance_scale     | number | No       | 7         | Guidance scale        |
| fps                | number | No       | 16        | Frames per second     |

**Response**

| Code | Description |
|------|-------------|
| 201  | Success     |
| 401  | Unauthorized |
| 500  | Server error |

---

## Client Usage

```typescript
import { moduleAPI } from "@/lib/api";

// Image generation
const image = await moduleAPI.imageGen({
  prompt: "A futuristic city at sunset",
  model_id: "flux-2-dev",
  width: 512,
  height: 512,
});

// Fetch image by ID (if image-gen returns task ID)
const result = await moduleAPI.fetchImageResult(taskId);

// Image to image
const transformed = await moduleAPI.imageToImage({
  prompt: "Make it look like a painting",
  model_id: "flux-kontext-dev",
  file: imageFile,
  strength: 0.7,
});

// Video generation
const video = await moduleAPI.textToVideo({
  prompt: "A cat playing piano",
  model_id: "cogvideox",
  num_frames: 25,
});
```
