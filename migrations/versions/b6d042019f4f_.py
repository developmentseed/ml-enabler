"""empty message

Revision ID: b6d042019f4f
Revises: 546869fd8dca
Create Date: 2020-10-07 10:22:27.284357

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b6d042019f4f'
down_revision = '546869fd8dca'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.rename_table('ml_models', 'projects')

    op.drop_constraint('fk_models', 'imagery', type_='foreignkey')
    op.create_foreign_key('fk_projects', 'imagery', 'projects', ['model_id'], ['id'])
    op.drop_constraint('fk_models', 'integration', type_='foreignkey')
    op.create_foreign_key('fk_projects', 'integration', 'projects', ['model_id'], ['id'])
    op.drop_index('idx_model_aoi_bounds', table_name='model_aoi')
    op.drop_constraint('fk_models', 'model_aoi', type_='foreignkey')
    op.create_foreign_key('fk_projects', 'model_aoi', 'projects', ['model_id'], ['id'])
    op.drop_constraint('fk_models', 'predictions', type_='foreignkey')
    op.create_foreign_key('fk_models', 'predictions', 'projects', ['model_id'], ['id'])
    op.drop_constraint('fk_models', 'projects_access', type_='foreignkey')
    op.create_foreign_key('fk_projects', 'projects_access', 'projects', ['model_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.rename_table('projects', 'ml_enabler')

    op.drop_constraint('fk_projects', 'projects_access', type_='foreignkey')
    op.create_foreign_key('fk_models', 'projects_access', 'ml_models', ['model_id'], ['id'])
    op.drop_constraint('fk_models', 'predictions', type_='foreignkey')
    op.create_foreign_key('fk_models', 'predictions', 'ml_models', ['model_id'], ['id'])
    op.create_unique_constraint('predictions_unique_semver', 'predictions', ['model_id', 'version'])
    op.drop_constraint('fk_projects', 'model_aoi', type_='foreignkey')
    op.create_foreign_key('fk_models', 'model_aoi', 'ml_models', ['model_id'], ['id'])
    op.create_index('idx_model_aoi_bounds', 'model_aoi', ['bounds'], unique=False)
    op.drop_constraint('fk_projects', 'integration', type_='foreignkey')
    op.create_foreign_key('fk_models', 'integration', 'ml_models', ['model_id'], ['id'])
    op.drop_constraint('fk_projects', 'imagery', type_='foreignkey')
    op.create_foreign_key('fk_models', 'imagery', 'ml_models', ['model_id'], ['id'])
    # ### end Alembic commands ###
