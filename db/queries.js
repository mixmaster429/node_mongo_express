function aggregateData(model, group,options) {
    return new Promise((resolve, reject) => {
        try {
            let data;

            if(options !==undefined){
                data = model.aggregate(group).option(options);
            }
            else{
                data = model.aggregate(group);
            }

            return resolve(data);
        } catch (err) {
            return reject(err);
        }
    });
}

module.exports = {

    aggregateData
    
    
 
};