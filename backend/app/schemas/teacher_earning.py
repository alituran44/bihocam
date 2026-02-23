from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
from app.models.teacher_earning import EarningType


class TeacherEarningResponse(BaseModel):
    """Öğretmen kazanç hareketi response"""
    id: str
    teacher_id: str
    course_id: Optional[str] = None
    order_id: Optional[str] = None
    withdrawal_request_id: Optional[str] = None
    amount: Decimal
    currency: str
    gross_amount: Optional[Decimal] = None
    commission_rate: Optional[Decimal] = None
    commission_amount: Optional[Decimal] = None
    type: EarningType
    description: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TeacherEarningSummary(BaseModel):
    """Öğretmen kazanç özeti"""
    total_earnings: Decimal
    total_withdrawals: Decimal
    total_adjustments: Decimal
    available_balance: Decimal
    pending_withdrawals: Decimal
    currency: str = "TRY"


class TeacherSaleItem(BaseModel):
    order_id: str
    order_number: str
    created_at: datetime
    course_id: str
    course_title: str
    student_id: str
    student_name: str
    student_email: str
    gross_amount: Decimal
    commission_amount: Decimal
    net_earning: Decimal
    status: str


class TeacherSalesSummary(BaseModel):
    total_sales_count: int
    total_revenue: Decimal
    this_month_revenue: Decimal
    average_order_amount: Decimal
    currency: str = "TRY"


class BalanceAdjustmentCreate(BaseModel):
    """Admin tarafından bakiye düzeltmesi için schema"""
    amount: Decimal
    description: str
    currency: str = "TRY"

