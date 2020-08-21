"""empty message

Revision ID: ff97cfa4b1c3
Revises: 1e7eb18a9fe8
Create Date: 2020-08-20 18:16:12.869539

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'ff97cfa4b1c3'
down_revision = '1e7eb18a9fe8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('ml_models', sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('ml_models', 'tags')
    # ### end Alembic commands ###
