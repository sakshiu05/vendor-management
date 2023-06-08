

/*
* --------------------------------------------------------------------------
* Database connection
* ---------------------------------------------------------------------------
*/
let config = require('../../config');

module.exports = function (app, mongoose) {

    var connect = function () {
        var options = {
            server: {
                socketOptions: { keepAlive: 1 }
            },
            auto_reconnect:true
        };
        mongoose.set('useCreateIndex', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useUnifiedTopology', true);
        mongoose.connect(config.MONGO_URI, { useNewUrlParser: true });
    };
    connect();

    // Error handler
    mongoose.connection.on('error', function (err) {
        console.error('MongoDB Connection Error. Please make sure MongoDB is running. -> ' + err);
    });

    // Reconnect when closed
    mongoose.connection.on('disconnected', function () {
        connect();
    });

};