import { WorkflowProvider } from './hooks/useWorkflow';
import { AppContent } from './AppContent';

function App() {
  return (
    <WorkflowProvider>
      <AppContent />
    </WorkflowProvider>
  );
}

export default App;
