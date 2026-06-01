from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int

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
    model_config = {"from_attributes": True}

class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[Product] = None
    model_config = {"from_attributes": True}

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
    model_config = {"from_attributes": True}