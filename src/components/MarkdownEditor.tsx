import React, { useMemo, useCallback } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, placeholder }) => {
  const options = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: placeholder || 'Enter description in Markdown...',
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide'
      ],
      minHeight: '300px',
      maxHeight: '600px',
      autofocus: false,
      // Custom styles to match the portfolio theme
      styleSelectedText: false,
    };
  }, [placeholder]);

  const handleChange = useCallback((value: string) => {
    onChange(value);
  }, [onChange]);

  return (
    <div className="markdown-editor-wrapper">
      <SimpleMDE
        value={value}
        onChange={handleChange}
        options={options}
      />
      <style>{`
        .markdown-editor-wrapper .EasyMDEContainer {
          border: 1px solid #000;
        }
        .markdown-editor-wrapper .EasyMDEContainer .CodeMirror {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 14px;
          border: none;
          background: white;
        }
        .markdown-editor-wrapper .EasyMDEContainer .editor-toolbar {
          background: white;
          border-bottom: 1px solid #000;
          border-top: none;
          border-left: none;
          border-right: none;
        }
        .markdown-editor-wrapper .EasyMDEContainer .editor-toolbar button {
          color: #000 !important;
        }
        .markdown-editor-wrapper .EasyMDEContainer .editor-toolbar button:hover,
        .markdown-editor-wrapper .EasyMDEContainer .editor-toolbar button.active {
          background: #f5f5f5;
          border-color: #000;
        }
        .markdown-editor-wrapper .EasyMDEContainer .editor-toolbar i.separator {
          border-left: 1px solid #000;
          border-right: 1px solid #000;
        }
        .markdown-editor-wrapper .EasyMDEContainer .CodeMirror-cursor {
          border-left-color: #000;
        }
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview,
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview-side {
          background: white;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview h1,
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview h2,
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview h3,
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview-side h1,
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview-side h2,
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview-side h3 {
          border-bottom: 1px solid #000;
        }
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview a,
        .markdown-editor-wrapper .EasyMDEContainer .editor-preview-side a {
          color: #000;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;
