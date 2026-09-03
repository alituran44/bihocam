import logging
import os
import time
import urllib.parse
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_openrouter_key() -> str:
    return settings.OPENROUTER_API_KEY or os.getenv("OPENROUTER_API_KEY", "")


def _get_openrouter_base_url() -> str:
    url = settings.OPENROUTER_BASE_URL or os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    return url.rstrip("/")


def _get_openrouter_model() -> str:
    return settings.OPENROUTER_MODEL or os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")


def _get_gemini_key() -> str:
    return settings.GEMINI_API_KEY or os.getenv(
        "GEMINI_API_KEY", "AQ.Ab8RN6LAjf7eTZREu9Un9whUlyJZ9Bv-efPCTWUQTI1xAfZQOg"
    )


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    model: Optional[str] = None


class GenerateRequest(BaseModel):
    prompt: str
    type: str  # 'description', 'quiz', 'social'
    model: Optional[str] = None


class ImageGenerateRequest(BaseModel):
    prompt: str


async def _call_openrouter_chat(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.7,
) -> Optional[str]:
    """OpenRouter / OmniRoute OpenAI-compatible v1/chat/completions endpoint."""
    api_key = _get_openrouter_key()
    if not api_key:
        return None

    base_url = _get_openrouter_base_url()
    target_model = model or _get_openrouter_model()
    url = f"{base_url}/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": getattr(settings, "FRONTEND_URL", "http://localhost:3454"),
        "X-Title": "BiHocam AI Assistant",
        "Content-Type": "application/json",
    }

    payload = {
        "model": target_model,
        "messages": messages,
        "temperature": temperature,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            choices = data.get("choices", [])
            if choices and len(choices) > 0:
                reply = choices[0].get("message", {}).get("content", "")
                if reply:
                    return reply.strip()
        except Exception as e:
            logger.warning(f"OpenRouter / OmniRoute API Call Error: {e}")
            return None

    return None


async def _call_gemini_chat(
    contents: List[Dict[str, Any]],
) -> str:
    """Fallback Google Gemini direct API call."""
    gemini_key = _get_gemini_key()
    if not gemini_key:
        raise HTTPException(status_code=500, detail="Gemini ve OpenRouter API Anahtarı yapılandırılmamış.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"

    payload = {"contents": contents}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            reply_text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            return reply_text or "Üzgünüm, bir yanıt oluşturamadım."
        except Exception as e:
            logger.error(f"Gemini Direct API Error: {e}")
            return "Yapay zeka asistanına bağlanırken bir hata oluştu. Lütfen API ayarlarınızı kontrol ediniz."


@router.get("/info")
async def ai_info():
    """Yapay zeka servis durumu ve aktif OpenRouter / OmniRoute model bilgilerini döndürür."""
    openrouter_key = _get_openrouter_key()
    gemini_key = _get_gemini_key()
    active_provider = (
        "openrouter"
        if (settings.AI_PROVIDER == "openrouter" or (settings.AI_PROVIDER == "auto" and openrouter_key))
        else "gemini"
    )

    return {
        "active_provider": active_provider,
        "openrouter": {
            "configured": bool(openrouter_key),
            "base_url": _get_openrouter_base_url(),
            "model": _get_openrouter_model(),
        },
        "gemini": {
            "configured": bool(gemini_key),
        },
    }


@router.post("/chat")
async def ai_chat(request: ChatRequest):
    """OpenRouter / OmniRoute veya Gemini üzerinden chat yanıtı üretir."""
    # 1. Prepare OpenRouter / OpenAI format messages
    messages: List[Dict[str, str]] = [
        {
            "role": "system",
            "content": "Sen Türkiye'nin önde gelen online eğitim platformu BiHocam'ın akıllı ve yardımsever AI asistanısın. Öğrencilere ve öğretmenlere dersler, sınav hazırlıkları ve sistem kullanımı konusunda nazik, motive edici ve net yanıtlar ver.",
        }
    ]

    for msg in request.history:
        role = "user" if msg.get("role") == "user" else "assistant"
        messages.append({"role": role, "content": msg.get("content", "")})

    messages.append({"role": "user", "content": request.message})

    # Try OpenRouter / OmniRoute first if configured
    if settings.AI_PROVIDER in ["openrouter", "auto"] and _get_openrouter_key():
        reply = await _call_openrouter_chat(messages, model=request.model)
        if reply:
            return {
                "reply": reply,
                "provider": "openrouter",
                "model": request.model or _get_openrouter_model(),
            }

    # 2. Fallback to Gemini
    contents = []
    for msg in request.history:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
    contents.append({"role": "user", "parts": [{"text": request.message}]})

    gemini_reply = await _call_gemini_chat(contents)
    return {"reply": gemini_reply, "provider": "gemini", "model": "gemini-1.5-flash"}


@router.post("/generate")
async def ai_generate(request: GenerateRequest):
    """Kurs içerikleri, quiz soruları ve pazarlama metinleri üretir."""
    system_instruction = "Sen profesyonel bir eğitim içerik üreticisisin."

    if request.type == "description":
        prompt_text = f"Lütfen şu konu hakkında profesyonel, ilgi çekici ve SEO uyumlu bir kurs açıklaması yaz (HTML veya Markdown formatında): {request.prompt}"
    elif request.type == "quiz":
        prompt_text = f"Lütfen şu konuyu/metni baz alarak öğrencilerin kavrama düzeyini ölçecek 3-5 soruluk bir çoktan seçmeli quiz veya çalışma soruları hazırla. Sorular net, şıklar anlaşılır ve doğru cevaplar belirtilmiş olsun: {request.prompt}"
    elif request.type == "social":
        prompt_text = f"Lütfen bu konuyla ilgili ilgi çekici bir sosyal medya paylaşımı (Instagram Reel fikri, Tweet veya Gönderi metni) hazırla, bol emoji ve hashtag kullan: {request.prompt}"
    else:
        prompt_text = request.prompt

    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": prompt_text},
    ]

    # Try OpenRouter / OmniRoute first if configured
    if settings.AI_PROVIDER in ["openrouter", "auto"] and _get_openrouter_key():
        content = await _call_openrouter_chat(messages, model=request.model, temperature=0.7)
        if content:
            return {
                "content": content,
                "provider": "openrouter",
                "model": request.model or _get_openrouter_model(),
            }

    # Fallback to Gemini
    contents = [
        {
            "role": "user",
            "parts": [{"text": f"Sistem Talimatı: {system_instruction}\n\nİstek: {prompt_text}"}],
        }
    ]
    gemini_content = await _call_gemini_chat(contents)
    return {"content": gemini_content, "provider": "gemini", "model": "gemini-1.5-flash"}


@router.post("/generate_image")
async def ai_generate_image(request: ImageGenerateRequest):
    """Görsel üretimi için Pollinations AI entegrasyonu."""
    enhanced_prompt = f"{request.prompt}, high quality, educational, professional photography"
    encoded_prompt = urllib.parse.quote(enhanced_prompt)
    seed = int(time.time())

    image_url = (
        f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&seed={seed}"
    )

    return {"image_url": image_url}

