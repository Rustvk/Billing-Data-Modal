import React from "react";

function Section(props) {
    const classNames = [
        "ui",
        "message",
        props.type
    ];
    return <div className={classNames.join(' ')}>{props.message}</div>;
}

export default Section;