"""
P1-03: Rate limiting middleware
slowapi tabanlı IP bazlı rate limiting.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# IP bazlı rate limiter — Redis varsa Redis backend, yoksa in-memory
limiter = Limiter(key_func=get_remote_address)
