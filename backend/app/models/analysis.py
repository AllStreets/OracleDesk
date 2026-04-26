import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy import String, Text, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("contracts.id"), nullable=False)
    fair_value_yes: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    fair_value_no: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    expected_value_yes: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4), nullable=True)
    expected_value_no: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 4), nullable=True)
    confidence: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    thesis_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    key_assumptions: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    risk_factors: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    data_sources: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)
    agent_costs_usd: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 4), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
