import { useCallback, useRef, useState} from "react";
// import ReactQuill from "react-quill-new";
// import svgIconPath from '@ideascale/ui/dist/assets/icons/is-icon-defs.svg';
// import {HtmlConverter, NewRichTextEditor, RichTextEditorHandler} from "./new-richtexteditor";
// import {HtmlConverter, NewRichTextEditor2, RichTextEditorHandler} from "./new-richtexteditor";
// import {User} from "./new-richtexteditor/NewRichTextEditor.tsx";
import {NewRichTextEditor} from "./new-richtexteditor/NewRichTextEditor.tsx";
import {MentionUser} from "./new-richtexteditor/MentionUser.ts";
import {RichTextEditorHandler} from "./new-richtexteditor/RichTextEditorHandler.ts";
import {HtmlConverter} from "./new-richtexteditor";

// import {HtmlUtils} from "@ideascale/commons";
// import 'react-quill-new/dist/quill.snow.css';

const ALL_SUGGESTED_PEOPLES = [
    {
        'id': 302252,
        'name': 'md rafiqul islam',
        'username': 'rafiqul.islam',
        'avatar': 'https://app.ideascale.com/userimages/avatar/451/4517167/rafiq1.jpg'
    },
    {
        'id': 30225332,
        'name': 'regular.member.2 regular.member.2 regular.member.2 regular.member.2 regular.member.2',
        'username': 'rafiqul.islam',
        'avatar': 'https://app.ideascale.com/userimages/avatar/451/4517167/rafiq1.jpg'
    },
    {
        'id': 297410,
        'name': 'rajib karmaker',
        'username': 'rajib.karmaker',
        'avatar': 'https://secure.gravatar.com/avatar/f9487b44a61bccfd5fe7a38f8e897f1c.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-R.png'
    },
    {
        'id': 301219,
        'name': 'ahmed rafayat',
        'username': 'ahmed.rafayat',
        'avatar': 'https://secure.gravatar.com/avatar/c0f31f23d01639e2232fd043052dfc11.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-A.png'
    },
    {
        'id': 286391,
        'name': 'ataul islam raihan',
        'username': 'ataulislamraihan',
        'avatar': 'https://secure.gravatar.com/avatar/ae9aebed74f233b59044b4712606548e.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-A.png'
    },
    {
        'id': 284294,
        'name': 'ziaur rahman',
        'username': 'ziaur.rahman',
        'avatar': 'https://secure.gravatar.com/avatar/49c2ef53bb7c35060278f9f5a5d26310.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-Z.png'
    },
    {
        'id': 302252,
        'name': 'md rafiqul islam',
        'username': 'rafiqul.islam',
        'avatar': 'https://app.ideascale.com/userimages/avatar/451/4517167/rafiq1.jpg'
    },
    {
        'id': 297410,
        'name': 'rajib karmaker',
        'username': 'rajib.karmaker',
        'avatar': 'https://secure.gravatar.com/avatar/f9487b44a61bccfd5fe7a38f8e897f1c.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-R.png'
    },
    {
        'id': 301219,
        'name': 'ahmed rafayat',
        'username': 'ahmed.rafayat',
        'avatar': 'https://secure.gravatar.com/avatar/c0f31f23d01639e2232fd043052dfc11.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-A.png'
    },
    {
        'id': 286391,
        'name': 'ataul islam raihan',
        'username': 'ataulislamraihan',
        'avatar': 'https://secure.gravatar.com/avatar/ae9aebed74f233b59044b4712606548e.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-A.png'
    },
    {
        'id': 284294,
        'name': 'ziaur rahman',
        'username': 'ziaur.rahman',
        'avatar': 'https://secure.gravatar.com/avatar/49c2ef53bb7c35060278f9f5a5d26310.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-Z.png'
    },
    {
        'id': 302252,
        'name': 'md rafiqul islam',
        'username': 'rafiqul.islam',
        'avatar': 'https://app.ideascale.com/userimages/avatar/451/4517167/rafiq1.jpg'
    },
    {
        'id': 297410,
        'name': 'rajib karmaker',
        'username': 'rajib.karmaker',
        'avatar': 'https://secure.gravatar.com/avatar/f9487b44a61bccfd5fe7a38f8e897f1c.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-R.png'
    },
    {
        'id': 301219,
        'name': 'ahmed rafayat',
        'username': 'ahmed.rafayat',
        'avatar': 'https://secure.gravatar.com/avatar/c0f31f23d01639e2232fd043052dfc11.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-A.png'
    },
    {
        'id': 286391,
        'name': 'ataul islam raihan',
        'username': 'ataulislamraihan',
        'avatar': 'https://secure.gravatar.com/avatar/ae9aebed74f233b59044b4712606548e.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-A.png'
    },
    {
        'id': 284294,
        'name': 'ziaur rahman',
        'username': 'ziaur.rahman',
        'avatar': 'https://secure.gravatar.com/avatar/49c2ef53bb7c35060278f9f5a5d26310.jpg?s=80&d=https%3A%2F%2Fstatic.ideascale.com%2Fimages%2Favatar%2Fdefault-Z.png'
    }
];

export const RichTextEditor = () => {
    // const [value, setValue] = useState('');

    // return <ReactQuill theme="snow" value={value} onChange={setValue} />;
    const tempValueRef = useRef('');
    const htmlContentRef = useRef('');
    const quillRef = useRef<RichTextEditorHandler>(null);

    const [serverFormat, setServerFormat] = useState('');
    // const [renderedFormat, setRenderedFormat] = useState('');

    const suggestPeople = useCallback(async (searchTerm: string) => {
        return ALL_SUGGESTED_PEOPLES.filter(person => person.name.toLowerCase().includes(searchTerm.toLowerCase())) as MentionUser[];
    }, []);

    const onChange = useCallback((value: string) => htmlContentRef.current = value, []);

    const onClickRender = () => {
        const serverHtml = HtmlConverter.toServerHtmlFormat(htmlContentRef.current);
        setServerFormat(serverHtml);
        // setRenderedFormat(HtmlConverter.toRenderHtmlFormat(serverHtml));
        tempValueRef.current = serverHtml;
    };

    const tempImageUpload = useCallback(async (data: FormData) => {
        let fileName = '';
        let url = '';
        // @ts-ignore
        for (let [, value] of data) {
            // @ts-ignore
            fileName = value.name;
            url = URL.createObjectURL(value as Blob);
        }

        if (fileName && url) {
            return Promise.resolve({
                originalFileName: fileName,
                filename: fileName,
                url: url,
                altText: 'alt text'
            });
        }

        return Promise.resolve({
            originalFileName: '',
            filename: '',
            url: '',
            altText: ''
        });
    }, []);

    return (
        <section style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            flexDirection: 'column'
        }}>
            NewRichTextEditor:

            <NewRichTextEditor
                id={'description'}
                placeholder={'Enter description'}
                toolbar={'default'}
                svgIconPath={''}
                enableEmojiPicker={true}
                enableAtMention={true}
                maxCharacterLimit={1000}
                characterLeftLabel={'Remaining'}
                fetchMentionUsers={suggestPeople}
                onChange={onChange}
                existingAttachments={[]}
                defaultValue={''}
                ref={quillRef}
                uploadImage={tempImageUpload}
            />
            <br/><br/><br/><br/><br/>
            NewRichTextEditor2:
            {/*<NewRichTextEditor2*/}
            {/*    id={'description'}*/}
            {/*    placeholder={'Enter description'}*/}
            {/*    toolbar={'default'}*/}
            {/*    svgIconPath={''}*/}
            {/*    enableEmojiPicker={true}*/}
            {/*    enableAtMention={true}*/}
            {/*    maxCharacterLimit={1000}*/}
            {/*    characterLeftLabel={'Remaining'}*/}
            {/*    fetchMentionUsers={suggestPeople}*/}
            {/*    onChange={onChange}*/}
            {/*    existingAttachments={[]}*/}
            {/*    defaultValue={''}*/}
            {/*    ref={quillRef}*/}
            {/*    uploadImage={tempImageUpload}*/}
            {/*/>*/}


            {
                <>
                    <button className="mt-0 btn btn-primary" onClick={onClickRender}>Render Editor Content</button>
                    {
                        serverFormat &&
                        <div className="mt-5">
                            <h5 className="mt-3">Raw content</h5>
                            <div className="p-1">
                                <code>{serverFormat}</code>
                            </div>
                            <h5 className="mt-3">Rendered content after conversion</h5>
                            <div className="p-1 ql-editor">
                                {/*<code>{HtmlUtils.htmlToReact(renderedFormat)}</code>*/}
                            </div>
                        </div>
                    }
                </>
            }

        </section>
    )
}