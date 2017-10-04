import {type_of, assert, is_primitive, is_primitive_type, is_simple_builtin_type} from './helper.js';

export var DEFAULT_NEW_OBJECT_PROP_PREFIX = "Name_me";

export class SchemaChecker {

    constructor(schema) {
        this.schema = schema;
    }



    check(json) {
        let toplevel = this.schema.toplevel;
        // anything defined in the JSON must conform to the schema
        for (let key in json) {
            if (toplevel[key] !== undefined) {
                this._check(json[key], toplevel[key]);
            }
        }
    }

    _check(json, required_type) {

        //console.log("checking: " + JSON.stringify(json) + ", required_type: " + JSON.stringify(required_type));

        let t = required_type['type'];

        if (is_simple_builtin_type(t)) {

            // require type to conform if it's one of object, array, string, number
            if (type_of(json) !== t) {
                throw Error("Expected type " + t + " from " + JSON.stringify(json) + ", got: " + type_of(json));
            }

            if ( t === "object" || t === 'array' ) {

                // any key/index with values conforming to 'subtype' key in required_type
                // flexible size
                if (required_type['props'] === undefined && required_type['subtype'] !== undefined) {

                    // check schema for required specs
                    if (required_type['min-size'] === undefined ||             required_type['max-size'] === undefined) {
                        throw Error("Flexible size schema type must define min- & max-size");
                    }

                    // check size bounds for flexibly objects and arrays
                    let size = Object.keys(json).length;
                    if (size < required_type['min-size'] ||
                         (required_type['max-size'] !== -1 && size > required_type['max-size'])) {
                        throw Error("Number of keys must be between " + required_type['min-size'] + ' and ' + required_type['max-size'] + ': ' + JSON.stringify(json));
                    }

                    let required_subtype = required_type['subtype'];

                    for (let key in json) {
                        let value = json[key];

                        // check type of json[key] to match a simple builtin type
                        // the schema actually shouldn't define 'object' or 'array' types here
                        if (is_simple_builtin_type(required_subtype)) {
                            if (type_of(value) !== required_subtype) {
                                throw Error("Required subtype does not match actual");
                            }
                            if (required_subtype === 'object' || required_subtype == 'array') {
                                throw Error('ERROR: found a subtype that is object or array. Please move this into a separate, new definition');
                            }
                        } else {
                            // assume uniform types for now ie. no string|number|array
                            // check the required user subtype is defined
                            if (!this._user_type_exists(required_subtype)) {
                                throw Error("User type " + required_subtype + " is not defined");
                            }
                            // recursive call
                            this._check(value, this.schema.types[required_subtype]);
                        }
                    }
                }
                // object with prescribed required keys
                // therefore has fixed size
                else if (required_type['props'] !== undefined) {
                    let required_props = required_type['props'];
                    for (let key in required_props) {

                        // array indices are numbers not strings though json keys are strings
                        if (t === 'array') {    
                            key = Number(key);
                        }

                        // missing key doesn't conform to spec
                        if (json[key] === undefined) {
                            throw Error("Missing key " + key + " in json " + JSON.stringify(json));
                        }
                        
                        // TODO
                        // Test that this works when the array/object 
                        // specified props are primitives?
                        
                        // recursive schema check
                        this._check(json[key], required_props[key]);
                    }
                } else {
                    throw Error("Incorrect schema - need either 'props' or 'subtype' to be defined in schema for object types " + JSON.stringify(required_type));
                }
            } else if (t === "number") { /* number builtin type */

                if (required_type['min'] !== undefined && json < required_type['min']) {
                    throw Error("Number is too small");
                }

                if (required_type['max'] !== undefined && json > required_type['max']) {
                    throw Error("Number is too large");
                }

                // if we get here, all OK!

            } else if (t === "string") { /* string builtin type */
                // only require the original type check passes :)
            } else if (t === 'boolean') {
                // only require the original type check passes :)
            } else {
                throw Error(" ????? how'd we get here...");
            }
        } else {    /* use user defined types */
            if (!this._user_type_exists(t)) {
                throw Error("User type " + t + " is not defined");
            }
            
            this._check(json, this.schema.types[t]);
        }
    }




    /* TODO this would be better if it stripped out all original data
     and only returned the bare structure with _deletable tags and booleans */

    // takes a JSON conforming to the schema
    // then generates a skeleton of the same keys/values etc
    // but all primitives are replaced with booleans for deletable/not deletable
    // and objects/arrays gain an additional property _deletable
    // making full use of JS arrays being objects!
    generateMetaJson(json_original) {
        debugger
        let toplevel = this.schema.toplevel;
        // clone JSON
        let json = JSON.parse(JSON.stringify(json_original));

        for (let key in json) {
            // key not in schema is definitely not required!
            // can be deleted
            if (toplevel[key] === undefined) {
                if (is_primitive_type(toplevel[key].type)) {
                    json[key] = true;
                } else {
                    json[key]['_deletable'] = true;
                    this._mark_all_children_deletable(json[key]);
                }
            } else {    // in schema
                if (is_primitive_type(toplevel[key].type)) {
                    // rare, unlikely case
                    // assume toplevel keys that are defined in schema are required...
                    json[key] = false;  
                } else {
                    json[key]['_deletable'] = false; // toplevels never deleteable
                    this._generateMeta(json[key], toplevel[key]);
                }
            }
        }
        return json;
    }


    // generate metadata for object/array subtypes
    // primitives have already been handled!
    _generateMeta(json, schema_type) {

        //console.log("Generating meta for: " + JSON.stringify(json) + ", " + JSON.stringify(schema_type));

        // values conforming to 'subtype' key in required_type
        // flexible size
        // each of these elements are individually NOT required!
        if (schema_type['props'] === undefined && schema_type['subtype'] !== undefined) {

            for (let key in json) {
                if (key === '_deletable') { // skip this special key
                    continue;
                }
                if (is_primitive(json[key])) {    // primitive subtype
                    json[key] = true;   // NOT required
                } else {    // compound subtype
                    json[key]['_deletable'] = true; // NOT required

                    if (is_simple_builtin_type(schema_type['subtype'])) {
                        json[key] = false;
                    } else {
                        this._generateMeta(json[key], this.schema.types[schema_type['subtype']]);
                    }

                    
                }
            }
        }
        // object with prescribed required keys
        // therefore has fixed size
        // and we require each prop to exist and not be deleted!
        else if (schema_type['props'] !== undefined) {
            let required_props = schema_type['props'];

            for (let key in json) {
                if (key === '_deletable') { // skip special key
                    continue;
                }
                if (required_props[key] === undefined) {
                    // these are all keys in the JSON not defined in the schema, therefore NOT required
                    if (is_primitive_type(toplevel[key].type)) {
                        json[key] = true;
                    } else {
                        json[key]['_deletable'] = true;
                        this._mark_all_children_deletable(json[key]);
                    }
                }
            }

            for (let key in required_props) {

                // array indices are numbers not strings though json keys are strings
                if (schema_type['type'] === 'array') {    
                    key = Number(key);
                }

                if (is_primitive(json[key])) {
                    json[key] = false;  // REQUIRED!
                } else {      
                    json[key]['_deletable'] = false; // REQUIRED!
                    // recurse on compound types
                    this._generateMeta(json[key], required_props[key]);
                }
            }
        } else  {   // both 'props' and 'subtype' undefined implies it's just got 'type' and we need to recurse on this user type...
            assert(!is_simple_builtin_type(schema_type['type']));
            this._generateMeta(json, this.schema.types[schema_type['type']]);
        }
    }

    _mark_all_children_deletable(json) {
        for (let key in json) {
            if (key === '_deletable') { // skip special keys
                continue;
            }
            if (is_primitive(json[key])) {
                json[key] = true;
            } else {
                json[key]['_deletable'] = true;
                this._mark_all_children_deletable(json[key]);   //recurse
            }
        }
    }




    /*

        Generate a skeleton of json data based on the schema
        given a JSON path

        NB for now, we only allow extending lists and arrays with 'subtype'
        this makes this process a lot easier right here


        returns json AND meta for rendering...

    */

    get_required_data_structure(json_path) {
        
        let schema = this._get_schema_for_json_path(json_path);

        // schema now points to the place we want to retrieve a data structure from

        // let json = this._get_instance_of_schema(schema);
        // let meta = JSON.parse(JSON.stringify(json));
        // this._generateMeta(meta, schema);   // transforms the copy into metadata
        // return {json: json, meta: meta}

        return this._get_instance_of_schema(schema);

        // if (is_primitive_type(schema.subtype)) {
        //     return _get_instance_of_primitive_subtype(schema);
        // } else {
        //     return _get_instance_of_schema(this.schema.types[schema]);
        // }
    }

    
    _get_instance_of_primitive_type(schema) {
        assert(is_primitive_type(schema.type), "Schema type is not primitive");
        return this._get_instance_of_primitive(schema, schema.type);
    }

    _get_instance_of_primitive_subtype(schema) {
        assert(is_primitive_type(schema.subtype), "Schema subtype is not primitive");
        return this._get_instance_of_primitive(schema, schema.subtype);
    }
    
    _get_instance_of_primitive(schema, type_to_use) {
        if (type_to_use === "string") {
            return "";
        } else if (type_to_use === "boolean") {
            return false;
        } else if (type_to_use === "number") {
            // define it on lower boundary if defined
            if (schema.default !== undefined) {
                return schema.default;
            }
            if (schema.min !== undefined) {
                return schema.min;
            }
            // else on upper boundary if defined
            if (schema.max !== undefined) {
                return schema.max;
            } 
            // else 0
            return 0;
        } else {
            throw Error("What kind of primitive is not string, boolean or numebr??");
        }
    }

    // first time this is called it so for sure an object/array with non-primitive, user-defined subtype which gets passed in here
    _get_instance_of_schema(schema_type) {

        

        // primitive type aliased as user defined type (eg num_0_255)
        if (is_primitive_type(schema_type.type)) {
            return this._get_instance_of_primitive_type(schema_type)
        }


        // create correct type of structure
        let result;
        if (schema_type.type === 'array') {
            result = [];
        } else {
            result = {};
        }

        // recurse on user defined type immediately as it's definition is elsewhere
        if (this._user_type_exists(schema_type['type'])) {
            return this._get_instance_of_schema(this.schema.types[schema_type.type]);
        }


        // open size with prescribed subtypes
        if (schema_type['props'] === undefined && schema_type['subtype'] !== undefined) {

            // flexible size, create with minimum number of components else 0
            let required_size = 1;  // TODO this really should check for min/max-size!

            let required_subtype = schema_type['subtype'];

            for (let i = 0; i < required_size; i++) {
                let key = DEFAULT_NEW_OBJECT_PROP_PREFIX + "_" + (i+1);
                if (schema_type.type === 'array') { // integer keys of arrays
                    key = i;
                }

                if (is_primitive_type(required_subtype)) {
                    result[key] = this._get_instance_of_primitive_subtype(schema_type);
                } else {
                    assert(this._user_type_exists(required_subtype), "Malformed schema - object or array subtypes must be removed to new types!")

                    // required_subtype must be a user-defined type at this point
                    result[key] = this._get_instance_of_schema(this.schema.types[required_subtype]);
                }
            }
        } else if (schema_type['props'] !== undefined) {
            let required_props = schema_type['props'];
            for (let key in required_props) {
                if (key === '_deletable') {
                    continue;   // skip special deletable key
                }

                let returned = this._get_instance_of_schema(required_props[key]);

                // array indices are numbers not strings though json keys are strings
                if (schema_type.type === 'array') {
                    key = Number(key);
                }

                result[key] = returned;
            }
        } else {
            // this shouldn't be happening as we assume we only generate from well formed schemas
            throw Error("Incorrect schema - need either 'props' or 'subtype' to be defined in schema for object types " + JSON.stringify(schema_type));
        }

        return result;
    }


    /*
        Validator code
    */

    validate_value(json_path, value) {
        let schema_type = this._get_schema_for_json_path(json_path);
        if (is_primitive_type(schema_type)) {   // string, boolean or number
            if (type_of(value) !== schema_type) {
                return "Type mismatch, require " + schema_type;
            }
        } else {
            try {
                this._check(value, schema_type); //TODO test this works as expected 
            } catch (err) {
                return err.message;
            }
        }
    }


    _get_schema_for_json_path(json_path) {
        let schema = this.schema.toplevel[json_path[0]];
        let i = 1;
        // traverse down the tree to the point we need
        // these are all going to be compond types so need to check for primitives
        while (i < json_path.length) {
            if (schema.props === undefined && schema.subtype !== undefined) {

                // this must be a user-defined type for the schema to be well formed
                // or a primitive! (eg. array of strings)
                let subtype = schema.subtype;
                if (is_primitive_type(subtype)) {
                    return subtype;
                } else {
                    schema = this.schema.types[schema.subtype];
                }
            } else if (schema.props !== undefined) {
                schema = schema.props[json_path[i]];
            } else {
                if (this._user_type_exists(schema.type)) {
                    schema = this.schema.types[schema.type];
                    continue; //descend one level without incrementing
                }
            }
            i++;
        }
        return schema;
    }

    _user_type_exists(type) {
        return this.schema.types[type] !== undefined;
    }

}

