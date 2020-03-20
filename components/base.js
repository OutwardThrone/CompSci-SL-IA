import '../css/index.css';

/**
 * This the framework for every thing that's part of a page.
 * All content in pages go through here 
 */
const Base = props => (
    <div className="base">
        {props.children}
    </div>
)

export default Base;