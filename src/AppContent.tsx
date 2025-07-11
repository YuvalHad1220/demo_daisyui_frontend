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
    isStepCompleted,
    isFirstStep,
    isLastStep,
    allSteps,
    workflowConfig,
    stepSummaries,
    stepMetadata,
    groupStartIndices,
    currentGroup,
    currentStepLabel,
    stepsInCurrentGroup,
    currentGroupIndex,
    resetGroup,
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
        canGoToStep={canGoToStep}
        isStepCompleted={isStepCompleted}
        workflowConfig={workflowConfig}
        stepSummaries={stepSummaries}
        stepMetadata={stepMetadata}
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
          onResetGroup={resetGroup}
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