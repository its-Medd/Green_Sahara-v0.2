function UploadBox({ label, onFile, preview }) {
  return (
    <div className="card p-3.5 border-dashed">
      <p className="text-sm font-semibold">{label}</p>
      {preview ? <img src={preview} alt="preview" className="mt-2 h-44 w-full rounded-xl object-cover" /> : null}
      <label className="btn-secondary mt-3 cursor-pointer text-xs">
        Upload image
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
      </label>
    </div>
  );
}

export default UploadBox;

