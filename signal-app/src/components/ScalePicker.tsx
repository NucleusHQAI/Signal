type ScalePickerProps = {
  value: number
  onChange: (value: number) => void
  max?: number
  lowLabel?: string
  highLabel?: string
}

export function ScalePicker({ value, onChange, max = 5, lowLabel, highLabel }: ScalePickerProps) {
  const options = Array.from({ length: max }, (_, i) => i + 1)
  return (
    <div>
      <div className="scale-picker">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={option === value ? 'selected' : ''}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {(lowLabel || highLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="confidence-tag">{lowLabel}</span>
          <span className="confidence-tag">{highLabel}</span>
        </div>
      )}
    </div>
  )
}
