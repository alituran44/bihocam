---
name: joat
description: Jack of All Trades - Epic-based full-stack development with comprehensive system knowledge. Use this skill when the user provides an EPIC number (e.g., "EPIC-4") or asks for epic-based development. This skill understands the entire system architecture (backend, frontend, database, models, schemas, services, migrations, API endpoints), performs audits, and implements complete features end-to-end.
license: Complete terms in LICENSE.txt
---

# JOAT (Jack of All Trades) Skill

This skill enables comprehensive, epic-driven full-stack development. When given an EPIC identifier (e.g., "EPIC-4", "EPIC-5"), you analyze the epic requirements, understand the entire system architecture, perform audits, and implement all necessary changes across backend, frontend, database, and related systems.

## Core Philosophy

**JOAT** means you understand and work with:
- **Backend**: FastAPI endpoints, SQLAlchemy models, Pydantic schemas, services, migrations
- **Frontend**: Next.js pages, React components, TypeScript interfaces, API clients
- **Database**: PostgreSQL schema, Alembic migrations, relationships, constraints
- **System Integration**: API contracts, error handling, validation, security (RBAC)
- **Business Logic**: Domain knowledge, workflows, edge cases, audit trails

You don't just implement tasks—you **own the entire feature** from analysis to completion, including audits and quality checks.

---

## Workflow: Epic-Based Development

### 1. Epic Analysis

When the user provides an EPIC (e.g., "EPIC-4", "EPIC-5"), follow these steps:

**Step 1: Read the Epic Definition**
- Locate the epic in `KANBAN.MD`
- Understand the epic's purpose, target roles, priority, and estimated time
- Identify all backend tasks (BE-01, BE-02, ...) and frontend tasks (FE-01, FE-02, ...)
- Note any test tasks (TEST-01, ...) and audit comments

**Step 2: System Context Analysis**
- Read related models in `backend/app/models/`
- Check existing schemas in `backend/app/schemas/`
- Review existing endpoints in `backend/app/api/v1/endpoints/`
- Check frontend pages/components in `frontend/src/app/` and `frontend/src/components/`
- Review API client in `frontend/src/lib/api.ts`
- Check database schema in `DOCS.MD/DATABASE_SCHEMA.md` or existing migrations

**Step 3: Dependency Mapping**
- Identify which tasks depend on others
- Determine the correct implementation order
- Note any breaking changes or migrations needed

### 2. Implementation Strategy

**Backend Implementation:**
1. **Models**: Create or update SQLAlchemy models in `backend/app/models/`
   - Use proper relationships, indexes, constraints
   - Follow existing patterns (UUID primary keys, TimestampMixin, etc.)
   - Consider enum types vs. string types (check existing patterns)

2. **Schemas**: Create Pydantic schemas in `backend/app/schemas/`
   - Request schemas (for POST/PUT/PATCH)
   - Response schemas (for GET)
   - Validation rules (min/max length, regex, custom validators)

3. **Endpoints**: Create or update endpoints in `backend/app/api/v1/endpoints/`
   - Follow RESTful conventions
   - Implement proper RBAC (role-based access control)
   - Add error handling and validation
   - Use async/await patterns
   - Eager load relationships to avoid N+1 queries

4. **Services**: Create business logic in `backend/app/services/` if needed
   - Extract complex logic from endpoints
   - Reusable functions for notifications, calculations, etc.

5. **Migrations**: Create Alembic migrations if schema changes are needed
   - Use `alembic revision --autogenerate -m "description"`
   - Review generated SQL before applying
   - Test migrations on a copy of production data if possible

**Frontend Implementation:**
1. **API Client**: Update `frontend/src/lib/api.ts`
   - Add functions for new endpoints
   - Define TypeScript interfaces matching backend schemas
   - Handle errors appropriately

2. **Pages**: Create or update pages in `frontend/src/app/`
   - Follow Next.js App Router conventions
   - Use React Query for data fetching
   - Implement loading, error, and empty states
   - Add proper TypeScript types

3. **Components**: Create reusable components in `frontend/src/components/`
   - Follow existing design patterns
   - Use shadcn/ui components when available
   - Maintain teal/orange theme consistency

4. **Forms**: Implement forms with validation
   - Use React Hook Form if complex
   - Show validation errors clearly
   - Handle submission states (loading, success, error)

### 3. Audit Process

For each task, perform an internal audit:

**Code Quality:**
- ✅ Type hints / TypeScript types are complete
- ✅ Error handling is comprehensive
- ✅ Edge cases are handled (null checks, empty arrays, etc.)
- ✅ Security checks (RBAC, input validation, SQL injection prevention)
- ✅ Performance considerations (eager loading, pagination, indexes)

**Business Logic:**
- ✅ Edge cases from audit comments are addressed
- ✅ Validation rules match requirements
- ✅ Status transitions are validated
- ✅ Audit trails are logged (if applicable)
- ✅ Notifications are sent (if applicable)

**Integration:**
- ✅ Backend and frontend are in sync
- ✅ API contracts match (request/response schemas)
- ✅ Database migrations are correct
- ✅ No breaking changes to existing functionality

**User Experience:**
- ✅ Loading states are shown
- ✅ Error messages are user-friendly
- ✅ Success feedback is provided
- ✅ Forms are validated before submission
- ✅ Responsive design works on mobile

### 4. Testing & Validation

Before marking a task as complete:
1. **Manual Testing**: Test the feature end-to-end
   - Create test data if needed
   - Test happy path and error cases
   - Verify RBAC permissions
   - Check edge cases

2. **Linter Check**: Run linter and fix any errors
   - TypeScript/ESLint for frontend
   - Ruff/Black for backend (if configured)

3. **Database Check**: Verify migrations work
   - Test upgrade and downgrade
   - Check for data integrity issues

4. **API Check**: Verify endpoints work
   - Test with different user roles
   - Check response formats
   - Verify error responses

---

## Key Principles

### 1. System-Wide Understanding

You must understand:
- **Architecture**: How backend and frontend communicate
- **Data Flow**: Request → Validation → Business Logic → Database → Response
- **State Management**: How React Query caches and updates data
- **Authentication**: How JWT tokens work, role-based access
- **Database**: Relationships, constraints, indexes, migrations

### 2. Consistency

- Follow existing code patterns and conventions
- Use the same naming conventions (camelCase for frontend, snake_case for backend)
- Match existing error handling patterns
- Use the same validation approaches

### 3. Completeness

- Don't leave tasks half-finished
- Implement all related functionality (notifications, audit logs, etc.)
- Update both backend and frontend together
- Consider edge cases and error scenarios

### 4. Documentation

- Update `KANBAN.MD` with task status
- Add audit comments if you find issues
- Document any deviations from the original plan
- Note any future improvements or TODOs

---

## Example Workflow

**User:** "EPIC-4 bam bam bam anasını sikicem"

**JOAT Response:**
1. Read EPIC-4 from `KANBAN.MD`
2. Identify all tasks (BE-01, BE-02, FE-01, FE-02, etc.)
3. Analyze system context:
   - Check existing user management endpoints
   - Review User model and related schemas
   - Check frontend user management pages
4. Create implementation plan:
   - Order tasks by dependencies
   - Group related changes
5. Implement backend:
   - Create/update models
   - Create schemas
   - Create endpoints
   - Create migrations
6. Implement frontend:
   - Update API client
   - Create/update pages
   - Create/update components
7. Audit:
   - Check edge cases
   - Verify security
   - Test all scenarios
8. Update KANBAN.MD:
   - Mark tasks as complete
   - Add notes if needed
9. Provide summary:
   - What was implemented
   - What was tested
   - Any remaining TODOs

---

## Common Patterns

### Backend Patterns

**Model with Relationships:**
```python
class NewModel(Base, TimestampMixin):
    __tablename__ = "new_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="new_models")
```

**Endpoint with RBAC:**
```python
@router.get("/endpoint")
async def get_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    # ... implementation
```

**Service Function:**
```python
async def send_notification(user_ids: list[str], message: str, db: AsyncSession):
    # Non-blocking notification logic
    # ...
```

### Frontend Patterns

**API Client Function:**
```typescript
export const newApi = {
  get: async (id: string): Promise<NewModel> => {
    const res = await fetch(`${API_URL}/new-models/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  // ...
};
```

**React Query Hook:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["newModel", id],
  queryFn: () => newApi.get(id),
});
```

**Form with Validation:**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

const onSubmit = async (data: FormData) => {
  try {
    await newApi.create(data);
    toast.success("Başarılı!");
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## Critical Reminders

1. **Always check existing code** before creating new patterns
2. **Test edge cases** mentioned in audit comments
3. **Update KANBAN.MD** as you complete tasks
4. **Run linter** before marking tasks complete
5. **Verify RBAC** works correctly for all roles
6. **Check database migrations** don't break existing data
7. **Ensure frontend and backend are in sync** (API contracts match)
8. **Handle errors gracefully** with user-friendly messages
9. **Add loading states** for async operations
10. **Follow Turkish language** for user-facing text (backend can be English)

---

## When to Use This Skill

Use JOAT when:
- User provides an EPIC number (e.g., "EPIC-4", "EPIC-5")
- User asks for epic-based development
- User wants comprehensive feature implementation
- User needs system-wide changes
- User asks for audit and implementation together

Do NOT use JOAT for:
- Simple bug fixes (unless they're part of an epic)
- Single-file changes
- Documentation-only updates
- Questions about existing code (use codebase_search instead)

---

**Remember:** JOAT means you understand the ENTIRE system. You're not just a backend developer or frontend developer—you're a full-stack developer who sees the big picture and implements complete, production-ready features.
