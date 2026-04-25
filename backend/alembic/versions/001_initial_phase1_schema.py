"""initial_phase1_schema

Revision ID: 001
Revises:
Create Date: 2026-04-25
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('plan', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.Text(), nullable=False),
        sa.Column('stripe_customer_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_table(
        'contracts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('platform', sa.String(), nullable=False),
        sa.Column('platform_contract_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('current_yes_price', sa.Numeric(5, 4), nullable=True),
        sa.Column('current_no_price', sa.Numeric(5, 4), nullable=True),
        sa.Column('volume', sa.BigInteger(), nullable=True),
        sa.Column('expiry_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_fetched_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('platform', 'platform_contract_id'),
    )
    op.create_table(
        'analyses',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contract_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('fair_value_yes', sa.Numeric(5, 4), nullable=True),
        sa.Column('fair_value_no', sa.Numeric(5, 4), nullable=True),
        sa.Column('expected_value_yes', sa.Numeric(6, 4), nullable=True),
        sa.Column('expected_value_no', sa.Numeric(6, 4), nullable=True),
        sa.Column('confidence', sa.String(), nullable=True),
        sa.Column('thesis_markdown', sa.Text(), nullable=False),
        sa.Column('key_assumptions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('risk_factors', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('data_sources', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('agent_costs_usd', sa.Numeric(8, 4), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['contract_id'], ['contracts.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'watchlists',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contract_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('alert_threshold', sa.Numeric(5, 4), nullable=True),
        sa.ForeignKeyConstraint(['contract_id'], ['contracts.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'contract_id'),
    )
    op.create_table(
        'price_history',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('contract_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('yes_price', sa.Numeric(5, 4), nullable=True),
        sa.Column('no_price', sa.Numeric(5, 4), nullable=True),
        sa.Column('volume', sa.BigInteger(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['contract_id'], ['contracts.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'api_cost_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('analysis_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('model', sa.String(), nullable=False),
        sa.Column('input_tokens', sa.Integer(), nullable=False),
        sa.Column('output_tokens', sa.Integer(), nullable=False),
        sa.Column('cost_usd', sa.Numeric(8, 6), nullable=False),
        sa.Column('agent_name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['analysis_id'], ['analyses.id']),
        sa.PrimaryKeyConstraint('id'),
    )

def downgrade():
    op.drop_table('api_cost_logs')
    op.drop_table('price_history')
    op.drop_table('watchlists')
    op.drop_table('analyses')
    op.drop_table('contracts')
    op.drop_table('users')
