const { DataTypes, Sequelize } = require('sequelize');

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
	sequelize.define('redisInfos', {
		// The following specification of the 'id' attribute could be omitted
		// since it is the default.
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		md5: {
			type: DataTypes.STRING
		},
        host: {
			type: DataTypes.STRING
		},
        port: {
			type: DataTypes.INTEGER
		},
        password: {
			type: DataTypes.STRING
		},
        add_time: {
            defaultValue: Sequelize.NOW,
			type: DataTypes.NOW
		},
	});
};