import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Numeric, BigInteger, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Contract(Base):
    __tablename__ = "contracts"
    __table_args__ = (UniqueConstraint("platform", "platform_contract_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform: Mapped[str] = mapped_column(String, nullable=False)
    platform_contract_id: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    current_yes_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    current_no_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    volume: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    expiry_date: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    last_fetched_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
