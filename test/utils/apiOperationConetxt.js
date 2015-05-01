var context = {
    get: {

        installationState: function() {
            return {};
        },
        nameSpace: function() {
            return 'scoobie';
        },
        exports: function() {
            return {};
        },
        applicationKey: function() {
            return "asdfsadf";
        }

    },
    exec: {

        saveInstallationState: function() {

        }

    }
};

var callback = function(e) {
    if (e) {
        console.log(e);

    }


};


module.exports = {
    operation1: function() {
        return {
            context: context,
            callback: callback
        };
    }
};