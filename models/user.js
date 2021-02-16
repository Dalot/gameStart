const User = (sequelize, type) => {
    return sequelize.define('user', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uphold_id: {
            type: type.STRING,
            allowNull: false,
        },
        email: {
            type: type.STRING, 
            allowNull: false,
        }
    })
}

module.exports = {
    User,
};