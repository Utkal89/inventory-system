from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime

# ── Product Schemas ───────────────────────────────────────
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int

    @validator("price")
    def price_positive(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @validator("quantity")
    def qty_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None

class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

# ── Customer Schemas ──────────────────────────────────────
class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

# ── Order Item Schemas ────────────────────────────────────
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @validator("quantity")
    def qty_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v

class OrderItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[Product] = None

    class Config:
        orm_mode = True
        from_attributes = True

# ── Order Schemas ─────────────────────────────────────────
class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]

class Order(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: datetime
    customer: Optional[Customer] = None
    items: List[OrderItem] = []

    class Config:
        orm_mode = True
        from_attributes = True
