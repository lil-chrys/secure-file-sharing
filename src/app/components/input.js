export default function Input({ type, onChange }) {
    return (
      <input
        type={type}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded"
      />
    );
  }