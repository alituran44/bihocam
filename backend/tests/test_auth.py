"""
Authentication API tests
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_student(client: AsyncClient):
    """Test student registration"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newstudent@example.com",
            "password": "password123",
            "full_name": "New Student",
            "role": "student",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newstudent@example.com"
    assert data["full_name"] == "New Student"
    assert data["role"] == "student"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_teacher(client: AsyncClient):
    """Test teacher registration"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newteacher@example.com",
            "password": "password123",
            "full_name": "New Teacher",
            "role": "teacher",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newteacher@example.com"
    assert data["role"] == "teacher"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user):
    """Test registration with duplicate email"""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_user.email,
            "password": "password123",
            "full_name": "Duplicate User",
            "role": "student",
        },
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user):
    """Test successful login"""
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "testpassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user):
    """Test login with wrong password"""
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Test login with non-existent user"""
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "nonexistent@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers_student):
    """Test getting current user info"""
    response = await client.get("/api/v1/auth/me", headers=auth_headers_student)
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "full_name" in data
    assert "role" in data


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    """Test getting current user without auth"""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
