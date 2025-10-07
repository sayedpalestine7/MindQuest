export function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="steps steps-horizontal">
        {[...Array(totalSteps)].map((_, index) => (
          <div 
            key={index}
            className={`step ${index < currentStep ? 'step-primary' : ''} ${index === currentStep - 1 ? 'step-primary' : ''}`}
          >
            {/* <span className="step-marker">{index + 1}</span> */}
          </div>
        ))}
      </div>
    </div>
  )
}
export default StepIndicator;