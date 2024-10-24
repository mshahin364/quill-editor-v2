import 'reflect-metadata';
// import {RichTextEditor} from "./RichTextEditor.tsx";
import './App.css'
import ReactQuill from "react-quill-new";
import {useState} from "react";

import 'react-quill-new/dist/quill.snow.css';

function App() {
    const [value, setValue] = useState('');

    return <ReactQuill theme="snow" value={value} onChange={setValue} />;

  // return (
  //   <div style={{width: '100%'}}>
  //     <RichTextEditor/>
  //   </div>
  // )
}

export default App
