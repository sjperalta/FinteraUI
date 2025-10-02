import React, { useRef, useState } from "react";
import Editor from "./Editor";
import Quill from "quill";

const Delta = Quill.import("delta");

const MessageEditor = ({ onTextChange }) => {
  const [range, setRange] = useState();

  // Use a ref to access the quill instance directly
  const quillRef = useRef();
  const toolbarOptions = [["bold", "italic", "underline"], ["image"]];

  const handleTextChange = (...args) => {
    if (onTextChange && quillRef.current) {
      // Get the HTML content to preserve formatting and images
      const html = quillRef.current.root.innerHTML;
      onTextChange(html);
    }
  };

  return (
    <div>
      <Editor
        ref={quillRef}
        defaultValue={new Delta()}
        onSelectionChange={setRange}
        onTextChange={handleTextChange}
        toolbarOptions={toolbarOptions}
        wrapperClass="quill-wrapper"
      />
    </div>
  );
};

export default MessageEditor;
