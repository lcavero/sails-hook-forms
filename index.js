module.exports = function (sails) {
    const path = require('path');
    const includeAll = require('include-all');

    sails.forms = {};

    includeAll.optional({
        dirname: path.resolve('api/forms'),
        filter: /^([^.]+)\.(?:(?!md|txt).)+$/,
        flatten: true,
        keepDirectoryPath: true
    }, function(err, forms) {
        if(err){
            throw err;
        }

        for(let f in forms){
            forms[f].process = async (req, ...args) => {

                let body = forms[f].body(req, ...args);

                if(body.constructor.name == "Promise"){
                    body = await body;
                }

                let proccessed_obj = constructForm(req, body, {}, f);
                if(proccessed_obj){
                    return proccessed_obj[body.name];
                }else{
                    return null;
                }
            }
            sails.forms[f] = forms[f];
        }
    });

    return "";
};


function constructForm(req, field, obj, form, parent) {
    if(typeof field != "object" || !field.hasOwnProperty("name")){
        throw new Error("All fields should has a \"name\" key in " + form + " formulary");
    }

    if(!parent){
        parent = req.body;
    }

    if(parent[field.name]){
        if(field.type == "array" && field.hasOwnProperty('fields')){
            let new_arr = [];
            if(Array.isArray(parent[field.name])){
                for(let bf in parent[field.name]){
                    let new_obj = {};
                    for(let f in field.fields){
                        constructForm(req, field.fields[f], new_obj, form, parent[field.name][bf]);
                    }
                    if(Object.keys(new_obj).length > 0){
                        new_arr.push(new_obj);
                    }
                }
            }
            obj[field.name] = new_arr;
        }else if(field.type == "array"){
            obj[field.name] = parent[field.name];

        }else if(field.type == "object" && field.hasOwnProperty('fields')){
            let new_obj = {};
            for(let f in field.fields){
                constructForm(req, field.fields[f], new_obj, form, parent[field.name]);
            }

            if(Object.keys(new_obj).length > 0){
                obj[field.name] = new_obj;
            }
        }else{
            if(
                (typeof parent[field.name] == "string") ||
                (typeof parent[field.name] == "number") ||
                (typeof parent[field.name] == "boolean")
            ){
                obj[field.name] = parent[field.name];
            }
        }
        return obj;
    }
}