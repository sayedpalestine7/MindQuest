export function NavigationButtons({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  isLoading, 
  nextDisabled = false 
}) {
  return (
    <div className="flex gap-4 mt-6">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="btn btn-outline flex-1"
          disabled={isLoading}
        >
          Back
        </button>
      )}
      <button
        type={currentStep === totalSteps ? "submit" : "button"}
        onClick={currentStep === totalSteps ? undefined : onNext}
        className={`btn btn-primary flex-1 ${currentStep === 1 ? 'col-span-2' : ''}`}
        disabled={isLoading || nextDisabled}
      >
        {currentStep === totalSteps ? (
          isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Creating account...
            </>
          ) : (
            "Create account"
          )
        ) : (
          "Continue"
        )}
      </button>
    </div>
  )
}
export default NavigationButtons;