"""empty message

Revision ID: 10992f54d4be
Revises: eda781be6e93
Create Date: 2020-03-10 18:23:04.703317

"""
from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision = '10992f54d4be'
down_revision = 'eda781be6e93'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('prediction_tiles', sa.Column('quadkey_geom', geoalchemy2.types.Geometry(geometry_type='POLYGON', srid=4326), autoincrement=False, nullable=True))
    # ### end Alembic commands ###


def downgrade():
    op.drop_column('prediction_tiles', 'quadkey_geom')
    # ### commands auto generated by Alembic - please adjust! ###
    # ### end Alembic commands ###