"""IBAN validation utilities"""
import re


def validate_iban_checksum(iban: str) -> bool:
    """
    IBAN checksum validation using MOD-97-10 algorithm.
    
    Algorithm:
    1. Move first 4 characters to end
    2. Replace letters with numbers (A=10, B=11, ..., Z=35)
    3. Calculate mod 97
    4. Result should be 1 for valid IBAN
    """
    # Remove spaces and convert to uppercase
    iban_clean = iban.replace(" ", "").upper()
    
    # Basic format check
    if not re.match(r'^[A-Z]{2}[0-9]{2}[A-Z0-9]+$', iban_clean):
        return False
    
    # Move first 4 characters to end
    rearranged = iban_clean[4:] + iban_clean[:4]
    
    # Replace letters with numbers
    numeric = ""
    for char in rearranged:
        if char.isdigit():
            numeric += char
        else:
            # A=10, B=11, ..., Z=35
            numeric += str(ord(char) - ord('A') + 10)
    
    # Calculate mod 97
    remainder = int(numeric) % 97
    
    # Valid IBAN should have remainder = 1
    return remainder == 1


def format_iban(iban: str) -> str:
    """Format IBAN with spaces for display (TR: TR00 0000 0000 0000 0000 0000 00)"""
    iban_clean = iban.replace(" ", "").upper()
    
    if iban_clean.startswith("TR") and len(iban_clean) == 26:
        # TR IBAN: TR + 2 + 4 + 4 + 4 + 4 + 4 + 4 + 2
        return f"{iban_clean[:2]} {iban_clean[2:4]} {iban_clean[4:8]} {iban_clean[8:12]} {iban_clean[12:16]} {iban_clean[16:20]} {iban_clean[20:24]} {iban_clean[24:26]}"
    
    # Generic IBAN: group by 4 characters
    formatted = ""
    for i in range(0, len(iban_clean), 4):
        formatted += iban_clean[i:i+4] + " "
    return formatted.strip()
