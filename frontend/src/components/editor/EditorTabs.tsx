interface EditorTabsProps {
  activeTab: 'markdown' | 'richtext';
  onTabChange: (tab: 'markdown' | 'richtext') => void;
}

export function EditorTabs({ activeTab, onTabChange }: EditorTabsProps) {
  return (
    <div className="flex border-b border-gray-200">
      <button
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === 'richtext'
            ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onTabChange('richtext')}
      >
        Rich Text
      </button>
      <button
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === 'markdown'
            ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onTabChange('markdown')}
      >
        Markdown
      </button>
    </div>
  );
}
