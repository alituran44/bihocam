from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os

router = APIRouter()

# TODO: Move to .env in production
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6LAjf7eTZREu9Un9whUlyJZ9Bv-efPCTWUQTI1xAfZQOg")

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    
class GenerateRequest(BaseModel):
    prompt: str
    type: str # 'description', 'quiz'

@router.post("/chat")
async def ai_chat(request: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    # Format history for Gemini API
    contents = []
    for msg in request.history:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })
        
    # Add current message
    contents.append({
        "role": "user",
        "parts": [{"text": request.message}]
    })
    
    payload = {
        "contents": contents
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            # Extract text from Gemini response
            reply_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            if not reply_text:
                reply_text = "Üzgünüm, bir yanıt oluşturamadım."
                
            return {"reply": reply_text}
            
        except Exception as e:
            print(f"Gemini API Error: {str(e)}")
            # Fallback mock response for testing if key is invalid
            return {"reply": "Yapay zeka asistanına bağlandım, ancak gerçek bir cevap üretemedim. API anahtarını kontrol ediniz."}

@router.post("/generate")
async def ai_generate(request: GenerateRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    system_instruction = "Sen profesyonel bir eğitim içerik üreticisisin."
    if request.type == "description":
        prompt_text = f"Lütfen şu konu hakkında profesyonel, ilgi çekici ve SEO uyumlu bir kurs açıklaması yaz (HTML veya Markdown formatında): {request.prompt}"
    elif request.type == "quiz":
        prompt_text = f"Lütfen şu konuyu/metni baz alarak öğrencilerin kavrama düzeyini ölçecek 3-5 soruluk bir çoktan seçmeli quiz veya çalışma soruları hazırla. Sorular net, şıklar anlaşılır ve doğru cevaplar belirtilmiş olsun: {request.prompt}"
    elif request.type == "social":
        prompt_text = f"Lütfen bu konuyla ilgili ilgi çekici bir sosyal medya paylaşımı (Instagram Reel fikri, Tweet veya Gönderi metni) hazırla, bol emoji ve hashtag kullan: {request.prompt}"
    else:
        prompt_text = request.prompt
        
    payload = {
        "contents": [{
            "role": "user",
            "parts": [{"text": f"Sistem Talimatı: {system_instruction}\n\nİstek: {prompt_text}"}]
        }],
        "generationConfig": {
            "temperature": 0.7
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            reply_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return {"content": reply_text}
        except Exception as e:
            print(f"Gemini API Error: {str(e)}")
            return {"content": "Örnek Yapay Zeka İçeriği: API bağlantısı sağlanamadı. Lütfen anahtarınızı kontrol edin."}

class ImageGenerateRequest(BaseModel):
    prompt: str

@router.post("/generate_image")
async def ai_generate_image(request: ImageGenerateRequest):
    # DALL-E or Midjourney alternative: Use free Pollinations AI for instant image generation without API Key
    import urllib.parse
    import time
    
    # Optional: We could ask Gemini to translate the prompt to English for better image generation results
    # For now, we will use the prompt directly but append terms for better quality
    enhanced_prompt = f"{request.prompt}, high quality, educational, professional photography"
    encoded_prompt = urllib.parse.quote(enhanced_prompt)
    seed = int(time.time()) # Add seed to avoid caching
    
    image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&seed={seed}"
    
    return {"image_url": image_url}
