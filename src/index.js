module.exports = {
    installers:{
    	cms:function(){
    		return require('./installers/cms');
    	},
    	extensions:function(){
    		return require('./installers/extensions');
    	}
    }
};

