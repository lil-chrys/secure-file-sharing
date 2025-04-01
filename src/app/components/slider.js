export default function Slider({ min, max, value, onValueChange }) {
    return (
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="w-full"
      />
    );
  }