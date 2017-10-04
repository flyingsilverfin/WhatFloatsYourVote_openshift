import React from 'react';
import ReactDOM from 'react-dom';

import Editor from "../components/admin/Editor.jsx";
import Header from "../components/Header.jsx";
import {SchemaChecker, DEFAULT_NEW_OBJECT_PROP_PREFIX} from "../SchemaChecker.js";

import {httpGet, httpPost, type_of, assert, isArray} from '../helper.js';


class AdminPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: null,
            schema: null,
            meta: null,
            status: "Loading",
            modified: false
        }
    }

    componentDidMount() {
        this.getStaged();
        this.getSchema();
    }

    delayedSetState(delay, v, val) {
        let newState = {}
        newState[v] = val;
        setTimeout(function() {
            this.setState(newState)
        }.bind(this), delay);
    }

    getStaged() {
        this.setState({
            status: "Loading"
        })
        httpGet('/auth/staged/data', (raw) => {
            let json = JSON.parse(raw);
            if ( json.status !== 'success') {
                console.error('Error retrieving staged data');
                return;
            }
            this.dataLoaded(json.data, json.modified);
        });
    }

    getSchema() {
        this.setState({
            status: "Loading"
        });
        httpGet('/data_admin/schema.json', (raw) => this.schemaLoaded(raw));
    }


    revertData() {
        console.log("BBBB");
        this.setState({
            status: "Reverting",
        });
        httpPost('/auth/staged/delete', {},  () => {
            this.setState({
                status: "Reverted to live.",
                modified: false
            });
            this.getStaged();
            if (this.state.schema === null) {
                this.getSchema();
            }
        });
    }

    publishData() {
        httpPost('/auth/staged/publish', {}, () => {
            this.setState({
                status: "Published.",
                modified: false
            });
            this.props.reloadLiveData();
            // TODO make this a shared timer
            this.delayedSetState(1500, "status", "Ready");
        });
    }

    dataLoaded(data, modified) {
        if (this.state.schema != null) {
            this.setState({
                data: data,
                modified: modified,
                status: "Ready"
            });

            this.checkDataWithSchema();

        } else {
            this.setState({
                data: data,
                modified: modified
            });
        }
    }

    schemaLoaded(raw) {
        let schema = JSON.parse(raw);
        this.schemaChecker = new SchemaChecker(schema);

        if (this.state.data != null) {
            this.setState({
                schema: schema,
                status: "Ready"
            });

            this.checkDataWithSchema();


        } else {
            this.setState({
                schema:schema
            })
        }
    }

    checkDataWithSchema() {
        try {
            this.schemaChecker.check(this.state.data);
            console.log("data.json passed schema check");
        } catch (err) {
            console.error("data.json failed schema check.");
            console.error(err.toString());
            throw err;  // maybe skip this?
        }

        this.regenerate_meta();
    }

    regenerate_meta() {
        let meta = this.schemaChecker.generateMetaJson(this.state.data);
        this.setState({meta: meta});
    }
    

    onAdd(json_path, key) {

        this.setState({
            status: "Saving"
        })

        let new_structure = this.schemaChecker.get_required_data_structure(json_path);
        let ptr = this.state.data;
        for (let elem of json_path) {
            ptr = ptr[elem];
        }

        // record for sending to server
        let modified = {};

        // key is null if new_structure is an object ie. we are not extending an array
        if (key === null) {
            assert(type_of(new_structure) === 'object', "New Structure being added is not object (array) and key is null, ??");


            let start_new_prop_name_index = 0;
            for (let existing_key in ptr) {
                if (existing_key.startsWith(DEFAULT_NEW_OBJECT_PROP_PREFIX)) {
                    let tmp = existing_key.split('_');
                    if (start_new_prop_name_index < Number(tmp[tmp.length-1])){
                        start_new_prop_name_index = Number(tmp[tmp.length-1]);
                    }
                }
            }
            start_new_prop_name_index++;

            for (let default_name in new_structure) {
                let default_name_split = default_name.split("_");
                default_name_split[default_name_split.length-1] = start_new_prop_name_index + "";
                let new_prop_name = default_name_split.join("_");
                ptr[new_prop_name] = new_structure[default_name];

                // record to send to server
                modified[new_prop_name] = new_structure[default_name];
            }
        } else {
            assert(type_of(new_structure) === 'array', "new structure being added is not an array and key is not null, ??")
            ptr[key] = new_structure[0];

            //record to send to server
            modified[key] = new_structure[0];
        }

        

        httpPost('/auth/staged/modify/add', {
            json_path: json_path,
            value: modified
        }, () => {
            this.setState({
                status: "Saved",
                modified: true
            })
        })

        this.regenerate_meta();
    }



    onEdit(json_path, get_value_fn, set_value_fn) {

        // retrieve correct place to update JSON
        let ptr = this.state.data;
        for (let elem of json_path.slice(0,json_path.length-1)) {
            ptr = ptr[elem];
        }

        let old_value = ptr[json_path[json_path.length-1]];
        let value;
        try {
            value = get_value_fn(); // attempts to retrieve correctly typed value eg a number

            if (Number.isNaN(new_value)) { // special case for number entries failing
                throw Error("Number required");
            }
        } catch (err) {
            console.error(err);
            //TODO some sort of error handling to notify user
            
            // hack to set the editabletext back to an old valid value
            if (set_value_fn) {
                set_value_fn(old_value);
            }
        }

        // skip if unchanged
        if (value === old_value) {
            return;
        }
    
        let new_value;

        debugger
        // trim off whitespace
        // yucky code. did this late night
        if (type_of(value) === "string") {
            new_value = value.trim();
            console.log(new_value);
            if (new_value !== value) {
                set_value_fn(new_value);
            }
        } else {
            new_value = value
        }


        let valid = this.validate_edit(json_path, new_value);

        if (valid !== undefined) {
            // TODO error notification


            // hack to set the editabletext back
            if (set_value_fn) {
                set_value_fn(old_value);
            }

        } else {
            this.setState({
                status: "Saving"
            });
            
            ptr[json_path[json_path.length-1]] = new_value;


            httpPost('/auth/staged/modify/edit', {json_path: json_path, value: new_value}, () => {
                this.setState({
                    status: "Saved",
                    modified: true
                })
            });
        }
        
    }

    onDelete(json_path) {

        this.setState({
            status: "Saving"
        });

        let ptr = this.state.data;
        for (let elem of json_path.slice(0,json_path.length-1)) {
            ptr = ptr[elem];
        }
        if (isArray(ptr)) {
            // cut out array and reindex array, saves much pain elsewhere in exchange for inefficiency
            ptr.splice(json_path[json_path.length-1], 1);   
        } else {
            // deleting works fine in objects
            debugger
            delete ptr[json_path[json_path.length-1]];
        }
        this.regenerate_meta();

        httpPost('/auth/staged/modify/delete', {json_path: json_path}, () => {
            this.setState({
                status: "Saved",
                modified: true
            })
        });
    }

    // rename only possible for Object props
    onRename(json_path, get_value_fn, set_value_fn, set_new_name_in_sidebar) {

        let ptr = this.state.data;
        for (let elem of json_path.slice(0,json_path.length-1)) {
            ptr = ptr[elem];
        }

        let old_name = json_path[json_path.length-1];
        let name;
        try {
            name = get_value_fn();
        } catch (err) {
            console.error(err);

            // hack to set the editabletext back
            if (set_value_fn) {
                set_value_fn(old_name);
            }
            return;
        }

        if (old_name === name) {
            return;
        }

        let new_name;
        // trim off whitespace
        if (type_of(name) === "string") {
            new_name = name.trim();
            console.log(new_name);
            if (new_name !== name) {
                set_value_fn(new_name);
                if (set_new_name_in_sidebar) {
                    set_new_name_in_sidebar(new_name);
                }
            }
        } else {
            new_name = name;
        }


        let valid = this.validate_rename(json_path, old_name, new_name, ptr);
        if (valid !== undefined) {

            // SOME kind of alert mechanism telling user the validation failed?
            // TODO
            
            // hack to set the editabletext back
            if (set_value_fn) {
                set_value_fn(old_name);
            }
            

        } else {
            this.setState({
                status: "Saving"
            });

            let value = ptr[old_name];
            delete ptr[old_name];
            ptr[new_name] = value;

            if (set_new_name_in_sidebar) {
                set_new_name_in_sidebar(value);
            }
            
            this.regenerate_meta();

            httpPost('/auth/staged/modify/rename', {json_path: json_path, new_name:new_name}, () => {
                this.setState({
                    status: "Saved",
                    modified: true
                })
            });
        }

    }

    validate_edit(json_path, new_value) {
        let err = this.schemaChecker.validate_value(json_path, new_value);
        if (err) {
            return err;
        }
    }

    validate_rename(json_path, old_name, new_name, object_to_rename_in) {
        // nothing to do with json_path atm
        if (object_to_rename_in[new_name] !== undefined) {
            return "Name already exists, use unique name"; 
        }
    }



    render() {
        if (!this.schemaChecker) {
            return null;
        }
        
        return (
            // TODO logged in value from actual logged in value
            <div className="">
                <Header 
                    home={false}
                    alt_title={"Admin Interface"}
                    logged_in={true}
                    extra_classes=" admin-header"
                    />


                {this.state.data ? 
                    <Editor 
                        raw_json={this.state.data} 
                        json_meta={this.state.meta}
                        status={this.state.status}
                        modified={this.state.modified}
                        revertData={this.revertData.bind(this)}
                        publishData={this.publishData.bind(this)}

                        on_add={this.onAdd.bind(this)}
                        on_edit={this.onEdit.bind(this)}
                        on_delete={this.onDelete.bind(this)}
                        on_rename={this.onRename.bind(this)}

                        /> 
                    : 
                    ""
                }
            </div>
        )
    }
}

export default AdminPage;