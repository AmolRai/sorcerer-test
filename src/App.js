import { useEffect, useRef, useState } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";

const App = () => {
  const editorRef = useRef(null);
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      try {
        const rawContent = JSON.parse(savedContent);
        const contentState = convertFromRaw(rawContent);
        return EditorState.createWithContent(contentState);
      } catch (e) {
        console.error("Failed to parse saved content:", e);
      }
    }
    return EditorState.createEmpty();
  });

  const handleBeforeInput = (chars) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = contentState.getBlockForKey(selection.getStartKey());
    const blockText = block.getText();

    if (blockText.startsWith("#") && chars === " ") {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        ""
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "change-block-type"
      );

      const finalEditorState = RichUtils.toggleBlockType(
        newEditorState,
        "header-one"
      );
      setEditorState(finalEditorState);

      return "handled";
    }

    if (blockText.startsWith("***") && chars === " ") {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        ""
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "change-inline-style"
      );

      const finalEditorState = RichUtils.toggleInlineStyle(
        newEditorState,
        "UNDERLINE"
      );
      setEditorState(finalEditorState);

      return "handled";
    }

    if (blockText.startsWith("**") && chars === " ") {
      setEditorState(EditorState.createEmpty());

      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        ""
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "change-inline-style"
      );

      const finalEditorState = RichUtils.toggleInlineStyle(
        newEditorState,
        "RED_LINE"
      );
      setEditorState(finalEditorState);

      return "handled";
    }

    if (blockText.startsWith("*") && chars === " ") {
      const newContentState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        ""
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "change-inline-style"
      );

      const finalEditorState = RichUtils.toggleInlineStyle(
        newEditorState,
        "BOLD"
      );
      setEditorState(finalEditorState);

      return "handled";
    }

    return "not-handled";
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContent));
    alert("Content saved to localStorage!");
  };

  const inlineStyleMap = {
    RED_LINE: {
      color: "red",
    },
  };

  useEffect(() => {
    editorRef.current.focus();
  }, []);

  return (
    <div className="container">
      <div className="editor-header">
        <h4>Demo Editor</h4>
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>
      <div className="editor">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={inlineStyleMap}
        />
      </div>
    </div>
  );
};

export default App;
