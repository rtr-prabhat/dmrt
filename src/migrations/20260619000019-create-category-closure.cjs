'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('category_closure', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ancestor_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      descendant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      depth: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    });

    // Composite unique index to prevent duplicate ancestor-descendant pairs
    await queryInterface.addIndex('category_closure', ['ancestor_id', 'descendant_id'], {
      name: 'uq_category_closure_pair',
      unique: true
    });

    // Index for fast descendant lookups (breadcrumbs)
    await queryInterface.addIndex('category_closure', ['descendant_id'], {
      name: 'idx_category_closure_descendant'
    });

    // Index for fast ancestor lookups (sub-tree queries)
    await queryInterface.addIndex('category_closure', ['ancestor_id'], {
      name: 'idx_category_closure_ancestor'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('category_closure');
  }
};
