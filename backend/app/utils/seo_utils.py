"""
SEO Utilities for Blog Posts

Meta tags, Open Graph, Twitter Card, Schema.org JSON-LD generation.
"""

from typing import Optional
from datetime import datetime

from app.models.blog_post import BlogPost
from app.models.blog_category import BlogCategory
from app.models.blog_tag import BlogTag
from app.models.user import User


def generate_meta_tags(post: BlogPost, base_url: str = "") -> dict:
    """
    Blog post için meta tags oluştur.
    
    Args:
        post: BlogPost objesi
        base_url: Base URL (örn: "https://bihocam.com")
    
    Returns:
        Meta tags dict
    """
    canonical_url = post.seo_canonical_url or f"{base_url}/blog/{post.slug}"
    og_image = post.seo_og_image_url or post.featured_image_url
    
    return {
        "title": post.seo_meta_title or post.title,
        "description": post.seo_meta_description or post.excerpt or "",
        "keywords": post.seo_meta_keywords or "",
        "canonical_url": canonical_url,
        "og_title": post.seo_og_title or post.title,
        "og_description": post.seo_og_description or post.excerpt or "",
        "og_image": og_image or "",
        "og_type": "article",
        "og_url": canonical_url,
        "twitter_card": post.seo_twitter_card or "summary_large_image",
        "twitter_title": post.seo_og_title or post.title,
        "twitter_description": post.seo_og_description or post.excerpt or "",
        "twitter_image": og_image or "",
    }


def generate_schema_org_json(post: BlogPost, base_url: str = "") -> dict:
    """
    Blog post için Schema.org JSON-LD oluştur.
    
    Args:
        post: BlogPost objesi
        base_url: Base URL
    
    Returns:
        Schema.org JSON-LD dict
    """
    canonical_url = post.seo_canonical_url or f"{base_url}/blog/{post.slug}"
    
    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt or "",
        "url": canonical_url,
        "datePublished": post.published_at.isoformat() if post.published_at else post.created_at.isoformat(),
        "dateModified": post.updated_at.isoformat(),
        "author": {
            "@type": "Person",
            "name": post.author.full_name if post.author else "Unknown",
            "url": f"{base_url}/blog/author/{post.author_id}" if post.author else None,
        },
        "publisher": {
            "@type": "Organization",
            "name": "BiHocam",
            "url": base_url,
        },
    }
    
    if post.featured_image_url:
        schema["image"] = post.featured_image_url
    
    if post.categories:
        schema["articleSection"] = [cat.name for cat in post.categories]
    
    if post.tags:
        schema["keywords"] = [tag.name for tag in post.tags]
    
    return schema


def generate_category_meta_tags(category: BlogCategory, base_url: str = "") -> dict:
    """Kategori için meta tags oluştur"""
    canonical_url = f"{base_url}/blog/category/{category.slug}"
    
    return {
        "title": category.seo_meta_title or category.name,
        "description": category.seo_meta_description or category.description or "",
        "canonical_url": canonical_url,
        "og_title": category.seo_meta_title or category.name,
        "og_description": category.seo_meta_description or category.description or "",
        "og_type": "website",
        "og_url": canonical_url,
    }


def generate_tag_meta_tags(tag: BlogTag, base_url: str = "") -> dict:
    """Etiket için meta tags oluştur"""
    canonical_url = f"{base_url}/blog/tag/{tag.slug}"
    
    return {
        "title": f"{tag.name} - Blog Etiketleri",
        "description": tag.description or f"{tag.name} etiketli blog yazıları",
        "canonical_url": canonical_url,
        "og_title": f"{tag.name} - Blog Etiketleri",
        "og_description": tag.description or f"{tag.name} etiketli blog yazıları",
        "og_type": "website",
        "og_url": canonical_url,
    }


def generate_author_meta_tags(author: User, base_url: str = "") -> dict:
    """Yazar için meta tags oluştur"""
    canonical_url = f"{base_url}/blog/author/{author.id}"
    
    return {
        "title": f"{author.full_name} - Blog Yazarı",
        "description": author.bio or f"{author.full_name} tarafından yazılan blog yazıları",
        "canonical_url": canonical_url,
        "og_title": f"{author.full_name} - Blog Yazarı",
        "og_description": author.bio or f"{author.full_name} tarafından yazılan blog yazıları",
        "og_type": "profile",
        "og_url": canonical_url,
        "og_image": author.avatar_url or "",
    }


def validate_seo_data(data: dict) -> tuple[bool, list[str]]:
    """
    SEO verilerini validate et.
    
    Args:
        data: SEO data dict
    
    Returns:
        (is_valid, errors)
    """
    errors = []
    
    if "meta_title" in data and data["meta_title"]:
        if len(data["meta_title"]) > 60:
            errors.append("Meta title must be 60 characters or less")
    
    if "meta_description" in data and data["meta_description"]:
        if len(data["meta_description"]) > 160:
            errors.append("Meta description must be 160 characters or less")
    
    return len(errors) == 0, errors


def optimize_meta_description(text: str, max_length: int = 160) -> str:
    """
    Meta description'ı optimize et.
    
    Args:
        text: Original text
        max_length: Maximum length
    
    Returns:
        Optimized description
    """
    if not text:
        return ""
    
    if len(text) <= max_length:
        return text
    
    # Son kelimeyi kesme, nokta/virgül sonrası kes
    truncated = text[:max_length]
    last_space = truncated.rfind(" ")
    last_punct = max(truncated.rfind("."), truncated.rfind(","), truncated.rfind(";"))
    
    if last_punct > last_space - 20:  # Nokta/virgül yakınsa oradan kes
        return truncated[:last_punct + 1]
    elif last_space > 0:
        return truncated[:last_space] + "..."
    else:
        return truncated + "..."
