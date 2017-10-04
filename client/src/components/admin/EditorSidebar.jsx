import React, { PropTypes } from 'react';
import {is_primitive} from '../../helper.js';


const EditorSidebar = ({
    choices_paths,
    active,
    setActive,

    meta,
    on_add,
    on_delete,
    on_rename,
}) => 
<div>
    {
        choices_paths.map(function(choice_path, index) {
            let choice = choice_path[choice_path.length-1]; // last element is name
            let deletable_root = meta;
            for (let key of choice_path) {
                deletable_root = deletable_root[key];
            }
            let deletable;  //if deletable then also editable! at least in this case
            if (!is_primitive(deletable_root)) {
                deletable = deletable_root['_deletable'];
            } else {
                deletable = deletable_root;
            }

            


            return (
                <div 
                    className={"sidebar-choice" + (choice === active ? ' active' : ' inactive')}
                    onClick={() => setActive(choice)} 
                    key={index}>

                    { 
                        deletable ? 
                        <div 
                            className="item-delete" 
                            onClick={
                                (event) => {
                                    on_delete(choice_path); 
                                    event.stopPropagation();
                                    if (choice === active) {
                                        setActive("parties");
                                    }
                                }
                            }>
                        </div>
                        : 
                        <div
                            className="item-delete" style={{visibility: 'hidden'}}>
                        </div>
                    }                
                    <div
                        className={"sidebar-title " + (deletable ? "editable-area inline" : '')}
                        contentEditable={deletable ? true : false}
                        onClick={(event) => deletable ? event.stopPropagation() : null}
                        onBlur={
                            (event) => {console.log('why is this needed?');on_rename(choice_path, 
                                () => event.target.textContent, 
                                (new_value) => event.target.textContent = new_value),
                                (old_name, new_name) => old_name === active ? setActive(new_name) : null}}
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
                        {choice}
                    </div>

                    
            </div>)
        }
        )
    }

    <div 
        className="item-add"
        onClick={on_add}>
    </div>
</div>

export default EditorSidebar;