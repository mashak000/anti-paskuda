export default function Attention({ text }: { text: string }) {
  return (
    <div className="flex gap-2 mt-3">
      <span className="attention-symbol">!</span>
      <p className="text-retro-disabled-text">{text}</p>
    </div>
  );
}
