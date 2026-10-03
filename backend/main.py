from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
import models, schemas, database, auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_initial_admin(db: Session):
    admin = db.query(models.User).filter(models.User.email == "admin@kgstore.com").first()
    if not admin:
        hashed_pw = auth.get_password_hash("admin123")
        admin = models.User(name="Admin User", email="admin@kgstore.com", password_hash=hashed_pw, role="ADMIN")
        db.add(admin)
        db.commit()

@app.on_event("startup")
def on_startup():
    db = database.SessionLocal()
    try:
        create_initial_admin(db)
    finally:
        db.close()

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, password_hash=hashed_password, role="USER")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/products", response_model=List[schemas.ProductResponse])
def get_products(db: Session = Depends(database.get_db)):
    return db.query(models.Product).filter(models.Product.stock > 0).all()

@app.get("/api/admin/products", response_model=List[schemas.ProductResponse])
def admin_get_products(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    return db.query(models.Product).all()

@app.get("/api/products/{id}", response_model=schemas.ProductResponse)
def get_product(id: int, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/products", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/api/products/{id}", response_model=schemas.ProductResponse)
def update_product(id: int, product: schemas.ProductUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    db_product = db.query(models.Product).filter(models.Product.id == id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for var, value in vars(product).items():
        setattr(db_product, var, value) if value is not None else None
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/api/products/{id}")
def delete_product(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    db_product = db.query(models.Product).filter(models.Product.id == id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"ok": True}

@app.post("/api/orders", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    total_amount = 0
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product or product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {item.product_id}")
        total_amount += product.price * item.quantity
    
    db_order = models.Order(
        user_id=current_user.id,
        total_amount=total_amount,
        delivery_address=order.delivery_address,
        phone=order.phone,
        city=order.city,
        pincode=order.pincode
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        product.stock -= item.quantity
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            product_name=product.name,
            quantity=item.quantity,
            price=product.price
        )
        db.add(db_order_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/api/orders", response_model=List[schemas.OrderResponse])
def get_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.created_at.desc()).all()

@app.get("/api/orders/{id}", response_model=schemas.OrderResponse)
def get_order(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return order

@app.put("/api/orders/{id}/status", response_model=schemas.OrderResponse)
def update_order_status(id: int, status_update: schemas.OrderStatusUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order

@app.get("/api/admin/orders", response_model=List[schemas.OrderResponse])
def get_all_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

@app.get("/api/admin/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    return db.query(models.User).all()

@app.get("/api/admin/statistics", response_model=schemas.StatisticsResponse)
def get_statistics(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    total_products = db.query(func.count(models.Product.id)).scalar()
    total_users = db.query(func.count(models.User.id)).scalar()
    total_orders = db.query(func.count(models.Order.id)).scalar()
    total_revenue = db.query(func.sum(models.Order.total_amount)).scalar() or 0.0
    return {
        "total_products": total_products,
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": total_revenue
    }
