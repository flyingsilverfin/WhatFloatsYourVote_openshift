import React, { PropTypes } from 'react';

import EditorSidebar from './EditorSidebar.jsx';
import EditorStatusbar from './EditorStatusbar.jsx';
import JSONEditor from './JSONEditor.jsx';

/*
Full width with its own side bar
*/


class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: 'parties'
        }
    }

    setActive(key) {
        this.setState({
            active: key
        });
    }

    render() {

        if (this.props.data_json === null || this.props.json_meta === null) {
            return <div> Loading </div>;
        }

        let choices_paths = [['parties']];
        for (let topic in this.props.raw_json.topics) {
            choices_paths.push(['topics', topic]);
        }
        let choices_meta = this.props.json_meta;

        let active_json = null;
        let active_meta = null;
        let active_path = null;
        if (this.state.active === 'parties') {
            active_json = this.props.raw_json['parties'];
            active_meta = this.props.json_meta['parties'];
            active_path = ['parties'];
        } else {
            active_json = this.props.raw_json.topics[this.state.active];
            active_meta = this.props.json_meta.topics[this.state.active];
            active_path = ['topics', this.state.active];
        }

        
        return (
            <div className="admin-container">
                <div className="admin-leftbar">
                    <div className="admin-sidebar">
                        <EditorSidebar 
                            choices_paths={choices_paths} 
                            active={this.state.active} 
                            setActive={this.setActive.bind(this)} 

                            meta={choices_meta}
                            on_add={() => this.props.on_add(['topics'], null)}
                            on_delete={this.props.on_delete}
                            on_rename={this.props.on_rename}
                            />
                    </div>
                    <div className="admin-statusbar flex-center-all">
                        <EditorStatusbar
                            status={this.props.status}
                            modified={this.props.modified}
                            revertData={this.props.revertData}
                            publishData={this.props.publishData}
                            />
                    </div>
                </div>

                <div className="admin-main-content"> 
                    <JSONEditor 
                        json={active_json}
                        meta={active_meta} 
                        json_path={active_path} 

                        on_add={this.props.on_add}
                        on_edit={this.props.on_edit}
                        on_delete={this.props.on_delete}
                        on_rename={this.props.on_rename}
                        />
                </div>
            </div>
        );
    }
}


export default Editor;