import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Navigation } from './components/Navigation';
import { useWorkflow } from './hooks/useWorkflow';

export function AppContent() {
  const {
    currentStep,
    goToStep,
    goToPrevious,
    goToNext,
    canGoToStep,
    isFirstStep,
    isLastStep,
    allSteps,
    workflowConfig,
    stepSummaries,
    groupStartIndices,
    currentGroup,
    currentStepLabel,
    stepsInCurrentGroup,
    currentGroupIndex,
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
        workflowConfig={workflowConfig}
        stepSummaries={stepSummaries}
        groupStartIndices={groupStartIndices}
      />
      <div className="flex-1 flex flex-col">
        <MainContent
          currentStep={currentStep}
          currentGroup={currentGroup}
          currentStepLabel={currentStepLabel}
          stepsInCurrentGroup={stepsInCurrentGroup}
          groupStartIndices={groupStartIndices}
          currentGroupIndex={currentGroupIndex}
        />
        <Navigation
          currentStep={currentStep}
          onPrevious={goToPrevious}
          onNext={goToNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          totalSteps={allSteps.length}
        />
      </div>
    </div>
  );
} 