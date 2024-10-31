import 'reflect-metadata';
import {RichTextEditor} from "./RichTextEditor.tsx";
import './App.css'
// import ReactQuill from "react-quill-new";
// import {useState} from "react";

// import 'react-quill-new/dist/quill.snow.css';
import '../src/new-richtexteditor/emoji.css';
// import 'quill-mention/dist/quill.mention.css';
import "./assets/global.scss";

function App2() {
    // const [value, setValue] = useState('');
    //
    // return <ReactQuill theme="snow" value={value} onChange={setValue} />;

  return (
    <div style={{width: '100%'}}>
      <RichTextEditor/>
    </div>
  )
}

export default App2
