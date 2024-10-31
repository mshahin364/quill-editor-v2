import React from "react";

type MentionItemProps = {
    item: { id: string; value: string; [key: string]: any }
}

export const MentionItem = (props: MentionItemProps): React.JSX.Element => {
    const {item} = props;
    return (
        <div>
            {item.name}
        </div>
    );
}

export const MentionComponent = (props: MentionItemProps) => {
    const {item} = props;

   return React.createElement(
        'div',
        {className: 'd-flex align-items-center py-2'},
        React.createElement('img', {
            src: item.avatar,
            className: 'avatar avatar-sm',
            alt: `${item.username} avatar`,
        }),
        React.createElement(
            'div',
            {className: 'd-flex flex-column justify-content-center align-items-start ms-2'},
            React.createElement(
                'span',
                {className: 'fw-bold text-truncate mention-name'},
                item.name
            ),
            React.createElement('span', null, `@${item.username}`)
        )
    );
}
