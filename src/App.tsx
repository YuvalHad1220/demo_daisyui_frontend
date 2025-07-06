import React from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Navigation } from './components/Navigation';
import { useWorkflow } from './hooks/useWorkflow';

function App() {
  const { 
    currentStep, 
    goToStep, 
    goToPrevious, 
    goToNext, 
    canGoToStep 
  } = useWorkflow();

  const handleStepClick = (stepIndex: number) => {
    if (canGoToStep(stepIndex)) {
      goToStep(stepIndex);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        currentStep={currentStep} 
        onStepClick={handleStepClick} 
      />
      <div className="flex-1 flex flex-col">
        <MainContent currentStep={currentStep} />
        <Navigation 
          currentStep={currentStep}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      </div>
    </div>
  );
}

export default App;
