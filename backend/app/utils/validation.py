"""Validation utilities for EPIC-5"""
import re
from html import escape
from urllib.parse import urlparse


# Allowed domains for social media links
ALLOWED_SOCIAL_DOMAINS = {
    "linkedin.com",
    "www.linkedin.com",
    "linkedin.co.uk",
    "twitter.com",
    "www.twitter.com",
    "x.com",
    "www.x.com",
    "instagram.com",
    "www.instagram.com",
}


def sanitize_html(text: str) -> str:
    """
    Sanitize HTML content - escape HTML tags to prevent XSS.
    For bio field, we want plain text, so we escape all HTML.
    """
    if not text:
        return ""
    return escape(text)


def validate_social_url(url: str, platform: str) -> bool:
    """
    Validate social media URL against domain whitelist.
    
    Args:
        url: The URL to validate
        platform: The platform name (linkedin, twitter, instagram, website)
    
    Returns:
        True if valid, False otherwise
    """
    if not url:
        return True  # Empty URLs are allowed (optional fields)
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # Remove www. prefix for comparison
        if domain.startswith("www."):
            domain = domain[4:]
        
        # Website URLs can be any domain (no restriction)
        if platform == "website":
            return True
        
        # Social media URLs must match allowed domains
        if platform in ["linkedin", "twitter", "instagram"]:
            return domain in ALLOWED_SOCIAL_DOMAINS or any(
                domain.endswith(f".{allowed}") for allowed in ALLOWED_SOCIAL_DOMAINS
            )
        
        return False
    except Exception:
        return False


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format (international format support).
    Examples: +90 555 123 4567, +1 555 123 4567, 0555 123 4567
    """
    if not phone:
        return True  # Optional field
    
    # Remove spaces, dashes, and parentheses
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Check if it starts with + (international) or 0 (local)
    if cleaned.startswith('+'):
        # International format: +country_code + number (min 10 digits total)
        digits = re.sub(r'\D', '', cleaned)
        return len(digits) >= 10 and len(digits) <= 15
    elif cleaned.startswith('0'):
        # Turkish local format: 0 + 10 digits
        digits = re.sub(r'\D', '', cleaned)
        return len(digits) == 11
    else:
        # No prefix: assume local format (10 digits)
        digits = re.sub(r'\D', '', cleaned)
        return len(digits) >= 10 and len(digits) <= 15
