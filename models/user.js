'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const User = loader.database.define('users', {
  userId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  // テーブルという定義したデータを保存する領域の名前を固定
  freezeTableName: true,
  // createdAt という作成日時と updatedAt という更新日時を自動的に追加しない
  timestamps: false,
});

module.exports = User;
