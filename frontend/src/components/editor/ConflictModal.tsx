interface ConflictModalProps {
  onResolve: (action: 'reload' | 'overwrite') => void;
}

export function ConflictModal({ onResolve }: ConflictModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Document Conflict
        </h2>

        <p className="text-gray-600 mb-6">
          This document has been modified in another session. What would you like to do?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => onResolve('reload')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Reload Latest
          </button>
          <button
            onClick={() => onResolve('overwrite')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Overwrite
          </button>
        </div>
      </div>
    </div>
  );
}
