'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'image', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'slug'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('categories', 'image');
  }
};
