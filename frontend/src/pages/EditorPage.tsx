import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDocument } from '../hooks/useDocument';
import { EditorContainer } from '../components/editor/EditorContainer';
import { getProject, Project } from '../lib/api/projects';

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [version, setVersion] = useState(1);
  const [project, setProject] = useState<Project | null>(null);

  const { document, isLoading, error } = useDocument({
    projectId: projectId || null,
  });

  useEffect(() => {
    if (document) {
      setVersion(document.version);
    }
  }, [document]);

  useEffect(() => {
    if (projectId) {
      getProject(projectId)
        .then(setProject)
        .catch(console.error);
    }
  }, [projectId]);

  if (!projectId) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error.message}</div>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-gray-500 mb-4">Document not found</div>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-3 flex items-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <h1 className="text-lg font-medium text-gray-900">{project?.name || 'Loading...'}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <EditorContainer
          initialContent={document.contentMd}
          documentId={document.id}
          version={version}
          onVersionUpdate={setVersion}
        />
      </main>
    </div>
  );
}
