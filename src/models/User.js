"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

    class User extends Model {
        static associate(models) {
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            full_name: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            username: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            mobile: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            is_deleted: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "0 -> not deleted, 1->deleted"
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            underscored: true,
            timestamps: false,
        }
    );

    return User;
};
