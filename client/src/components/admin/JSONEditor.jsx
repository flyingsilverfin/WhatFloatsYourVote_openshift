import React from 'react';

import ColorPicker from './ColorPicker.jsx';
import {strContains, isArray, is_primitive, assert} from '../../helper.js';


// used to determine which places to put an "add" button
// only allow growing objects/arrays following the schema 
// and not inserting arbitrary properties that way!
// NB this might not be desireable: requires developer to be ahead of data person
function all_children_deletable(json_meta) {
    for (let key in json_meta) {
        if (key === '_deletable') {
            // this refers to the deletability of the parent
            // so skip it
            continue;
        }
        if (is_primitive(json_meta[key])) {
            if (!json_meta[key]) {
                // ie. a false boolean and not object/array
                return false;
            }
        } else {
            if (!json_meta[key]['_deletable']) {
                return false;
            }
        }
    }
    return true;
}

// used for deciding whether to show next line/entry as a dummy/ghost
// or a "+" which expands after
function all_children_primitive(json_meta) {
    for (let key in json_meta) {
        if (key === '_deletable') {
            // this refers to the deletability of the parent, skip
            continue;
        }
        if (!is_primitive(json_meta[key])) {
            return false;
        }
    }
    return true;
}


// for existing JSON data these are all filled out
// for 'future' Entries that might be entered
// we only pass in name (for arrays) which may or may not be used
// data is null, meta is REQUIRED
const Entry = ({
    name, 
    data,
    meta,
    no_border,
    not_collapsed_levels,
    json_path,
    on_add,
    on_edit,
    on_delete,
    on_rename
}) => {


    if (isArray(data)) {
        // special case for colors
        if (strContains(name, "color")) {
            return <ColorPickerEntry 
                        name={name} 
                        data={data} 
                        meta={meta} 
                        no_border={no_border} 
                        json_path={json_path}
                        
                        on_add={on_add}
                        on_edit={on_edit}
                        on_delete={on_delete}
                    />
        } else {
            return  (
                <ArrayEntry 
                    name={name} 
                    data={data} 
                    meta={meta} 
                    no_border={no_border} 
                    not_collapsed_levels={not_collapsed_levels} 
                    json_path={json_path}

                    on_add={on_add}
                    on_edit={on_edit}
                    on_delete={on_delete}
                    on_rename={on_rename}
                />
            )
        }
    } else if (typeof data === 'object') {
        return (
            <ObjectEntry 
                name={name} 
                data={data} 
                meta={meta} 
                no_border={no_border}  
                not_collapsed_levels={not_collapsed_levels} 
                json_path={json_path}

                on_add={on_add}
                on_edit={on_edit}
                on_delete={on_delete}
                on_rename={on_rename}
            />
            )
    } else {
        if ( typeof data === "string") {

            // check special case for images
            let split = data.split('.');
            let suffix = split[split.length - 1].toLowerCase();
            let image_types = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'];
            if (image_types.indexOf(suffix) != -1) {
                return <ImageEntry 
                            name={name} 
                            src={data} 
                            deletable={meta} 
                            no_border={no_border}
                            json_path={json_path}

                            on_edit={on_edit}
                            on_delete={on_delete}
                        />
            } else {
                return <StringEntry 
                            name={name} 
                            data={data} 
                            deletable={meta} 
                            no_border={no_border} 
                            json_path={json_path}

                            on_edit={on_edit}
                            on_delete={on_delete}
                        />
            }
        } else if ( typeof data=== "number" ) {
            return <NumberEntry 
                        name={name} 
                        data={data}
                        deletable={meta}
                        no_border={no_border}
                        json_path={json_path}

                        on_edit={on_edit}
                        on_delete={on_delete}
                   />
        } else {
            //<GenericEntry name={name} data={data} />
        }
    }
}


class ObjectEntry extends React.Component {
    constructor(props) {
        super(props);
        let visible = this.props.not_collapsed_levels > 0 ? true : false;
        
        this.state = {
            visible: visible    // toggle collapse
        };
    }

    render() {
        let name = this.props.name;
        let data = this.props.data;


        // whether or not to render functionality to add another child
        let extendable = all_children_deletable(this.props.meta);
        // let dummy_structure;
        // let dummy_meta;
        // if (extendable) {
        //     let data_structure = this.props.get_dummy_structure(this.props.json_path);
        //     //dummy_structure = dummy_data.json;
        //     //dummy_meta = dummy_data.meta;
        //     assert(typeof dummy_structure === 'object', "ArrayEntry dummy data generated is not in an array!");
        //     debugger
        // }


        return (
        <div className="entry-container"
             style={this.props.no_border? {border:'none', marginLeft:0, paddingLeft:0}: {}} >
            <div className="entry-heading">


                { this.props.meta._deletable ?
                    <div 
                        className="item-button item-delete"
                        title="delete"
                        onClick={() => this.props.on_delete(this.props.json_path)}>
                    </div>
                    :
                    <div className="item-button item-required" title="Required item">
                    </div>
                }
                

                <div 
                    className="entry-collapse"
                    onClick={() => this.setState({visible:!this.state.visible})}
                    style={!this.state.visible?{'transform':'rotateZ(0deg)'} : {}}
                    >
                    ▶
                </div>
                <div 
                    className={
                        this.props.meta._deletable ?
                            "entry-title inline editable-area" 
                        :   "entry-title inline"
                    }
                    contentEditable={
                        this.props.meta._deletable ? 
                            "true" 
                            : "false"
                    }
                    onBlur={this.props.meta._deletable ? 
                                (event) => this.props.on_rename(this.props.json_path, () => event.target.textContent, (new_value) => event.target.textContent = new_value)
                                : null }

                    onKeyDown={
                        (e) => {
                            if (e.which == 13) {
                            // Enter key pressed
                            e.preventDefault();
                            e.target.blur();
                            }
                        }   
                    }

                    title="Rename this property"
                    >
                    {name}
                </div>
                <span className={"entry-title-details" + (!this.state.visible ? " entry-title-details-emph" : " entry-title-details-normal")}>
                    object, {Object.keys(data).length} keys
                </span>
            </div>
            {this.state.visible ? 
                <div className="entry-content">
                    {
                        Object.keys(data).map((n, index) =>
                            <Entry 
                                name={n} 
                                data={data[n]} 
                                meta={this.props.meta[n]} 
                                key={index}
                                not_collapsed_levels={this.props.not_collapsed_levels-1}
                                json_path={this.props.json_path.concat([n])}
                                on_add={this.props.on_add}
                                on_edit={this.props.on_edit}
                                on_delete={this.props.on_delete}
                                on_rename={this.props.on_rename}
                                />
                        )
                    }

                    { 
                        extendable ? 
                            <AddEntry
                                on_click={() => this.props.on_add(this.props.json_path, null)}
                            />
                         : null
                    }

                    
                </div>
                :
                ""
            }
        </div>
        )
    }
}

class ArrayEntry extends React.Component {
    constructor(props) {
        super(props);

        let visible = this.props.not_collapsed_levels > 0 ? true : false;
        
        this.state = {
            visible: visible    // toggle collapse
        };
    }

    render() {
        
        let name = this.props.name;
        let data = this.props.data;


        // whether or not to render functionality to add another child
        let extendable = all_children_deletable(this.props.meta);
        // let dummy_structure;
        // let dummy_meta;
        let next_index;
        if (extendable) {
        //     let dummy_data = this.props.get_dummy_structure(this.props.json_path);
        //     dummy_structure = dummy_data.json;
        //     dummy_meta = dummy_data.meta;
        //     assert(isArray(dummy_structure), "ArrayEntry dummy data generated is not in an array!");
             next_index = data.length;
        }
        

        return (
        <div className="entry-container"
            style={this.props.no_border? {border:'none', marginLeft:0, paddingLeft:0}: {}} >
            <div className="entry-heading">

                { this.props.meta._deletable ?
                    <div 
                        className="item-button item-delete"
                        title="delete"
                        onClick={() => this.props.on_delete(this.props.json_path)}>
                    </div>
                    :
                    <div className="item-button item-required" title="Required item">
                    </div>
                }


                <div 
                    className="entry-collapse"
                    onClick={() => this.setState({visible:!this.state.visible})}
                    style={!this.state.visible?{'transform':'rotateZ(0deg)'} : {}}
                    >
                    ▶
                </div>

                <span className="entry-title">
                    {name}
                </span>
                <span className={"entry-title-details" + (!this.state.visible ? " entry-title-details-emph" : " entry-title-details-normal")}>
                    array, {data.length} items
                </span>
            </div>
            {this.state.visible ?
                <div className="entry-content">
                    {
                        data.map((value, index) => 
                                <Entry 
                                    name={index+"."} 
                                    data={value} 
                                    meta={this.props.meta[index]} 
                                    key={index} 
                                    not_collapsed_levels={this.props.not_collapsed_levels-1}
                                    json_path={this.props.json_path.concat([index])}

                                    on_add={this.props.on_add}
                                    on_edit={this.props.on_edit}
                                    on_delete={this.props.on_delete}
                                    on_rename={this.props.on_rename}
                                    /> 
                        )
                    }

                    { 
                        extendable ? 
                            <AddEntry
                                on_click={() => this.props.on_add(this.props.json_path, next_index)}
                            />
                        : null
                    }
                </div>
                :
                ""
            }
        </div>
        );
    }
}

class ColorPickerEntry extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
             <div className="entry-container"
                style={this.props.no_border? {border:'none', marginLeft:0, paddingLeft:0}: {}} >
                <div className="entry-heading">
                    {this.props.name}
                </div>
                <div className="entry-content">
                    <ColorPicker /* I think this modifies rgba in props.data directly */
                        rgba={this.props.data} 
                        onClose={(c) => {
                            let color_arr = [c.r, c.g, c.b, c.a];
                            this.props.on_edit(
                                this.props.json_path, 
                                () => color_arr)
                        }}/>
                </div>
            </div>
        )
    }
}


const StringEntry = ({
    name, 
    data, 
    deletable, 
    no_border,

    json_path,
    on_edit,
    on_delete
}) => (
    <div className="entry-container"
        style={no_border? {border:'none', marginLeft:0, paddingLeft:0}: {}} >


        {deletable ?
            <div 
                className="item-button item-delete"
                title="delete"
                onClick={() => on_delete(json_path)}>
            </div>
            :
            <div className="item-button item-required" title="Required item">
            </div>
        }
        
        <div className="entry-heading inline">
            {name}
        </div>
        <div 
            className="entry-content inline value editable-area" 
            contentEditable="true"
            onBlur={
                (event) => 
                    on_edit(
                        json_path,
                        () => event.target.textContent, 
                        (new_value) => event.target.textContent = new_value
                    )
            }
            onKeyDown={
                (e) => {
                    if (e.which == 13) {
                        // Enter key pressed
                        e.preventDefault();
                        e.target.blur();
                    }
                }   
            }
            >
            {data}
        </div>
    </div>
);

const ImageEntry = ({
    name, 
    src, 
    deletable, 
    no_border,

    json_path,
    on_edit,
    on_delete
}) => (
    <div className="entry-container"
        style={no_border? {border:'none', marginLeft:0, paddingLeft:0}: {}} >


        {deletable ?
            <div 
                className="item-button item-delete"
                title="delete"
                onClick={() => on_delete(json_path)}>
            </div>
            :
            <div className="item-button item-required" title="Required item">
            </div>
        }

        <div className="entry-heading inline">
            {name}
        </div>
        <div className="entry-content inline">
            <img className="entry-image" src={src} />
        </div>
    </div>
);

const NumberEntry = ({
    name, 
    data, 
    deletable, 
    no_border,

    json_path,
    on_edit,
    on_delete
}) => (
    <div className="entry-container"
        style={no_border? {border:'none', marginLeft:0, paddingLeft:0}: {}} >


        {deletable ?
            <div 
                className="item-button item-delete"
                title="delete"
                onClick={() => on_delete(json_path)}>
            </div>
            :
            <div className="item-button item-required" title="Required item">
            </div>
        }

        <div className="entry-heading inline">
            {name}
        </div>
        <div 
            className="entry-content inline value editable-area"
            contentEditable="true"
            onBlur={(event) => on_edit(json_path, () => Number(event.target.textContent), (new_value) => event.target.textContent = new_value)}
            onKeyDown={
                (e) => {
                    if (e.which == 13) {
                        // Enter key pressed
                        e.preventDefault();
                        e.target.blur();
                    }
                }   
            }
            >
            {data}
        </div>
    </div>
);

const AddEntry = ({
    on_click, no_border
}) => (
    <div className="entry-container"
        style={no_border? {border:'none', marginLeft:0, paddingLeft:0}: {}}>
        <div 
            className="item-button item-add" 
            title="Add Entry"
            onClick={on_click} >
        </div>
    </div>
)

class JSONEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: true    // toggle collapse
        };
    }

    render() {
        if (this.props.meta === null || this.props.json === null) {
            return <div> Loading </div>
        }
debugger
        return (
            <div> 
            {
                Object.keys(this.props.json).map( (name, index) => 
                   <Entry 
                        name={name} 
                        data={this.props.json[name]} 
                        meta={this.props.meta[name]} 
                        key={index} 
                        no_border={true}
                        not_collapsed_levels={3}
                        json_path={this.props.json_path.concat([name])}
                        
                        on_add={this.props.on_add}
                        on_edit={this.props.on_edit}
                        on_delete={this.props.on_delete}
                        on_rename={this.props.on_rename}
                        />
                )
            }
            {
                all_children_deletable(this.props.meta) ? 
                    <AddEntry
                        on_click={() => this.props.on_add(this.props.json_path, null)}
                        no_border={true}
                        />
                    :
                    null
            }
            </div>
        )
    }
}


export default JSONEditor;