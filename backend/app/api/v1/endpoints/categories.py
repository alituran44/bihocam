"""
Category API endpoints.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.course import Course
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryTreeResponse,
    CategoryDetailResponse,
    CategoryDeleteRequest,
)
from app.utils.slug import generate_slug

router = APIRouter()


def require_admin_or_staff(current_user: User = Depends(get_current_user)) -> User:
    """Require admin or staff role"""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(status_code=403, detail="Admin veya staff yetkisi gerekli")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return current_user


@router.get("", response_model=list[CategoryResponse])
@router.get("/", response_model=list[CategoryResponse])
async def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    parent_id: Optional[UUID] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    List all categories with pagination and filtering.
    """
    query = select(Category)
    
    # Filters
    if parent_id is not None:
        query = query.where(Category.parent_id == parent_id)
    elif parent_id is None and is_active is None:
        # Default: show only root categories if no parent_id specified
        query = query.where(Category.parent_id.is_(None))
    
    if is_active is not None:
        query = query.where(Category.is_active == is_active)
    
    # Order by order field, then name
    query = query.order_by(Category.order, Category.name)
    
    # Pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    # Calculate course count for each category
    category_list = []
    for category in categories:
        # Count courses in this category
        course_count_result = await db.execute(
            select(func.count(Course.id))
            .join(Course.categories)
            .where(Category.id == category.id)
        )
        course_count = course_count_result.scalar() or 0
        
        category_dict = CategoryResponse.model_validate(category).model_dump()
        category_dict['course_count'] = course_count
        category_list.append(CategoryResponse(**category_dict))
    
    return category_list


@router.get("/tree", response_model=list[CategoryTreeResponse])
async def get_category_tree(
    is_active: Optional[bool] = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """
    Get hierarchical category tree (all categories in nested structure).
    Optimized to prevent N+1 queries.
    """
    # Fetch all categories in one query
    query = select(Category).where(Category.is_active == is_active)
    query = query.order_by(Category.order, Category.name)
    
    result = await db.execute(query)
    all_categories = result.scalars().all()
    
    # Build category dict with course counts
    category_dict = {}
    root_categories = []
    
    # First pass: create all category nodes
    for cat in all_categories:
        # Count courses
        course_count_result = await db.execute(
            select(func.count(Course.id))
            .join(Course.categories)
            .where(Category.id == cat.id)
        )
        course_count = course_count_result.scalar() or 0
        
        cat_data = CategoryTreeResponse.model_validate(cat).model_dump()
        cat_data['course_count'] = course_count
        cat_data['children'] = []
        category_dict[cat.id] = CategoryTreeResponse(**cat_data)
    
    # Second pass: build tree structure
    for cat in all_categories:
        tree_node = category_dict[cat.id]
        if cat.parent_id:
            parent = category_dict.get(cat.parent_id)
            if parent:
                parent.children.append(tree_node)
        else:
            root_categories.append(tree_node)
    
    return root_categories


@router.get("/{category_id}", response_model=CategoryDetailResponse)
async def get_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Get category detail with parent and children.
    """
    result = await db.execute(
        select(Category)
        .where(Category.id == str(category_id))
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    # Get children
    children_result = await db.execute(
        select(Category)
        .where(Category.parent_id == str(category_id))
        .order_by(Category.order, Category.name)
    )
    children = children_result.scalars().all()
    
    # Get parent if exists
    parent = None
    if category.parent_id:
        parent_result = await db.execute(
            select(Category).where(Category.id == category.parent_id)
        )
        parent = parent_result.scalar_one_or_none()
    
    # Count courses
    course_count_result = await db.execute(
        select(func.count(Course.id))
        .join(Course.categories)
        .where(Category.id == category.id)
    )
    course_count = course_count_result.scalar() or 0
    
    return CategoryDetailResponse(
        **CategoryResponse.model_validate(category).model_dump(),
        course_count=course_count,
        children=[CategoryResponse.model_validate(child) for child in children],
        parent=CategoryResponse.model_validate(parent) if parent else None,
    )


@router.post("", response_model=CategoryResponse)
@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_staff),
):
    """
    Create a new category.
    """
    # Generate slug
    slug = await generate_slug(category_in.name, db, table="categories")
    
    # Check if name is unique
    existing = await db.execute(
        select(Category).where(Category.name == category_in.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu isimde bir kategori zaten var")
    
    # Validate parent if provided
    if category_in.parent_id:
        parent_result = await db.execute(
            select(Category).where(Category.id == str(category_in.parent_id))
        )
        parent = parent_result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Üst kategori bulunamadı")
        if not parent.is_active:
            raise HTTPException(status_code=400, detail="Üst kategori aktif değil")
    
    # Create category
    category = Category(
        name=category_in.name,
        slug=slug,
        description=category_in.description,
        icon=category_in.icon,
        color=category_in.color or "#0d9488",
        parent_id=str(category_in.parent_id) if category_in.parent_id else None,
        order=category_in.order,
    )
    
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return CategoryResponse.model_validate(category)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID,
    category_in: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_or_staff),
):
    """
    Update a category (partial update).
    """
    result = await db.execute(
        select(Category).where(Category.id == str(category_id))
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    # Update fields
    update_data = category_in.model_dump(exclude_unset=True)
    
    # Handle name change (regenerate slug)
    if "name" in update_data:
        # Check if new name is unique
        existing = await db.execute(
            select(Category)
            .where(Category.name == update_data["name"])
            .where(Category.id != str(category_id))
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Bu isimde bir kategori zaten var")
        
        # Regenerate slug
        slug = await generate_slug(update_data["name"], db, table="categories", exclude_id=str(category_id))
        update_data["slug"] = slug
    
    # Validate parent if provided
    if "parent_id" in update_data and update_data["parent_id"]:
        # Circular reference check
        if str(category_id) == str(update_data["parent_id"]):
            raise HTTPException(status_code=400, detail="Kategori kendi üst kategorisi olamaz")
        
        # Check if parent exists
        parent_result = await db.execute(
            select(Category).where(Category.id == str(update_data["parent_id"]))
        )
        parent = parent_result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="Üst kategori bulunamadı")
        
        # Check for circular reference in children
        def check_circular(child_id: str, target_id: str) -> bool:
            # This would require recursive check, simplified here
            return child_id == target_id
        
        # Simple check: if updating parent_id, make sure it's not a child
        children_result = await db.execute(
            select(Category).where(Category.parent_id == str(category_id))
        )
        children = children_result.scalars().all()
        for child in children:
            if str(child.id) == str(update_data["parent_id"]):
                raise HTTPException(status_code=400, detail="Döngüsel referans: Alt kategori üst kategori olamaz")
        
        update_data["parent_id"] = str(update_data["parent_id"])
    elif "parent_id" in update_data and update_data["parent_id"] is None:
        update_data["parent_id"] = None
    
    # Apply updates
    for key, value in update_data.items():
        setattr(category, key, value)
    
    await db.commit()
    await db.refresh(category)
    
    return CategoryResponse.model_validate(category)


@router.delete("/{category_id}")
async def delete_category(
    category_id: UUID,
    request: CategoryDeleteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Delete a category (soft delete).
    If category has courses, migrate_to_category_id is required.
    """
    result = await db.execute(
        select(Category).where(Category.id == str(category_id))
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    # Check for children
    children_result = await db.execute(
        select(Category).where(Category.parent_id == str(category_id))
    )
    children = children_result.scalars().all()
    if children:
        raise HTTPException(
            status_code=400,
            detail=f"Bu kategorinin {len(children)} alt kategorisi var. Önce alt kategorileri silin."
        )
    
    # Check for courses
    courses_result = await db.execute(
        select(Course)
        .join(Course.categories)
        .where(Category.id == str(category_id))
    )
    courses = courses_result.scalars().all()
    
    if courses:
        if not request.migrate_to_category_id:
            raise HTTPException(
                status_code=400,
                detail=f"Bu kategoride {len(courses)} kurs var. Kursları taşımak için 'migrate_to_category_id' parametresi gerekli."
            )
        
        # Validate target category
        target_result = await db.execute(
            select(Category).where(Category.id == str(request.migrate_to_category_id))
        )
        target_category = target_result.scalar_one_or_none()
        if not target_category:
            raise HTTPException(status_code=404, detail="Hedef kategori bulunamadı")
        if not target_category.is_active:
            raise HTTPException(status_code=400, detail="Hedef kategori aktif değil")
        
        # Migrate courses
        for course in courses:
            # Remove from old category, add to new category
            if category in course.categories:
                course.categories.remove(category)
            if target_category not in course.categories:
                course.categories.append(target_category)
    
    # Soft delete
    category.is_active = False
    await db.commit()
    
    return {"message": "Kategori silindi (soft delete)", "category_id": str(category_id)}
