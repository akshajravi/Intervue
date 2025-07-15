import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Trash2, 
  Save, 
  Sun, 
  Moon, 
  Plus, 
  Minus, 
  ChevronDown 
} from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: 'python' | 'javascript' | 'java' | 'cpp';
  theme: 'light' | 'dark';
  fontSize: number;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: 'python' | 'javascript' | 'java' | 'cpp') => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onFontSizeChange: (fontSize: number) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  theme,
  fontSize,
  onCodeChange,
  onLanguageChange,
  onThemeChange,
  onFontSizeChange,
}) => {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<any>(null);

  const languages = [
    { key: 'python', label: 'Python', extension: '.py' },
    { key: 'javascript', label: 'JavaScript', extension: '.js' },
    { key: 'java', label: 'Java', extension: '.java' },
    { key: 'cpp', label: 'C++', extension: '.cpp' },
  ];

  const getMonacoLanguage = (lang: string): string => {
    switch (lang) {
      case 'python': return 'python';
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'python';
    }
  };

  const getMonacoTheme = (themeType: string): string => {
    return themeType === 'dark' ? 'vs-dark' : 'vs-light';
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setIsRunning(false);
      console.log('Code execution simulated');
    }, 2000);
  };

  const handleClearCode = () => {
    onCodeChange('');
  };

  const handleSaveDraft = () => {
    localStorage.setItem('interview-code-draft', JSON.stringify({
      code,
      language,
      timestamp: new Date().toISOString(),
    }));
    console.log('Draft saved');
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const increaseFontSize = () => {
    if (fontSize < 24) {
      onFontSizeChange(fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 10) {
      onFontSizeChange(fontSize - 2);
    }
  };

  const currentLanguage = languages.find(lang => lang.key === language);

  return (
    <div className="flex flex-col h-full bg-white font-inter shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-200" style={{ backgroundColor: '#fff7f1' }}>
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-secondary-200 rounded-md text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-haspopup="true"
              aria-expanded={isLanguageMenuOpen}
            >
              <span>{currentLanguage?.label}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isLanguageMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-md shadow-lg z-10">
                {languages.map((lang) => (
                  <button
                    key={lang.key}
                    onClick={() => {
                      onLanguageChange(lang.key as any);
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 ${
                      language === lang.key ? 'bg-primary-50 text-primary' : 'text-secondary-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center space-x-1 px-3 py-2 bg-white border border-secondary-200 rounded-md text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>

          {/* Font Size Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={decreaseFontSize}
              className="p-2 bg-white border border-secondary-200 rounded-md text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Decrease font size"
              disabled={fontSize <= 10}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm font-medium text-secondary-700 min-w-[2rem] text-center">
              {fontSize}
            </span>
            <button
              onClick={increaseFontSize}
              className="p-2 bg-white border border-secondary-200 rounded-md text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Increase font size"
              disabled={fontSize >= 24}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="btn btn-success"
            aria-label="Run code"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          
          <button
            onClick={handleClearCode}
            className="btn btn-secondary"
            aria-label="Clear code"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          
          <button
            onClick={handleSaveDraft}
            className="btn btn-secondary"
            aria-label="Save draft"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          theme={getMonacoTheme(theme)}
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize,
            fontFamily: 'JetBrains Mono, Monaco, Consolas, "Courier New", monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            parameterHints: {
              enabled: true,
            },
            hover: {
              enabled: true,
            },
            contextmenu: true,
            mouseWheelZoom: true,
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'gutter',
            selectOnLineNumbers: true,
            glyphMargin: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            unfoldOnClickAfterEndOfLine: true,
            matchBrackets: 'always',
            autoIndent: 'full',
            formatOnType: true,
            formatOnPaste: true,
            dragAndDrop: true,
            links: true,
            colorDecorators: true,
            lightbulb: {
              enabled: 'on' as any,
            },
            codeActionsOnSave: {
              'source.organizeImports': 'explicit',
            },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;