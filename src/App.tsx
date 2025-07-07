import { WorkflowProvider } from './hooks/WorkflowContext';
import { AppContent } from './AppContent';

function App() {
  return (
    <WorkflowProvider>
      <AppContent />
    </WorkflowProvider>
  );
}

export default App;
